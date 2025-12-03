const express = require('express');
const router = express.Router();
const {
  depositFunds,
  withdrawFunds,
  getBalance,
  getTransaction,
  approveSpending,
  getSupportedTokens,
  chargeSession,
  endSession,
  getPayGoUID,
  getSpendingAnalytics,
  transferFunds,
  getTransactions,
  getAddress,
  autoSwap
} = require('../controllers/wallet');

const authenticateUser = require('../middleware/authentication');

// Deposit funds
router.post('/deposit', authenticateUser, depositFunds);

// Withdraw funds
router.post('/withdraw', authenticateUser, withdrawFunds);

// Get wallet balance
router.get('/balance', authenticateUser, getBalance);

// Get transaction by hash
router.get('/transaction/:txHash', authenticateUser, getTransaction);

// Approve spending limit
router.post('/approve-spending', authenticateUser, approveSpending);

// Supported tokens
router.get('/supported-tokens', getSupportedTokens);

// PayGo specific routes
router.post('/charge-session', authenticateUser, chargeSession);
router.post('/end-session', authenticateUser, endSession);
router.get('/paygo-uid', authenticateUser, getPayGoUID);
router.get('/analytics', authenticateUser, getSpendingAnalytics);

// Transfer funds
router.post('/transfer', authenticateUser, transferFunds);

// Get all transactions
router.get('/transactions', authenticateUser, getTransactions);

// Get wallet address
router.get('/address', authenticateUser, getAddress);

// Auto swap
router.post('/swap', authenticateUser, autoSwap);

module.exports = router;
