const crypto = require('crypto');
const Wallet = require('../models/wallet');

class WalletService {
  // Generate Zcash shielded address (placeholder - requires zcashd RPC)
  static async generateZcashAddress() {
    // In production, this would call zcashd RPC: z_getnewaddress
    return 'zs1' + crypto.randomBytes(32).toString('hex');
  }

  // Generate ERC20 wallet address (placeholder)
  static async generateERC20Address() {
    // In production, this would generate actual Ethereum address
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  // Auto-create wallet with crypto addresses
  static async createWallet(userId) {
    const paygoUID = crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 16);
    const zcashAddress = await this.generateZcashAddress();
    const erc20Address = await this.generateERC20Address();

    const wallet = await Wallet.create({
      userId,
      paygoUID,
      zcashAddress,
      erc20Address,
      balance: 0
    });

    return wallet;
  }

  // Check balance and return low balance warning
  static checkLowBalance(balance, threshold = 20) {
    return {
      isLow: balance <= threshold,
      percentage: threshold,
      remaining: balance
    };
  }

  // Calculate session cost based on rate and duration
  static calculateSessionCost(rate, duration, serviceType = 'streaming') {
    // Rate is per minute, duration in minutes
    const baseCost = rate * duration;
    
    // Apply service-specific multipliers if needed
    const multipliers = {
      streaming: 1.0,
      consultation: 1.2,
      saas: 0.8,
      data: 1.1
    };

    return baseCost * (multipliers[serviceType] || 1.0);
  }

  // SDK integration - validate UID and process payment
  static async processSDKPayment(paygoUID, serviceId, usageMetrics) {
    const wallet = await Wallet.findOne({ paygoUID });
    
    if (!wallet) {
      return { success: false, error: 'Invalid PayGo UID' };
    }

    const cost = this.calculateSessionCost(
      usageMetrics.rate, 
      usageMetrics.duration, 
      usageMetrics.serviceType
    );

    if (wallet.balance < cost) {
      return { 
        success: false, 
        error: 'Insufficient balance',
        required: cost,
        available: wallet.balance
      };
    }

    // Deduct balance and record transaction
    wallet.balance -= cost;
    wallet.transactions.push({
      type: 'charge',
      amount: cost,
      token: 'PAYG',
      sessionId: usageMetrics.sessionId,
      serviceType: usageMetrics.serviceType,
      rate: usageMetrics.rate,
      duration: usageMetrics.duration
    });

    await wallet.save();

    return {
      success: true,
      transactionId: wallet.transactions[wallet.transactions.length - 1]._id,
      remainingBalance: wallet.balance,
      isLowBalance: this.checkLowBalance(wallet.balance).isLow
    };
  }
}

module.exports = WalletService;