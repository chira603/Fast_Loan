const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');
const LoanPayment = require('../models/LoanPayment');
const Loan = require('../models/Loan');
const upiService = require('../services/upiService');

/**
 * @route   POST /api/v1/loan-payments/initiate
 * @desc    Initiate a loan payment (creates payment record and returns UPI link)
 * @access  Private
 */
router.post(
  '/initiate',
  protect,
  [
    body('loan_id').isInt().withMessage('Valid loan ID required'),
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
    body('payment_type').isIn(['emi', 'prepayment', 'closing']).withMessage('Invalid payment type'),
    body('upi_vpa').optional().custom(value => {
      if (value && !upiService.validateVPA(value)) {
        throw new Error('Invalid UPI VPA format');
      }
      return true;
    }),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { loan_id, amount, payment_type, upi_vpa, notes } = req.body;

    // Verify loan exists and belongs to user
    const loan = await Loan.findById(loan_id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this loan'
      });
    }

    // Check if loan is in correct status
    if (!['approved', 'disbursed'].includes(loan.status)) {
      return res.status(400).json({
        success: false,
        message: 'Loan is not in a payable state'
      });
    }

    // Generate payment intent
    const paymentIntent = upiService.createPaymentIntent({
      amount,
      type: payment_type.toUpperCase(),
      description: `Loan ${payment_type.toUpperCase()} - Loan #${loan_id}`,
      metadata: {
        loan_id,
        user_id: req.user.id
      }
    });

    // Create payment record in database
    const paymentRecord = await LoanPayment.create({
      loan_id,
      user_id: req.user.id,
      amount,
      payment_type,
      transaction_ref: paymentIntent.transactionRef,
      upi_vpa,
      status: 'pending',
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment_id: paymentRecord.id,
        transaction_ref: paymentIntent.transactionRef,
        upi_link: paymentIntent.upiLink,
        amount: upiService.formatAmount(amount),
        business_vpa: paymentIntent.businessVPA,
        business_name: paymentIntent.businessName,
        payment_type,
        supported_apps: upiService.getSupportedUPIApps()
      }
    });
  })
);

/**
 * @route   GET /api/v1/loan-payments/:id
 * @desc    Get payment details by ID
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const payment = await LoanPayment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this payment'
    });
  }

  res.json({
    success: true,
    data: payment
  });
}));

/**
 * @route   GET /api/v1/loan-payments/transaction/:ref
 * @desc    Get payment by transaction reference
 * @access  Private
 */
router.get('/transaction/:ref', protect, asyncHandler(async (req, res) => {
  const payment = await LoanPayment.findByTransactionRef(req.params.ref);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this payment'
    });
  }

  res.json({
    success: true,
    data: payment
  });
}));

/**
 * @route   POST /api/v1/loan-payments/verify
 * @desc    Verify and update payment status (user confirms payment completion)
 * @access  Private
 */
router.post(
  '/verify',
  protect,
  [
    body('transaction_ref').notEmpty().withMessage('Transaction reference required'),
    body('upi_txn_id').optional().isString().withMessage('UPI transaction ID must be a string'),
    body('status').isIn(['success', 'failed']).withMessage('Status must be success or failed'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { transaction_ref, upi_txn_id, status } = req.body;

    // Find payment by transaction reference
    const payment = await LoanPayment.findByTransactionRef(transaction_ref);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this payment'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    // Update payment status
    const updatedPayment = await LoanPayment.updateStatus(transaction_ref, {
      status,
      upi_txn_id,
      response_code: status === 'success' ? '00' : 'FAILED',
      payment_date: new Date()
    });

    res.json({
      success: true,
      message: status === 'success' ? 'Payment verified successfully' : 'Payment marked as failed',
      data: updatedPayment
    });
  })
);

/**
 * @route   GET /api/v1/loan-payments/loan/:loanId
 * @desc    Get all payments for a loan
 * @access  Private
 */
router.get('/loan/:loanId', protect, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.loanId);

  if (!loan) {
    return res.status(404).json({
      success: false,
      message: 'Loan not found'
    });
  }

  if (loan.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view payments for this loan'
    });
  }

  const payments = await LoanPayment.findByLoanId(req.params.loanId);
  const stats = await LoanPayment.getLoanPaymentStats(req.params.loanId);

  res.json({
    success: true,
    count: payments.length,
    data: payments,
    statistics: stats
  });
}));

/**
 * @route   GET /api/v1/loan-payments/user/all
 * @desc    Get all payments for current user
 * @access  Private
 */
router.get('/user/all', protect, asyncHandler(async (req, res) => {
  const payments = await LoanPayment.findByUserId(req.user.id);

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
}));

/**
 * @route   GET /api/v1/loan-payments/loan/:loanId/next-emi
 * @desc    Get next EMI details for a loan
 * @access  Private
 */
router.get('/loan/:loanId/next-emi', protect, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.loanId);

  if (!loan) {
    return res.status(404).json({
      success: false,
      message: 'Loan not found'
    });
  }

  if (loan.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this loan'
    });
  }

  const nextEMI = await LoanPayment.getNextEMI(req.params.loanId);

  res.json({
    success: true,
    data: nextEMI
  });
}));

/**
 * @route   POST /api/v1/loan-payments/webhook
 * @desc    Webhook for payment gateway callbacks (future use)
 * @access  Public (but should verify signature)
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  // TODO: Implement payment gateway webhook verification
  // For now, this is a placeholder for future integration

  console.log('Payment webhook received:', req.body);

  res.json({
    success: true,
    message: 'Webhook received'
  });
}));

module.exports = router;
