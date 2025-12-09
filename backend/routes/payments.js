const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');
const { createOrder, verifySignature, key_id } = require('../services/razorpayService');

// @route   POST /api/v1/payments
// @desc    Create a new payment and update loan
// @access  Private
router.post(
  '/',
  protect,
  [
    body('loan_id').isInt().withMessage('Valid loan ID required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('payment_method').optional().isString(),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { loan_id, amount, payment_method = 'wallet' } = req.body;
    
    // Get loan details
    const loan = await Loan.findById(loan_id);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    // Check if user owns the loan
    if (loan.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this loan',
      });
    }

    // Check loan status
    if (loan.status !== 'approved' && loan.status !== 'disbursed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot make payment for loan with current status',
      });
    }

    // Generate transaction ID
    const transaction_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = await Payment.create({
      loan_id,
      amount,
      transaction_id,
      payment_method,
      status: 'success',
      notes: `EMI payment for Loan #${loan_id}`,
    });

    // Update loan repayment schedule
    if (loan.repayment_schedule && Array.isArray(loan.repayment_schedule)) {
      let remainingAmount = parseFloat(amount);
      const updatedSchedule = loan.repayment_schedule.map(emi => {
        if (remainingAmount > 0 && emi.status === 'pending') {
          const emiAmount = parseFloat(emi.amount);
          if (remainingAmount >= emiAmount) {
            remainingAmount -= emiAmount;
            return { ...emi, status: 'paid' };
          } else {
            // Partial payment
            const newAmount = emiAmount - remainingAmount;
            remainingAmount = 0;
            return { ...emi, amount: newAmount, status: 'partial' };
          }
        }
        return emi;
      });

      // Update loan with new schedule
      await Loan.updateRepaymentSchedule(loan_id, updatedSchedule);
      
      // Check if all EMIs are paid
      const allPaid = updatedSchedule.every(emi => emi.status === 'paid');
      if (allPaid) {
        await Loan.updateStatus(loan_id, 'repaid');
      }
    }

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

// Razorpay Integration
// @route   POST /api/v1/payments/razorpay/order
// @desc    Create Razorpay order for a payment
// @access  Private
router.post(
  '/razorpay/order',
  protect,
  [
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
    body('purpose').notEmpty().withMessage('Purpose required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { amount, purpose, notes } = req.body;
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    const receipt = `rcpt_${req.user.id}_${Date.now()}`;

    const order = await createOrder(amountInPaise, receipt, { purpose, ...(notes || {}) });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: key_id,
      },
    });
  })
);

// @route   POST /api/v1/payments/razorpay/verify
// @desc    Verify Razorpay signature and record payment
// @access  Private
router.post(
  '/razorpay/verify',
  protect,
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
    body('amount').isFloat({ min: 1 }),
    body('loan_id').optional().isInt(),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, loan_id } = req.body;

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Record payment in DB
    const payment = await Payment.create({
      loan_id: loan_id || null,
      amount,
      transaction_id: razorpay_payment_id,
      payment_method: 'Razorpay',
      notes: `Order: ${razorpay_order_id}`,
    });

    res.status(201).json({ success: true, message: 'Payment verified and recorded', data: payment });
  })
);
