const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CreditLimit = require('../models/CreditLimit');

/**
 * @route   GET /api/v1/credit-card
 * @desc    Get user's e-credit card
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const creditCard = await CreditLimit.findByUserId(req.user.id);
    res.json(creditCard);
  } catch (error) {
    console.error('Error fetching credit card:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/credit-card/purchase
 * @desc    Make a purchase using credit
 * @access  Private
 */
router.post('/purchase', protect, async (req, res) => {
  try {
    const { amount, description, bill_payment_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const transaction = await CreditLimit.useCredit(
      req.user.id,
      parseFloat(amount),
      description || 'Purchase',
      bill_payment_id
    );

    // Award XP
    try {
      const Avatar = require('../models/Avatar');
      await Avatar.addExperience(req.user.id, 10, 'Credit card usage');
    } catch (e) {
      console.log('XP award failed');
    }

    res.json({
      message: 'Purchase successful',
      transaction
    });
  } catch (error) {
    console.error('Error making purchase:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/v1/credit-card/payment
 * @desc    Make payment to credit card
 * @access  Private
 */
router.post('/payment', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Payment should come from wallet
    const Wallet = require('../models/Wallet');
    const wallet = await Wallet.findByUserId(req.user.id);
    
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    await Wallet.deductMoney(req.user.id, amount, 'Credit card payment', `CCP${Date.now()}`);

    // Add to credit
    const transaction = await CreditLimit.makePayment(req.user.id, parseFloat(amount));

    res.json({
      message: 'Payment successful',
      transaction
    });
  } catch (error) {
    console.error('Error making payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/v1/credit-card/transactions
 * @desc    Get credit card transactions
 * @access  Private
 */
router.get('/transactions', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await CreditLimit.getTransactions(req.user.id, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/credit-card/stats
 * @desc    Get credit card statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await CreditLimit.getStatistics(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/credit-card/calculate-limit
 * @desc    Calculate credit limit based on payment history
 * @access  Private
 */
router.post('/calculate-limit', protect, async (req, res) => {
  try {
    const calculatedLimit = await CreditLimit.calculateLimit(req.user.id);
    const current = await CreditLimit.findByUserId(req.user.id);

    res.json({
      currentLimit: current.total_limit,
      calculatedLimit,
      eligible: calculatedLimit > current.total_limit,
      message: calculatedLimit > current.total_limit 
        ? `You're eligible for limit increase to ₹${calculatedLimit}!`
        : 'Keep making timely payments to increase your limit.'
    });
  } catch (error) {
    console.error('Error calculating limit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/credit-card/request-limit-increase
 * @desc    Request credit limit increase
 * @access  Private
 */
router.post('/request-limit-increase', protect, async (req, res) => {
  try {
    const calculatedLimit = await CreditLimit.calculateLimit(req.user.id);
    const current = await CreditLimit.findByUserId(req.user.id);

    if (calculatedLimit <= current.total_limit) {
      return res.status(400).json({ 
        message: 'Not eligible for limit increase yet. Complete more loans with on-time payments.' 
      });
    }

    // Update limit
    const updated = await CreditLimit.updateLimit(req.user.id, calculatedLimit);

    res.json({
      message: `Congratulations! Your credit limit increased to ₹${calculatedLimit}`,
      creditCard: updated
    });
  } catch (error) {
    console.error('Error requesting limit increase:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/credit-card/apply-interest (CRON job endpoint)
 * @desc    Apply daily interest (should be called by cron job)
 * @access  Private (Admin only)
 */
router.post('/apply-interest', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await CreditLimit.applyDailyInterest(req.user.id);
    
    if (!result) {
      return res.json({ message: 'No outstanding balance' });
    }

    res.json({
      message: 'Interest applied',
      ...result
    });
  } catch (error) {
    console.error('Error applying interest:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
