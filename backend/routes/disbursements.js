const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Disbursement = require('../models/Disbursement');
const Loan = require('../models/Loan');
const DisbursementService = require('../services/disbursementService');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

/**
 * @route   POST /api/v1/disbursements/initiate/:loanId
 * @desc    Initiate loan disbursement (Admin)
 * @access  Private/Admin
 */
router.post('/initiate/:loanId', protect, authorize('admin'), async (req, res) => {
  try {
    const { loanId } = req.params;
    const { payment_method = 'MANUAL', from_account, notes } = req.body;

    // Get loan details
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check if loan is approved
    if (loan.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Loan must be approved for disbursement. Current status: ${loan.status}`
      });
    }

    // Check if already disbursed
    const existingDisbursements = await Disbursement.findByLoanId(loanId);
    const hasPendingOrCompleted = existingDisbursements.some(d => 
      ['pending', 'processing', 'completed'].includes(d.status)
    );
    
    if (hasPendingOrCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Loan already has a pending or completed disbursement'
      });
    }

    // Validate user has bank details
    if (!loan.account_number || !loan.ifsc_code) {
      return res.status(400).json({
        success: false,
        message: 'User bank details not found. Please add bank details to user profile.'
      });
    }

    // Validate bank details
    const validation = DisbursementService.validateBankDetails(
      loan.account_number,
      loan.ifsc_code
    );
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Generate transaction reference
    const transactionRef = Disbursement.generateTransactionRef();

    // Create disbursement record
    const disbursement = await Disbursement.create({
      loan_id: loanId,
      user_id: loan.user_id,
      amount: loan.amount,
      from_account: from_account || process.env.BUSINESS_ACCOUNT_NUMBER || 'Business Account',
      to_account: loan.account_number,
      to_account_holder_name: loan.account_holder_name || loan.full_name,
      to_ifsc_code: loan.ifsc_code,
      to_upi_id: loan.upi_id,
      payment_method: payment_method,
      transaction_ref: transactionRef,
      notes: notes
    });

    // Generate transfer details based on method
    let transferDetails = {};
    
    if (payment_method === 'UPI' && loan.upi_id) {
      // Validate UPI ID
      const upiValidation = DisbursementService.validateUPI(loan.upi_id);
      if (!upiValidation.valid) {
        return res.status(400).json({
          success: false,
          message: upiValidation.error
        });
      }

      transferDetails = {
        upi_link: DisbursementService.generateUPITransferLink({
          recipient_vpa: loan.upi_id,
          recipient_name: loan.full_name,
          amount: loan.amount,
          transaction_ref: transactionRef,
          note: `Loan Disbursement - FL${loanId}`
        }),
        qr_code: DisbursementService.generateUPIQRData({
          recipient_vpa: loan.upi_id,
          recipient_name: loan.full_name,
          amount: loan.amount,
          transaction_ref: transactionRef
        })
      };
    } else {
      // Bank transfer (IMPS/NEFT/RTGS)
      transferDetails = DisbursementService.generateBankTransferDetails({
        account_number: loan.account_number,
        ifsc_code: loan.ifsc_code,
        account_holder_name: loan.account_holder_name || loan.full_name,
        amount: loan.amount,
        transaction_ref: transactionRef
      });
    }

    // Generate manual instructions
    const instructions = DisbursementService.generateManualTransferInstructions(disbursement);

    // Send notification to user
    try {
      const notificationData = DisbursementService.generateNotificationData(disbursement, 'initiated');
      
      // Email notification
      await emailService.sendEmail({
        to: loan.email,
        subject: 'Loan Disbursement Initiated - Fast Loan',
        html: `
          <h2>${notificationData.title}</h2>
          <p>Dear ${loan.full_name},</p>
          <p>${notificationData.message}</p>
          <p><strong>Loan Details:</strong></p>
          <ul>
            <li>Loan Amount: ₹${loan.amount.toLocaleString('en-IN')}</li>
            <li>Tenure: ${loan.tenure_months} months</li>
            <li>EMI: ₹${loan.emi.toLocaleString('en-IN')}</li>
            <li>Reference: ${transactionRef}</li>
          </ul>
          <p>The amount will be credited to your account ending with ${loan.account_number.slice(-4)}.</p>
          <p>Thank you for choosing Fast Loan!</p>
        `
      });

      // SMS notification (if phone available)
      if (loan.phone) {
        await smsService.sendSMS({
          to: loan.phone,
          message: `Your Fast Loan of Rs.${loan.amount} is being processed. Amount will be credited to your account shortly. Ref: ${transactionRef}`
        });
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the disbursement if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Disbursement initiated successfully',
      data: {
        disbursement,
        transfer_details: transferDetails,
        instructions,
        summary: DisbursementService.generateTransferSummary(disbursement)
      }
    });

  } catch (error) {
    console.error('Error initiating disbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/disbursements/:id/complete
 * @desc    Mark disbursement as completed (Admin)
 * @access  Private/Admin
 */
router.post('/:id/complete', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, utr_number } = req.body;

    if (!transaction_id || !utr_number) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and UTR number are required'
      });
    }

    // Verify UTR format
    if (!DisbursementService.verifyUTRFormat(utr_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UTR number format. UTR should be 12-22 alphanumeric characters.'
      });
    }

    const disbursement = await Disbursement.findById(id);
    if (!disbursement) {
      return res.status(404).json({
        success: false,
        message: 'Disbursement not found'
      });
    }

    if (disbursement.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Disbursement already completed'
      });
    }

    // Complete disbursement and update loan status
    const result = await Disbursement.complete(id, {
      transaction_id,
      utr_number
    });

    // Get loan details for notification
    const loan = await Loan.findById(disbursement.loan_id);

    // Send success notification
    try {
      const notificationData = DisbursementService.generateNotificationData(
        { ...disbursement, transaction_id },
        'completed'
      );

      // Email notification
      await emailService.sendEmail({
        to: loan.email,
        subject: '✅ Loan Amount Credited - Fast Loan',
        html: `
          <h2>${notificationData.title}</h2>
          <p>Dear ${loan.full_name},</p>
          <p>Great news! ${notificationData.message}</p>
          <p><strong>Transaction Details:</strong></p>
          <ul>
            <li>Amount Credited: ₹${disbursement.amount.toLocaleString('en-IN')}</li>
            <li>UTR Number: ${utr_number}</li>
            <li>Transaction ID: ${transaction_id}</li>
            <li>Account: XXXX${loan.account_number.slice(-4)}</li>
          </ul>
          <p><strong>Your EMI Details:</strong></p>
          <ul>
            <li>Monthly EMI: ₹${loan.emi.toLocaleString('en-IN')}</li>
            <li>Tenure: ${loan.tenure_months} months</li>
            <li>First EMI Date: ${new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</li>
          </ul>
          <p>Start planning your repayments now!</p>
        `
      });

      // SMS notification
      if (loan.phone) {
        await smsService.sendSMS({
          to: loan.phone,
          message: `Fast Loan disbursed! Rs.${disbursement.amount} credited to your account. UTR: ${utr_number}. First EMI in 28 days.`
        });
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.json({
      success: true,
      message: 'Disbursement completed successfully. Loan status updated to disbursed.',
      data: result
    });

  } catch (error) {
    console.error('Error completing disbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/disbursements/:id/fail
 * @desc    Mark disbursement as failed (Admin)
 * @access  Private/Admin
 */
router.post('/:id/fail', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Failure reason is required'
      });
    }

    const disbursement = await Disbursement.findById(id);
    if (!disbursement) {
      return res.status(404).json({
        success: false,
        message: 'Disbursement not found'
      });
    }

    const failed = await Disbursement.fail(id, reason);

    // Get loan details
    const loan = await Loan.findById(disbursement.loan_id);

    // Send failure notification
    try {
      const notificationData = DisbursementService.generateNotificationData(
        { ...disbursement, failure_reason: reason },
        'failed'
      );

      await emailService.sendEmail({
        to: loan.email,
        subject: 'Loan Disbursement Failed - Action Required',
        html: `
          <h2>${notificationData.title}</h2>
          <p>Dear ${loan.full_name},</p>
          <p>${notificationData.message}</p>
          <p><strong>Failure Reason:</strong> ${reason}</p>
          <p>Please contact our support team or update your bank details and we'll retry the disbursement.</p>
        `
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.json({
      success: true,
      message: 'Disbursement marked as failed',
      data: failed
    });

  } catch (error) {
    console.error('Error failing disbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/disbursements/pending
 * @desc    Get all pending disbursements (Admin)
 * @access  Private/Admin
 */
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const disbursements = await Disbursement.getPendingDisbursements();
    
    res.json({
      success: true,
      count: disbursements.length,
      data: disbursements
    });
  } catch (error) {
    console.error('Error fetching pending disbursements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/v1/disbursements/loan/:loanId
 * @desc    Get disbursements for a loan
 * @access  Private
 */
router.get('/loan/:loanId', protect, async (req, res) => {
  try {
    const { loanId } = req.params;
    
    // Verify loan belongs to user (unless admin)
    if (req.user.role !== 'admin') {
      const loan = await Loan.findById(loanId);
      if (!loan || loan.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const disbursements = await Disbursement.findByLoanId(loanId);
    
    res.json({
      success: true,
      count: disbursements.length,
      data: disbursements
    });
  } catch (error) {
    console.error('Error fetching loan disbursements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/v1/disbursements/user/all
 * @desc    Get all disbursements for current user
 * @access  Private
 */
router.get('/user/all', protect, async (req, res) => {
  try {
    const disbursements = await Disbursement.findByUserId(req.user.id);
    
    res.json({
      success: true,
      count: disbursements.length,
      data: disbursements
    });
  } catch (error) {
    console.error('Error fetching user disbursements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/v1/disbursements/:id
 * @desc    Get disbursement by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const disbursement = await Disbursement.findById(req.params.id);
    
    if (!disbursement) {
      return res.status(404).json({
        success: false,
        message: 'Disbursement not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && disbursement.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: disbursement
    });
  } catch (error) {
    console.error('Error fetching disbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/v1/disbursements/stats/all
 * @desc    Get disbursement statistics (Admin)
 * @access  Private/Admin
 */
router.get('/stats/all', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Disbursement.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching disbursement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
