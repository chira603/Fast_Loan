const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const BillPayment = require('../models/BillPayment');
const Wallet = require('../models/Wallet');

/**
 * @route   POST /api/v1/bills/pay
 * @desc    Pay a bill
 * @access  Private
 */
router.post('/pay', protect, async (req, res) => {
  try {
    const {
      service_type,
      service_provider,
      consumer_number,
      amount,
      bill_date,
      due_date,
      payment_method
    } = req.body;

    // Validate input
    if (!service_type || !service_provider || !consumer_number || !amount || !payment_method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create bill payment record
    const billPayment = await BillPayment.create({
      user_id: req.user.id,
      service_type,
      service_provider,
      consumer_number,
      amount,
      bill_date,
      due_date,
      paid_from: payment_method
    });

    // Process payment
    const result = await BillPayment.processPayment(
      billPayment.id,
      payment_method
    );

    // Award XP for bill payment
    try {
      const Avatar = require('../models/Avatar');
      await Avatar.addExperience(req.user.id, 25, 'Bill payment');
    } catch (e) {
      console.log('XP award failed:', e.message);
    }

    res.json({
      message: 'Bill paid successfully',
      bill: billPayment,
      result
    });
  } catch (error) {
    console.error('Error paying bill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/v1/bills
 * @desc    Get user's bill payment history
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const bills = await BillPayment.findByUserId(req.user.id, limit);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/bills/stats
 * @desc    Get bill payment statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await BillPayment.getStatistics(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/bills/saved-billers
 * @desc    Get frequently used billers
 * @access  Private
 */
router.get('/saved-billers', protect, async (req, res) => {
  try {
    const billers = await BillPayment.getSavedBillers(req.user.id);
    res.json(billers);
  } catch (error) {
    console.error('Error fetching saved billers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/bills/service/:serviceType
 * @desc    Get bills by service type
 * @access  Private
 */
router.get('/service/:serviceType', protect, async (req, res) => {
  try {
    const bills = await BillPayment.findByServiceType(req.user.id, req.params.serviceType);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills by service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/bills/:id
 * @desc    Get bill details
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await BillPayment.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/bills/recharge/mobile
 * @desc    Mobile recharge (quick action)
 * @access  Private
 */
router.post('/recharge/mobile', protect, async (req, res) => {
  try {
    const { mobile_number, operator, amount, payment_method } = req.body;

    if (!mobile_number || !operator || !amount || !payment_method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate mobile number (basic)
    if (!/^[6-9]\d{9}$/.test(mobile_number)) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    const billPayment = await BillPayment.create({
      user_id: req.user.id,
      service_type: 'mobile',
      service_provider: operator,
      consumer_number: mobile_number,
      amount,
      paid_from: payment_method
    });

    const result = await BillPayment.processPayment(billPayment.id, payment_method);

    // Award XP
    try {
      const Avatar = require('../models/Avatar');
      await Avatar.addExperience(req.user.id, 25, 'Mobile recharge');
    } catch (e) {
      console.log('XP award failed');
    }

    res.json({
      message: 'Recharge successful',
      bill: billPayment,
      result
    });
  } catch (error) {
    console.error('Error processing recharge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/v1/bills/providers/:serviceType
 * @desc    Get service providers for a service type
 * @access  Private
 */
router.get('/providers/:serviceType', protect, async (req, res) => {
  try {
    const { serviceType } = req.params;

    // In production, fetch from BBPS API
    // For now, return static data
    const providers = {
      mobile: ['Airtel', 'Jio', 'Vi', 'BSNL'],
      electricity: ['BSES', 'Adani Power', 'Tata Power', 'MSEB'],
      water: ['Mumbai Water', 'Delhi Jal Board', 'Bangalore Water Supply'],
      gas: ['Indraprastha Gas', 'Mahanagar Gas', 'Gujarat Gas'],
      dth: ['Tata Sky', 'Dish TV', 'Airtel Digital TV', 'Sun Direct'],
      broadband: ['Airtel Fiber', 'Jio Fiber', 'ACT Fibernet', 'BSNL'],
      insurance: ['LIC', 'HDFC Life', 'ICICI Prudential', 'SBI Life']
    };

    res.json(providers[serviceType] || []);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
