const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');

// @route   POST /api/v1/contact
// @desc    Submit contact form
// @access  Public
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    const user_id = req.user ? req.user.id : null;

    const contact = await Contact.create({
      user_id,
      name,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      data: contact,
    });
  })
);

// @route   GET /api/v1/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { resolved, limit, offset } = req.query;
  
  const contacts = await Contact.findAll({
    resolved: resolved !== undefined ? resolved === 'true' : undefined,
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
}));

// @route   PUT /api/v1/contact/:id/resolve
// @desc    Mark contact as resolved (Admin only)
// @access  Private (Admin)
router.put('/:id/resolve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const contact = await Contact.markResolved(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contact marked as resolved',
    data: contact,
  });
}));

// @route   DELETE /api/v1/contact/:id
// @desc    Delete contact submission (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const contact = await Contact.delete(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contact deleted successfully',
  });
}));

module.exports = router;
