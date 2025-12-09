const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');

// @route   POST /api/v1/payments
// @desc    Create a new payment
// @access  Private
router.post(
  '/',
  protect,
  [
    body('loan_id').isInt().withMessage('Valid loan ID required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('transaction_id').notEmpty().withMessage('Transaction ID required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const payment = await Payment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  })
);

// @route   GET /api/v1/payments/loan/:loanId
// @desc    Get all payments for a loan
// @access  Private
router.get('/loan/:loanId', protect, asyncHandler(async (req, res) => {
  const payments = await Payment.findByLoanId(req.params.loanId);

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
}));

// @route   GET /api/v1/payments/user
// @desc    Get all payments for current user
// @access  Private
router.get('/user', protect, asyncHandler(async (req, res) => {
  const payments = await Payment.findByUserId(req.user.id);

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
}));

// @route   GET /api/v1/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
}));

module.exports = router;
