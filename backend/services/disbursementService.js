const crypto = require('crypto');

class DisbursementService {
  /**
   * Generate UPI payment link for disbursement
   * Uses UPI Collect request to transfer money
   */
  static generateUPITransferLink(recipientData) {
    const {
      recipient_vpa,      // User's UPI ID
      recipient_name,     // User's name
      amount,             // Amount to transfer
      transaction_ref,    // Unique reference
      note                // Transaction note
    } = recipientData;

    // For UPI, we'll use UPI Collect Request
    // Format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&tn=<Note>&tr=<Ref>
    const params = new URLSearchParams({
      pa: recipient_vpa,
      pn: recipient_name,
      am: amount.toString(),
      cu: 'INR',
      tn: note || 'Loan Disbursement',
      tr: transaction_ref
    });

    return `upi://pay?${params.toString()}`;
  }

  /**
   * Generate IMPS/NEFT transfer details
   */
  static generateBankTransferDetails(recipientData) {
    const {
      account_number,
      ifsc_code,
      account_holder_name,
      amount,
      transaction_ref
    } = recipientData;

    return {
      transfer_method: this.determineTransferMethod(amount),
      beneficiary: {
        account_number: account_number,
        ifsc_code: ifsc_code,
        account_holder_name: account_holder_name,
        bank_name: this.getBankNameFromIFSC(ifsc_code)
      },
      amount: amount,
      currency: 'INR',
      reference: transaction_ref,
      purpose: 'Loan Disbursement',
      remarks: `Fast Loan Disbursement - ${transaction_ref}`
    };
  }

  /**
   * Determine transfer method based on amount
   * IMPS: Up to ₹2 lakhs, instant
   * NEFT: Any amount, takes 2-3 hours
   * RTGS: ₹2 lakhs+, instant, available 24x7 now
   */
  static determineTransferMethod(amount) {
    if (amount >= 200000) {
      return 'RTGS'; // Real Time Gross Settlement
    } else if (amount <= 200000) {
      return 'IMPS'; // Immediate Payment Service
    } else {
      return 'NEFT'; // National Electronic Funds Transfer
    }
  }

  /**
   * Get bank name from IFSC code
   */
  static getBankNameFromIFSC(ifscCode) {
    const bankCodes = {
      'SBIN': 'State Bank of India',
      'HDFC': 'HDFC Bank',
      'ICIC': 'ICICI Bank',
      'AXIS': 'Axis Bank',
      'PUNB': 'Punjab National Bank',
      'BARB': 'Bank of Baroda',
      'UBIN': 'Union Bank of India',
      'CNRB': 'Canara Bank',
      'IDIB': 'Indian Bank',
      'IOBA': 'Indian Overseas Bank',
      'UTIB': 'Axis Bank',
      'KKBK': 'Kotak Mahindra Bank',
      'YESB': 'Yes Bank',
      'INDB': 'IndusInd Bank',
      'FDRL': 'Federal Bank'
    };

    const code = ifscCode.substring(0, 4);
    return bankCodes[code] || 'Unknown Bank';
  }

  /**
   * Validate account number and IFSC code
   */
  static validateBankDetails(accountNumber, ifscCode) {
    // Account number validation (9-18 digits)
    const accountRegex = /^[0-9]{9,18}$/;
    if (!accountRegex.test(accountNumber)) {
      return {
        valid: false,
        error: 'Invalid account number. Must be 9-18 digits.'
      };
    }

    // IFSC code validation (11 characters: 4 letters, 0, 6 alphanumeric)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      return {
        valid: false,
        error: 'Invalid IFSC code format.'
      };
    }

    return { valid: true };
  }

  /**
   * Validate UPI VPA
   */
  static validateUPI(vpa) {
    // UPI format: username@bank (e.g., user@paytm, user@ybl)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(vpa)) {
      return {
        valid: false,
        error: 'Invalid UPI ID format. Example: username@paytm'
      };
    }

    return { valid: true };
  }

  /**
   * Generate instructions for manual bank transfer
   */
  static generateManualTransferInstructions(disbursement) {
    return {
      instructions: [
        '1. Login to your business bank account (Net Banking/Mobile App)',
        '2. Go to Funds Transfer → Add Beneficiary (if new)',
        '3. Enter the following beneficiary details:',
        `   - Account Number: ${disbursement.to_account}`,
        `   - IFSC Code: ${disbursement.to_ifsc_code}`,
        `   - Account Holder Name: ${disbursement.to_account_holder_name}`,
        '4. Once beneficiary is approved (may take 30 mins):',
        `5. Transfer ₹${disbursement.amount} to the beneficiary`,
        `6. Use Reference: ${disbursement.transaction_ref}`,
        '7. Save the UTR/Transaction ID',
        '8. Return to Fast Loan Admin → Mark as Completed',
        '9. Enter the UTR number to complete the disbursement'
      ],
      transfer_details: {
        beneficiary_name: disbursement.to_account_holder_name,
        account_number: disbursement.to_account,
        ifsc_code: disbursement.to_ifsc_code,
        amount: disbursement.amount,
        reference: disbursement.transaction_ref,
        transfer_mode: this.determineTransferMethod(disbursement.amount)
      }
    };
  }

  /**
   * Generate QR code data for UPI payment
   */
  static generateUPIQRData(recipientData) {
    const upiLink = this.generateUPITransferLink(recipientData);
    return {
      qr_string: upiLink,
      qr_type: 'UPI',
      display_text: `Pay ₹${recipientData.amount} to ${recipientData.recipient_name}`
    };
  }

  /**
   * Calculate estimated transfer time
   */
  static estimateTransferTime(method) {
    const estimates = {
      'UPI': 'Instant (few seconds)',
      'IMPS': 'Instant (few seconds)',
      'RTGS': 'Instant (available 24x7)',
      'NEFT': '2-3 hours (batch processing)',
      'MANUAL': 'Depends on your bank (typically 1-2 hours)'
    };

    return estimates[method] || 'Unknown';
  }

  /**
   * Check if transfer can be done instantly
   */
  static canTransferInstantly(method) {
    return ['UPI', 'IMPS', 'RTGS'].includes(method);
  }

  /**
   * Generate transfer summary
   */
  static generateTransferSummary(disbursement) {
    const method = disbursement.payment_method || 'MANUAL';
    
    return {
      disbursement_id: disbursement.id,
      loan_id: disbursement.loan_id,
      amount: disbursement.amount,
      recipient: {
        name: disbursement.to_account_holder_name,
        account: disbursement.to_account,
        ifsc: disbursement.to_ifsc_code,
        upi_id: disbursement.to_upi_id
      },
      transfer_method: method,
      estimated_time: this.estimateTransferTime(method),
      is_instant: this.canTransferInstantly(method),
      transaction_ref: disbursement.transaction_ref,
      status: disbursement.status
    };
  }

  /**
   * Verify UTR number format
   */
  static verifyUTRFormat(utr) {
    // UTR is typically 12-22 alphanumeric characters
    const utrRegex = /^[A-Z0-9]{12,22}$/;
    return utrRegex.test(utr);
  }

  /**
   * Generate disbursement notification data
   */
  static generateNotificationData(disbursement, type) {
    const templates = {
      'initiated': {
        title: 'Loan Disbursement Initiated',
        message: `Your loan of ₹${disbursement.amount} is being processed. You will receive the amount in your account shortly.`,
        type: 'info'
      },
      'completed': {
        title: 'Loan Amount Credited! 🎉',
        message: `₹${disbursement.amount} has been successfully transferred to your account. Transaction ID: ${disbursement.transaction_id}`,
        type: 'success'
      },
      'failed': {
        title: 'Disbursement Failed',
        message: `Unable to transfer ₹${disbursement.amount}. Reason: ${disbursement.failure_reason}. Please contact support.`,
        type: 'error'
      }
    };

    return templates[type] || templates['initiated'];
  }

  /**
   * Generate transfer summary
   */
  static generateTransferSummary(disbursement) {
    const transferTime = this.estimateTransferTime(disbursement.payment_method);
    
    return {
      amount: `₹${disbursement.amount.toLocaleString('en-IN')}`,
      method: disbursement.payment_method,
      estimated_time: transferTime,
      recipient_account: `XXXX${disbursement.to_account.slice(-4)}`,
      recipient_name: disbursement.to_account_holder_name,
      bank: this.getBankNameFromIFSC(disbursement.to_ifsc_code),
      transaction_ref: disbursement.transaction_ref,
      status: disbursement.status
    };
  }
}

module.exports = DisbursementService;
