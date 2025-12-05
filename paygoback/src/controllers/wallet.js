const Wallet = require('../models/wallet');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require('crypto');
const blockchainService = require('../services/blockchainService');

// Generate PayGo UID
const generatePayGoUID = (userId, vendorId = null) => {
  const base = vendorId ? `${userId}_${vendorId}` : userId;
  return crypto.createHash('sha256').update(base).digest('hex').substring(0, 16);
};

// 📥 Deposit
exports.depositFunds = async (req, res) => {
  const { amount, token } = req.body;

  if (!amount || !token) {
    return res.status(400).json({ msg: 'Amount and token are required' });
  }

  try {
    // Get token address from token symbol
    const tokens = blockchainService.getSupportedTokens();
    let tokenAddress;

    switch (token.toUpperCase()) {
      case 'ETH':
      case 'NATIVE':
        tokenAddress = tokens.NATIVE;
        break;
      case 'USDC':
        tokenAddress = tokens.USDC;
        break;
      case 'USDT':
        tokenAddress = tokens.USDT;
        break;
      default:
        return res.status(400).json({ msg: 'Unsupported token' });
    }

    // Check if token is supported on blockchain
    const isSupported = await blockchainService.isTokenSupported(tokenAddress);
    if (!isSupported) {
      return res.status(400).json({ msg: 'Token not supported on blockchain' });
    }

    // Deposit to blockchain escrow vault
    const result = await blockchainService.depositFunds(req.user.userId, tokenAddress, amount);

    // Update local database for tracking
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $push: {
          transactions: {
            type: 'deposit',
            amount,
            token,
            blockchainTx: result.txHash,
            status: 'confirmed'
          }
        },
        $setOnInsert: { paygoUID: generatePayGoUID(req.user.userId) }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: 'Deposit successful',
      wallet,
      paygoUID: wallet.paygoUID,
      blockchainTx: result.txHash
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ msg: 'Deposit failed', error: error.message });
  }
};

// 📤 Withdraw
exports.withdrawFunds = async (req, res) => {
  const { amount, token, toAddress } = req.body;

  if (!amount || !token || !toAddress) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  const wallet = await Wallet.findOne({ userId: req.user.userId });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ msg: 'Insufficient balance' });
  }

  wallet.balance -= amount;
  wallet.transactions.push({ type: 'withdraw', amount, token, toAddress });
  await wallet.save();

  res.status(200).json({ msg: 'Withdrawal successful', wallet });
};

// 💳 Charge for session usage (PAYG micro-billing - Only for normal users)
exports.chargeSession = async (req, res) => {
  // ✅ Only normal users can be charged for sessions
  if (req.user.role !== 'user') {
    return res.status(403).json({
      msg: 'Access denied. Only normal users can be charged for sessions.',
      userRole: req.user.role
    });
  }

  const { sessionId, serviceId } = req.body;

  if (!sessionId || !serviceId) {
    return res.status(400).json({ msg: 'Session ID and service ID are required' });
  }

  try {
    // Start session on blockchain
    const sessionResult = await blockchainService.startSession(sessionId, req.user.userId, serviceId);

    // Get service details for local tracking
    const serviceDetails = await blockchainService.getService(serviceId);

    // Update local database for tracking
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $push: {
          transactions: {
            type: 'session_start',
            sessionId,
            serviceId,
            serviceType: 'streaming', // Default for now
            blockchainTx: sessionResult.txHash,
            status: 'active'
          }
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: 'Session started successfully',
      sessionId,
      userRole: req.user.role,
      blockchainTx: sessionResult.txHash,
      service: serviceDetails
    });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ msg: 'Failed to start session', error: error.message });
  }
};

// 🆔 Get PayGo UID (Available for all authenticated users)
exports.getPayGoUID = async (req, res) => {
  let wallet = await Wallet.findOne({ userId: req.user.userId });
  
  if (!wallet) {
    wallet = await Wallet.create({
      userId: req.user.userId,
      paygoUID: generatePayGoUID(req.user.userId)
    });
  } else if (!wallet.paygoUID) {
    wallet.paygoUID = generatePayGoUID(req.user.userId);
    await wallet.save();
  }

  res.status(200).json({ 
    paygoUID: wallet.paygoUID,
    userRole: req.user.role,
    canStartStreams: req.user.role === 'user'
  });
};

// 💰 Balance
exports.getBalance = async (req, res) => {
  try {
    // Get balance from blockchain escrow vault
    const blockchainBalance = await blockchainService.getUserBalance(req.user.userId);

    // Also get local database balance for comparison/tracking
    const wallet = await Wallet.findOne({ userId: req.user.userId });
    const localBalance = wallet ? wallet.balance : 0;

    res.status(200).json({
      balance: parseFloat(blockchainBalance),
      localBalance: localBalance,
      source: 'blockchain'
    });
  } catch (error) {
    console.error('Balance check error:', error);
    // Fallback to local balance if blockchain fails
    const wallet = await Wallet.findOne({ userId: req.user.userId });
    res.status(200).json({
      balance: wallet ? wallet.balance : 0,
      source: 'local',
      error: 'Blockchain unavailable'
    });
  }
};

// 🔍 Transaction by hash
exports.getTransaction = async (req, res) => {
  const { txHash } = req.params;
  const wallet = await Wallet.findOne({ userId: req.user.userId, 'transactions.transactionHash': txHash });

  if (!wallet) return res.status(404).json({ msg: 'Transaction not found' });

  const tx = wallet.transactions.find(tx => tx.transactionHash === txHash);
  res.status(200).json(tx);
};

// ✅ Approve spending
exports.approveSpending = async (req, res) => {
  const { amount, token } = req.body;
  if (!amount || !token) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  // This is just a placeholder. In real blockchain integration, you’d call a smart contract here.
  res.status(200).json({ msg: `Approved ${amount} ${token} for spending.` });
};

// 🪙 Supported tokens
exports.getSupportedTokens = async (req, res) => {
  const tokens = blockchainService.getSupportedTokens();
  const supportedTokens = Object.keys(tokens).map(key => {
    switch (key) {
      case 'NATIVE': return 'ETH';
      case 'USDC': return 'USDC';
      case 'USDT': return 'USDT';
      default: return key;
    }
  });
  res.status(200).json({ supportedTokens });
};

// 🛑 End session and process payment
exports.endSession = async (req, res) => {
  const { sessionId, reason } = req.body;

  if (!sessionId) {
    return res.status(400).json({ msg: 'Session ID is required' });
  }

  try {
    // End session on blockchain (this will process payment)
    const result = await blockchainService.endSession(sessionId, reason || 'completed');

    // Update local database
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user.userId, 'transactions.sessionId': sessionId },
      {
        $set: {
          'transactions.$.status': 'completed',
          'transactions.$.minutesUsed': result.minutesUsed,
          'transactions.$.totalCharged': result.totalCharged
        }
      },
      { new: true }
    );

    res.status(200).json({
      msg: 'Session ended successfully',
      sessionId,
      minutesUsed: result.minutesUsed,
      totalCharged: result.totalCharged,
      blockchainTx: result.txHash
    });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ msg: 'Failed to end session', error: error.message });
  }
};

// 📊 Get spending analytics
exports.getSpendingAnalytics = async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user.userId });
  if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todaySpend = wallet.transactions
    .filter(tx => tx.type === 'charge' && tx.createdAt >= new Date(today.setHours(0,0,0,0)))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthSpend = wallet.transactions
    .filter(tx => tx.type === 'charge' && tx.createdAt >= thisMonth)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const serviceBreakdown = wallet.transactions
    .filter(tx => tx.type === 'charge')
    .reduce((acc, tx) => {
      const service = tx.serviceType || 'Unknown';
      acc[service] = (acc[service] || 0) + tx.amount;
      return acc;
    }, {});

  const servicesUsed = Object.keys(serviceBreakdown).length;

  const chargeTransactions = wallet.transactions.filter(tx => tx.type === 'charge' && tx.duration);
  const avgUsageTime = chargeTransactions.length > 0
    ? chargeTransactions.reduce((sum, tx) => sum + (tx.duration || 0), 0) / chargeTransactions.length
    : 0;

  // Monthly spending chart data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthSpendChart = wallet.transactions
      .filter(tx => tx.type === 'charge' && tx.createdAt >= monthStart && tx.createdAt <= monthEnd)
      .reduce((sum, tx) => sum + tx.amount, 0);
    monthlyData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      amount: monthSpendChart
    });
  }

  // Top services chart data
  const topServices = Object.entries(serviceBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([service, amount]) => ({ service, amount }));

  // Usage over time (last 7 days)
  const usageData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0,0,0,0));
    const dayEnd = new Date(date.setHours(23,59,59,999));
    const dayUsage = wallet.transactions
      .filter(tx => tx.type === 'charge' && tx.createdAt >= dayStart && tx.createdAt <= dayEnd)
      .reduce((sum, tx) => sum + (tx.duration || 0), 0);
    usageData.push({
      date: date.toISOString().split('T')[0],
      usage: dayUsage
    });
  }

  res.status(200).json({
    totalSpending: monthSpend,
    servicesUsed,
    avgUsageTime,
    todaySpend,
    monthSpend,
    serviceBreakdown,
    totalBalance: wallet.balance,
    chartData: {
      monthlySpending: monthlyData,
      topServices,
      usageOverTime: usageData
    }
  });
};

// 🔄 Transfer funds to another user
exports.transferFunds = async (req, res) => {
  const { amount, token, recipientId } = req.body;

  if (!amount || !token || !recipientId) {
    return res.status(400).json({ msg: 'Amount, token, and recipient ID are required' });
  }

  const senderWallet = await Wallet.findOne({ userId: req.user.userId });
  if (!senderWallet || senderWallet.balance < amount) {
    return res.status(400).json({ msg: 'Insufficient balance' });
  }

  const recipientWallet = await Wallet.findOneAndUpdate(
    { userId: recipientId },
    {
      $inc: { balance: amount },
      $push: { transactions: { type: 'received', amount, token, fromUser: req.user.userId } }
    },
    { new: true, upsert: true }
  );

  senderWallet.balance -= amount;
  senderWallet.transactions.push({ type: 'transfer', amount, token, toUser: recipientId });
  await senderWallet.save();

  res.status(200).json({ msg: 'Transfer successful', remainingBalance: senderWallet.balance });
};

// 📋 Get all transactions
exports.getTransactions = async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user.userId });
  if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

  res.status(200).json({ transactions: wallet.transactions });
};

// 🏠 Get wallet address (PayGo UID)
exports.getAddress = async (req, res) => {
  let wallet = await Wallet.findOne({ userId: req.user.userId });

  if (!wallet) {
    wallet = await Wallet.create({
      userId: req.user.userId,
      paygoUID: generatePayGoUID(req.user.userId)
    });
  } else if (!wallet.paygoUID) {
    wallet.paygoUID = generatePayGoUID(req.user.userId);
    await wallet.save();
  }

  res.status(200).json({ address: wallet.paygoUID });
};

// 🔄 Auto swap (placeholder)
exports.autoSwap = async (req, res) => {
  const { fromToken, toToken, amount } = req.body;

  // Placeholder logic - in real implementation, integrate with swap service
  res.status(200).json({ msg: `Swapped ${amount} ${fromToken} to ${toToken}` });
};

// 🛡️ Zcash Wallet Endpoints

// Get Zcash wallet balance
exports.getZcashBalance = async (req, res) => {
  try {
    const User = require('../models/Users');
    const user = await User.findByPk(req.user.userId);

    if (!user || !user.zcashAddress) {
      return res.status(404).json({ msg: 'Zcash wallet not found' });
    }

    const balance = await zcashService.getBalance(user.zcashAddress);

    res.status(200).json({
      address: user.zcashAddress,
      balance: balance.balance,
      confirmed: balance.confirmed,
      unconfirmed: balance.unconfirmed
    });
  } catch (error) {
    console.error('Zcash balance error:', error);
    res.status(500).json({ msg: 'Failed to get Zcash balance', error: error.message });
  }
};

// Get Zcash wallet transactions
exports.getZcashTransactions = async (req, res) => {
  try {
    const User = require('../models/Users');
    const user = await User.findByPk(req.user.userId);

    if (!user || !user.zcashAddress) {
      return res.status(404).json({ msg: 'Zcash wallet not found' });
    }

    const transactions = await zcashService.getTransactions(user.zcashAddress);

    res.status(200).json({
      address: user.zcashAddress,
      transactions
    });
  } catch (error) {
    console.error('Zcash transactions error:', error);
    res.status(500).json({ msg: 'Failed to get Zcash transactions', error: error.message });
  }
};

// Get Zcash wallet info
exports.getZcashWallet = async (req, res) => {
  try {
    const User = require('../models/Users');
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({
      address: user.zcashAddress,
      accountIndex: user.zcashAccountIndex,
      isSynced: user.isSynced,
      lastSyncHeight: user.lastSyncHeight,
      hasWallet: !!user.zcashAddress
    });
  } catch (error) {
    console.error('Zcash wallet info error:', error);
    res.status(500).json({ msg: 'Failed to get Zcash wallet info', error: error.message });
  }
};
