const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wallet = require('../models/Wallet');

/**
 * @route   GET /api/v1/wallet
 * @desc    Get user's wallet
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.id);
    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/wallet/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get('/balance', protect, async (req, res) => {
  try {
    const balance = await Wallet.getBalance(req.user.id);
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/wallet/add-money
 * @desc    Add money to wallet
 * @access  Private
 */
router.post('/add-money', protect, async (req, res) => {
  try {
    const { amount, payment_method, transaction_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // In production, verify payment with payment gateway
    // For now, simulate successful payment

    const transaction = await Wallet.addMoney(
      req.user.id,
      parseFloat(amount),
      `Added via ${payment_method || 'UPI'}`,
      transaction_id
    );

    res.json({
      message: 'Money added successfully',
      transaction,
      newBalance: transaction.balance_after
    });
  } catch (error) {
    console.error('Error adding money:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/v1/wallet/send
 * @desc    Send money to another user
 * @access  Private
 */
router.post('/send', protect, async (req, res) => {
  try {
    const { to_user_id, amount, description } = req.body;

    if (!to_user_id || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    if (to_user_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot send money to yourself' });
    }

    const result = await Wallet.sendMoney(
      req.user.id,
      to_user_id,
      parseFloat(amount),
      description || 'Money transfer'
    );

    res.json({
      message: 'Money sent successfully',
      referenceId: result.referenceId,
      newBalance: result.fromBalance
    });
  } catch (error) {
    console.error('Error sending money:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/v1/wallet/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/transactions', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await Wallet.getTransactions(req.user.id, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/v1/wallet/upi
 * @desc    Update UPI ID
 * @access  Private
 */
router.put('/upi', protect, async (req, res) => {
  try {
    const { upi_id } = req.body;

    if (!upi_id) {
      return res.status(400).json({ message: 'UPI ID required' });
    }

    // Validate UPI ID format (basic)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upi_id)) {
      return res.status(400).json({ message: 'Invalid UPI ID format' });
    }

    const wallet = await Wallet.updateUpiId(req.user.id, upi_id);
    res.json({ message: 'UPI ID updated successfully', wallet });
  } catch (error) {
    console.error('Error updating UPI:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/wallet/withdraw
 * @desc    Withdraw money to bank account
 * @access  Private
 */
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, bank_account, ifsc_code } = req.body;

    if (!amount || amount <= 0 || !bank_account || !ifsc_code) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Minimum withdrawal: ₹100
    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹100' });
    }

    const transaction = await Wallet.deductMoney(
      req.user.id,
      parseFloat(amount),
      `Withdrawal to ${bank_account}`,
      `WTDR${Date.now()}`
    );

    res.json({
      message: 'Withdrawal request submitted. Money will be transferred in 1-2 business days.',
      transaction,
      newBalance: transaction.balance_after
    });
  } catch (error) {
    console.error('Error withdrawing money:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
