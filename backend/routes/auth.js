const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const OtpService = require('../services/otpService');
const emailService = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/v1/auth/register
// @desc    Register a new user (requires OTP verification)
// @access  Public
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('emailVerified').optional().isBoolean().withMessage('Email verification status required'),
    body('phoneVerified').optional().isBoolean().withMessage('Phone verification status required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { username, email, password, full_name, phone, address, role, emailVerified, phoneVerified } = req.body;

    // Check OTP verification - at least email must be verified
    if (!emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email with OTP before registering',
      });
    }

    // If phone is provided, it must be verified
    if (phone && !phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your phone number with OTP before registering',
      });
    }

    // Verify OTP records exist
    const isEmailVerifiedInDb = await OtpService.isEmailVerified(email);
    if (!isEmailVerifiedInDb) {
      return res.status(400).json({
        success: false,
        message: 'Email verification not found. Please verify your email first.',
      });
    }

    if (phone) {
      const isPhoneVerifiedInDb = await OtpService.isPhoneVerified(phone);
      if (!isPhoneVerifiedInDb) {
        return res.status(400).json({
          success: false,
          message: 'Phone verification not found. Please verify your phone number first.',
        });
      }
    }

    // Check if user exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const usernameExists = await User.usernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      full_name,
      phone,
      address,
      role: role === 'admin' ? 'admin' : 'client', // Default to client
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, full_name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if welcome email fails
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
        },
        token,
      },
    });
  })
);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          kyc_verified: user.kyc_verified,
        },
        token,
      },
    });
  })
);

// @route   GET /api/v1/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      full_name: req.user.full_name,
      phone: req.user.phone,
      address: req.user.address,
      kyc_verified: req.user.kyc_verified,
    },
  });
}));

// @route   PUT /api/v1/auth/updatepassword
// @desc    Update password
// @access  Private
router.put(
  '/updatepassword',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByEmail(req.user.email);

    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword);

    // Generate new token
    const token = generateToken(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: { token },
    });
  })
);

module.exports = router;
