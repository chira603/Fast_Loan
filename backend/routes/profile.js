const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/validation');

// @route   GET /api/v1/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

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

// @route   PUT /api/v1/profile
// @desc    Update current user profile
// @access  Private
router.put('/', protect, asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'full_name',
    'phone',
    'address',
    'date_of_birth',
    'gender',
    'occupation',
    'company_name',
    'annual_income',
    'pan_number',
    'aadhar_number',
    'emergency_contact_name',
    'emergency_contact_phone',
    'emergency_contact_relation'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update',
    });
  }

  const user = await User.update(req.user.id, updates);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
}));

// @route   POST /api/v1/profile/documents
// @desc    Upload/Update document URLs (simulated)
// @access  Private
router.post('/documents', protect, asyncHandler(async (req, res) => {
  const { 
    aadhar_front_url, 
    aadhar_back_url, 
    pan_card_url, 
    bank_statement_url,
    salary_slip_url,
    profile_photo_url
  } = req.body;

  const updates = {};
  if (aadhar_front_url) updates.aadhar_front_url = aadhar_front_url;
  if (aadhar_back_url) updates.aadhar_back_url = aadhar_back_url;
  if (pan_card_url) updates.pan_card_url = pan_card_url;
  if (bank_statement_url) updates.bank_statement_url = bank_statement_url;
  if (salary_slip_url) updates.salary_slip_url = salary_slip_url;
  if (profile_photo_url) updates.profile_photo_url = profile_photo_url;

  const user = await User.update(req.user.id, updates);

  res.status(200).json({
    success: true,
    message: 'Documents updated successfully',
    data: user,
  });
}));

// @route   PUT /api/v1/profile/password
// @desc    Change password
// @access  Private
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const user = await User.findByEmail(req.user.email);
  const isMatch = await User.verifyPassword(currentPassword, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  await User.updatePassword(req.user.id, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
}));

module.exports = router;
