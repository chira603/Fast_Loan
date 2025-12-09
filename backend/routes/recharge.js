const express = require('express');
const router = express.Router();
const Recharge = require('../models/Recharge');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/validation');
const bbpsService = require('../services/bbpsService');

// @route   POST /api/v1/recharge/detect-operator
// @desc    Detect mobile operator from number
// @access  Private
router.post('/detect-operator', protect, asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit mobile number'
    });
  }

  const result = await bbpsService.detectOperator(mobile);

  res.status(200).json({
    success: true,
    data: result
  });
}));

// @route   GET /api/v1/recharge/plans
// @desc    Get recharge plans for operator
// @access  Private
router.get('/plans', protect, asyncHandler(async (req, res) => {
  const { operator, circle } = req.query;

  if (!operator) {
    return res.status(400).json({
      success: false,
      message: 'Operator is required'
    });
  }

  const result = await bbpsService.getRechargePlans(operator, circle);

  res.status(200).json({
    success: true,
    data: result
  });
}));

// @route   GET /api/v1/recharge/dth-operators
// @desc    Get DTH operators
// @access  Private
router.get('/dth-operators', protect, asyncHandler(async (req, res) => {
  const result = await bbpsService.getDTHOperators();

  res.status(200).json({
    success: true,
    data: result.operators
  });
}));

// @route   GET /api/v1/recharge/dth-plans
// @desc    Get DTH plans for operator
// @access  Private
router.get('/dth-plans', protect, asyncHandler(async (req, res) => {
  const { operator } = req.query;

  if (!operator) {
    return res.status(400).json({
      success: false,
      message: 'Operator is required'
    });
  }

  const result = await bbpsService.getDTHPlans(operator);

  res.status(200).json({
    success: true,
    data: result
  });
}));

// @route   POST /api/v1/recharge/mobile
// @desc    Process mobile recharge
// @access  Private
router.post('/mobile', protect, asyncHandler(async (req, res) => {
  const { mobile, operator, circle, planId, amount, planDetails } = req.body;

  // Validate input
  if (!mobile || !operator || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number, operator, and amount are required'
    });
  }

  // Process recharge through BBPS service
  const bbpsResult = await bbpsService.processMobileRecharge({
    mobile,
    operator,
    circle,
    planId,
    amount
  });

  if (!bbpsResult.success) {
    return res.status(400).json({
      success: false,
      message: bbpsResult.message || 'Recharge failed'
    });
  }

  // Save to database
  const recharge = await Recharge.create({
    user_id: req.user.id,
    recharge_type: 'MOBILE',
    operator_name: operator,
    circle,
    mobile_number: mobile,
    amount,
    plan_id: planId,
    plan_details: planDetails,
    status: 'success',
    transaction_id: bbpsResult.transactionId,
    operator_transaction_id: bbpsResult.operatorTransactionId
  });

  res.status(201).json({
    success: true,
    message: 'Mobile recharge successful',
    data: recharge
  });
}));

// @route   POST /api/v1/recharge/dth
// @desc    Process DTH recharge
// @access  Private
router.post('/dth', protect, asyncHandler(async (req, res) => {
  const { operator, accountNumber, amount, planId, planDetails } = req.body;

  // Validate input
  if (!operator || !accountNumber || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Operator, account number, and amount are required'
    });
  }

  // Process recharge through BBPS service (using same mobile recharge for demo)
  const bbpsResult = await bbpsService.processMobileRecharge({
    mobile: accountNumber,
    operator,
    amount
  });

  if (!bbpsResult.success) {
    return res.status(400).json({
      success: false,
      message: bbpsResult.message || 'Recharge failed'
    });
  }

  // Save to database
  const recharge = await Recharge.create({
    user_id: req.user.id,
    recharge_type: 'DTH',
    operator_name: operator,
    account_number: accountNumber,
    amount,
    plan_id: planId,
    plan_details: planDetails,
    status: 'success',
    transaction_id: bbpsResult.transactionId,
    operator_transaction_id: bbpsResult.operatorTransactionId
  });

  res.status(201).json({
    success: true,
    message: 'DTH recharge successful',
    data: recharge
  });
}));

// @route   GET /api/v1/recharge/history
// @desc    Get recharge history for user
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  const { type, limit } = req.query;

  const filters = {};
  if (type) filters.recharge_type = type.toUpperCase();
  if (limit) filters.limit = parseInt(limit);

  const recharges = await Recharge.findByUserId(req.user.id, filters);

  res.status(200).json({
    success: true,
    count: recharges.length,
    data: recharges
  });
}));

// @route   GET /api/v1/recharge/stats
// @desc    Get recharge statistics for user
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const stats = await Recharge.getStatsByUserId(req.user.id);

  res.status(200).json({
    success: true,
    data: stats
  });
}));

module.exports = router;
