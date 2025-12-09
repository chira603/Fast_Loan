const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/validation');

// @route   GET /api/v1/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { role, kyc_verified, limit, offset } = req.query;
  
  const users = await User.findAll({
    role,
    kyc_verified: kyc_verified !== undefined ? kyc_verified === 'true' : undefined,
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
}));

// @route   GET /api/v1/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
}));

// @route   PUT /api/v1/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.update(req.params.id, req.body);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
}));

// @route   PUT /api/v1/users/:id/verify
// @desc    Verify user KYC (Admin only)
// @access  Private (Admin)
router.put('/:id/verify', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.update(req.params.id, { kyc_verified: true });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User KYC verified successfully',
    data: user,
  });
}));

// @route   DELETE /api/v1/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.delete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
}));

module.exports = router;
