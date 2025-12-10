const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const DelayRequest = require('../models/DelayRequest');
const Loan = require('../models/Loan');

/**
 * @route   POST /api/v1/delays
 * @desc    Request EMI delay
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { loan_id, emi_month, delay_days, reason } = req.body;

    // Validate input
    if (!loan_id || !emi_month || !delay_days) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Enforce 1-2 days limit
    const delayDaysInt = parseInt(delay_days);
    if (delayDaysInt < 1 || delayDaysInt > 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Delay days must be 1 or 2 days only' 
      });
    }

    // Get loan details
    const loan = await Loan.findById(loan_id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Verify loan belongs to user
    if (loan.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get EMI from repayment schedule
    const schedule = loan.repayment_schedule;
    const emi = schedule.find(s => s.month === parseInt(emi_month));

    if (!emi) {
      return res.status(404).json({ message: 'EMI not found in schedule' });
    }

    // Check if EMI is already paid or delayed too many times
    if (emi.status === 'paid') {
      return res.status(400).json({ message: 'EMI already paid' });
    }

    if (emi.delay_count >= 3) {
      return res.status(400).json({ message: 'Maximum delays reached for this EMI (3)' });
    }

    // Check if user has Flex+ subscription
    const FlexSubscription = require('../models/FlexSubscription');
    const hasFlexSubscription = await FlexSubscription.hasActiveSubscription(req.user.id);

    // Calculate delay charges (FREE for Flex+ members)
    let charges;
    try {
      charges = DelayRequest.calculateCharges(
        parseFloat(emi.amount),
        delayDaysInt,
        hasFlexSubscription
      );
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    // Track Flex+ usage if applicable
    if (hasFlexSubscription) {
      await FlexSubscription.trackDelayUsage(req.user.id);
    }

    // Calculate new due date (28-day cycle + delay days)
    const originalDueDate = new Date(emi.due_date);
    const newDueDate = new Date(originalDueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(delay_days));

    // Create delay request
    const delayRequest = await DelayRequest.create({
      loan_id,
      user_id: req.user.id,
      emi_month,
      original_due_date: emi.due_date,
      new_due_date: newDueDate.toISOString().split('T')[0],
      delay_fee: charges.delay_fee,
      extra_interest: charges.extra_interest,
      total_charge: charges.total_charge,
      reason
    });

    // Auto-approve (or can be manual approval by admin)
    const approved = await DelayRequest.approve(delayRequest.id);

    // Update loan's repayment schedule
    const updatedSchedule = schedule.map(s => {
      if (s.month === parseInt(emi_month)) {
        return {
          ...s,
          due_date: newDueDate.toISOString().split('T')[0],
          delay_count: (s.delay_count || 0) + 1,
          can_delay: (s.delay_count || 0) + 1 < 3
        };
      }
      return s;
    });

    await Loan.updateRepaymentSchedule(loan_id, updatedSchedule);

    res.status(201).json({
      success: true,
      message: hasFlexSubscription 
        ? '🎉 EMI delayed for FREE with Flex+ Membership!' 
        : 'EMI delay request approved',
      delay: approved,
      charges,
      flex_plus_member: hasFlexSubscription
    });
  } catch (error) {
    console.error('Error creating delay request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/v1/delays/user
 * @desc    Get user's delay requests
 * @access  Private
 */
router.get('/user', protect, async (req, res) => {
  try {
    const delays = await DelayRequest.findByUserId(req.user.id);
    const stats = await DelayRequest.getUserStats(req.user.id);
    
    res.json({ delays, stats });
  } catch (error) {
    console.error('Error fetching delays:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/v1/delays/loan/:loanId
 * @desc    Get delays for a specific loan
 * @access  Private
 */
router.get('/loan/:loanId', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const delays = await DelayRequest.findByLoanId(req.params.loanId);
    res.json(delays);
  } catch (error) {
    console.error('Error fetching loan delays:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/v1/delays/calculate-charges
 * @desc    Calculate delay charges (preview before requesting)
 * @access  Private
 */
router.post('/calculate-charges', protect, async (req, res) => {
  try {
    const { emi_amount, delay_days, has_flex_subscription } = req.body;

    if (!emi_amount || !delay_days) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const charges = DelayRequest.calculateCharges(
      parseFloat(emi_amount),
      parseInt(delay_days),
      has_flex_subscription || false
    );

    res.json(charges);
  } catch (error) {
    console.error('Error calculating charges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
