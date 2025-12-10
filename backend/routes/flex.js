const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const FlexSubscription = require('../models/FlexSubscription');

/**
 * @route   GET /api/v1/flex/pricing
 * @desc    Get Flex+ pricing plans
 * @access  Public
 */
router.get('/pricing', async (req, res) => {
  try {
    const plans = await FlexSubscription.getPricingPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/v1/flex/subscribe
 * @desc    Subscribe to Flex+ membership
 * @access  Private
 */
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { 
      duration_months = 1, 
      payment_method, 
      transaction_id,
      auto_renewal = false 
    } = req.body;

    // Validate duration and calculate amount
    let amount_paid = 99;
    if (duration_months === 3) amount_paid = 249;
    else if (duration_months === 12) amount_paid = 899;
    else if (duration_months !== 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid duration. Choose 1, 3, or 12 months' 
      });
    }

    // Check if user already has active subscription
    const existingSub = await FlexSubscription.getActiveSubscription(req.user.id);
    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active Flex+ subscription',
        data: existingSub
      });
    }

    // Create subscription
    const subscription = await FlexSubscription.create({
      user_id: req.user.id,
      duration_months,
      amount_paid,
      payment_method,
      transaction_id,
      auto_renewal
    });

    res.status(201).json({
      success: true,
      message: 'Flex+ subscription activated successfully! 🎉',
      data: subscription,
      benefits: {
        free_delays: true,
        delay_fee_discount: '100% OFF',
        extra_interest: 'Waived',
        priority_support: true,
        savings_per_delay: '₹10-30'
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/v1/flex/my-subscription
 * @desc    Get user's active subscription
 * @access  Private
 */
router.get('/my-subscription', protect, async (req, res) => {
  try {
    const subscription = await FlexSubscription.getActiveSubscription(req.user.id);
    
    if (!subscription) {
      return res.json({
        success: true,
        has_subscription: false,
        message: 'No active Flex+ subscription. Subscribe for just ₹99/month!'
      });
    }

    res.json({
      success: true,
      has_subscription: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/v1/flex/history
 * @desc    Get user's subscription history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const subscriptions = await FlexSubscription.getUserSubscriptions(req.user.id);
    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/v1/flex/cancel/:id
 * @desc    Cancel Flex+ subscription
 * @access  Private
 */
router.post('/cancel/:id', protect, async (req, res) => {
  try {
    const subscription = await FlexSubscription.cancel(req.params.id, req.user.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/v1/flex/renew
 * @desc    Renew Flex+ subscription
 * @access  Private
 */
router.post('/renew', protect, async (req, res) => {
  try {
    const { duration_months = 1 } = req.body;

    const subscription = await FlexSubscription.renew(req.user.id, duration_months);

    res.json({
      success: true,
      message: 'Flex+ subscription renewed successfully! 🎉',
      data: subscription
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/v1/flex/stats
 * @desc    Get Flex+ statistics (admin)
 * @access  Private/Admin
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await FlexSubscription.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/v1/flex/check-status
 * @desc    Check if user has active Flex+ subscription
 * @access  Private
 */
router.get('/check-status', protect, async (req, res) => {
  try {
    const hasActive = await FlexSubscription.hasActiveSubscription(req.user.id);
    
    res.json({
      success: true,
      has_flex_plus: hasActive,
      message: hasActive 
        ? 'You have active Flex+ membership' 
        : 'Subscribe to Flex+ for free EMI delays'
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
