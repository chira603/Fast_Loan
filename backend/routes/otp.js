const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const OtpService = require('../services/otpService');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// @route   POST /api/otp/send-email
// @desc    Send OTP to email
// @access  Public
router.post(
  '/send-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('userName').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, userName } = req.body;

      // Generate and store OTP
      const { otpCode } = await OtpService.createEmailOTP(email);

      // Send OTP via email
      await emailService.sendOTP(email, otpCode, userName);

      res.json({
        success: true,
        message: 'OTP sent to your email address',
        expiresIn: '5 minutes',
      });
    } catch (error) {
      console.error('Error sending email OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }
  }
);

// @route   POST /api/otp/send-sms
// @desc    Send OTP to phone
// @access  Public
router.post(
  '/send-sms',
  [
    body('phone')
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Valid phone number is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone } = req.body;

      // Generate and store OTP
      const { otpCode } = await OtpService.createPhoneOTP(phone);

      // Send OTP via SMS
      await smsService.sendOTP(phone, otpCode);

      res.json({
        success: true,
        message: 'OTP sent to your phone number',
        expiresIn: '5 minutes',
      });
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }
  }
);

// @route   POST /api/otp/verify-email
// @desc    Verify email OTP
// @access  Public
router.post(
  '/verify-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, otp } = req.body;

      // Verify OTP
      await OtpService.verifyEmailOTP(email, otp);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired OTP',
      });
    }
  }
);

// @route   POST /api/otp/verify-sms
// @desc    Verify phone OTP
// @access  Public
router.post(
  '/verify-sms',
  [
    body('phone')
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Valid phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone, otp } = req.body;

      // Verify OTP
      await OtpService.verifyPhoneOTP(phone, otp);

      res.json({
        success: true,
        message: 'Phone number verified successfully',
      });
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired OTP',
      });
    }
  }
);

// @route   POST /api/otp/resend-email
// @desc    Resend OTP to email
// @access  Public
router.post(
  '/resend-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('userName').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, userName } = req.body;

      // Generate and store new OTP
      const { otpCode } = await OtpService.createEmailOTP(email);

      // Send OTP via email
      await emailService.sendOTP(email, otpCode, userName);

      res.json({
        success: true,
        message: 'New OTP sent to your email address',
        expiresIn: '5 minutes',
      });
    } catch (error) {
      console.error('Error resending email OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      });
    }
  }
);

// @route   POST /api/otp/resend-sms
// @desc    Resend OTP to phone
// @access  Public
router.post(
  '/resend-sms',
  [
    body('phone')
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
      .withMessage('Valid phone number is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone } = req.body;

      // Generate and store new OTP
      const { otpCode } = await OtpService.createPhoneOTP(phone);

      // Send OTP via SMS
      await smsService.sendOTP(phone, otpCode);

      res.json({
        success: true,
        message: 'New OTP sent to your phone number',
        expiresIn: '5 minutes',
      });
    } catch (error) {
      console.error('Error resending SMS OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      });
    }
  }
);

module.exports = router;
