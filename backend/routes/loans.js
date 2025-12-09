const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Loan = require('../models/Loan');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');

// @route   POST /api/v1/loans
// @desc    Create a new loan application
// @access  Private (Client)
router.post(
  '/',
  protect,
  [
    body('amount').isFloat({ min: 10000, max: 500000 }).withMessage('Loan amount must be between ₹10,000 and ₹5,00,000'),
    body('tenure_months').isInt({ min: 3, max: 36 }).withMessage('Tenure must be between 3 and 36 months'),
    body('interest_rate').isFloat({ min: 0 }).withMessage('Valid interest rate required'),
    body('emi').isFloat({ min: 0 }).withMessage('Valid EMI amount required'),
    body('purpose').notEmpty().withMessage('Loan purpose is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const loanData = {
      user_id: req.user.id,
      ...req.body,
    };

    const loan = await Loan.create(loanData);

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loan,
    });
  })
);

// @route   GET /api/v1/loans
// @desc    Get all loans (Admin) or user's loans (Client)
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  let loans;
  const { status, limit, offset } = req.query;

  if (req.user.role === 'admin') {
    loans = await Loan.findAll({ status, limit, offset });
  } else {
    loans = await Loan.findByUserId(req.user.id, { status, limit });
  }

  res.status(200).json({
    success: true,
    count: loans.length,
    data: loans,
  });
}));

// @route   GET /api/v1/loans/:id
// @desc    Get single loan
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return res.status(404).json({
      success: false,
      message: 'Loan not found',
    });
  }

  // Check ownership
  if (req.user.role !== 'admin' && loan.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this loan',
    });
  }

  res.status(200).json({
    success: true,
    data: loan,
  });
}));

// @route   PUT /api/v1/loans/:id/status
// @desc    Update loan status (Admin only)
// @access  Private (Admin)
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    body('status').isIn(['pending', 'approved', 'rejected', 'disbursed', 'repaid']).withMessage('Invalid status'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const loan = await Loan.updateStatus(req.params.id, status, notes);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan status updated successfully',
      data: loan,
    });
  })
);

// @route   GET /api/v1/loans/stats
// @desc    Get loan statistics
// @access  Private
router.get('/user/stats', protect, asyncHandler(async (req, res) => {
  const userId = req.user.role === 'admin' ? null : req.user.id;
  const stats = await Loan.getStatistics(userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
}));

// @route   DELETE /api/v1/loans/:id
// @desc    Delete loan (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const loan = await Loan.delete(req.params.id);

  if (!loan) {
    return res.status(404).json({
      success: false,
      message: 'Loan not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Loan deleted successfully',
  });
}));

module.exports = router;
