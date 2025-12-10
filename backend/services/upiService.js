const crypto = require('crypto');

/**
 * UPI Payment Service
 * Handles UPI payment link generation and transaction tracking
 */
class UPIService {
  constructor() {
    // These should be loaded from database or environment
    this.businessVPA = process.env.UPI_BUSINESS_VPA || 'fastloan@paytm';
    this.businessName = process.env.UPI_BUSINESS_NAME || 'Fast Loan';
    this.merchantCode = process.env.UPI_MERCHANT_CODE || '5399';
  }

  /**
   * Generate UPI payment deep link
   * Based on NPCI UPI Linking Spec v1.5.1
   * 
   * @param {Object} params - Payment parameters
   * @param {string} params.amount - Payment amount
   * @param {string} params.transactionRef - Unique transaction reference
   * @param {string} params.transactionNote - Payment description
   * @param {string} params.payeeName - Optional: override business name
   * @returns {string} - UPI deep link
   */
  generatePaymentLink(params) {
    const {
      amount,
      transactionRef,
      transactionNote = 'Loan Payment',
      payeeName = this.businessName
    } = params;

    // Validate required parameters
    if (!amount || !transactionRef) {
      throw new Error('Amount and transaction reference are required');
    }

    // Build UPI URL parameters according to NPCI spec
    const upiParams = new URLSearchParams({
      pa: this.businessVPA,           // Payee VPA (required)
      pn: payeeName,                   // Payee Name (required)
      am: amount.toString(),           // Amount (required)
      cu: 'INR',                       // Currency (required)
      tn: transactionNote,             // Transaction Note (optional)
      tr: transactionRef,              // Transaction Reference (optional but recommended)
      mc: this.merchantCode,           // Merchant Code (optional)
      mode: '02',                      // UPI mode (02 = QR code/deep link)
      purpose: '00',                   // Purpose code (00 = default)
    });

    // Return UPI deep link
    return `upi://pay?${upiParams.toString()}`;
  }

  /**
   * Generate unique transaction reference
   * Format: FL-{TYPE}-{TIMESTAMP}-{RANDOM}
   * 
   * @param {string} type - Transaction type (EMI, PREPAY, CLOSING)
   * @returns {string} - Unique transaction reference
   */
  generateTransactionRef(type = 'EMI') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `FL-${type}-${timestamp}-${random}`;
  }

  /**
   * Validate UPI VPA format
   * 
   * @param {string} vpa - UPI VPA to validate
   * @returns {boolean} - True if valid
   */
  validateVPA(vpa) {
    if (!vpa) return false;
    
    // UPI VPA format: username@bankname
    // Examples: user@paytm, 9876543210@ybl, business@okaxis
    const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return vpaRegex.test(vpa);
  }

  /**
   * Parse UPI response status
   * Maps UPI response codes to our internal status
   * 
   * @param {string} responseCode - UPI response code
   * @returns {Object} - Parsed status
   */
  parseUPIResponse(responseCode) {
    const statusMap = {
      '00': { status: 'success', message: 'Transaction successful' },
      'U30': { status: 'failed', message: 'Transaction failed - Invalid VPA' },
      'U16': { status: 'failed', message: 'Transaction failed - Risk threshold exceeded' },
      'U48': { status: 'failed', message: 'Transaction failed - Invalid amount' },
      'U69': { status: 'failed', message: 'Transaction failed - Insufficient funds' },
      'ZM': { status: 'failed', message: 'Transaction failed - Invalid PIN' },
      'BT': { status: 'failed', message: 'Transaction failed - Bank timeout' },
      'U66': { status: 'pending', message: 'Transaction pending - Debit success, credit pending' },
    };

    return statusMap[responseCode] || { 
      status: 'failed', 
      message: `Transaction failed - Code: ${responseCode}` 
    };
  }

  /**
   * Create payment intent for tracking
   * This should be called BEFORE generating the UPI link
   * 
   * @param {Object} paymentData - Payment data
   * @returns {Object} - Payment intent with transaction ref and UPI link
   */
  createPaymentIntent(paymentData) {
    const {
      amount,
      type = 'EMI',
      description = 'Loan Payment',
      metadata = {}
    } = paymentData;

    // Generate unique transaction reference
    const transactionRef = this.generateTransactionRef(type);

    // Generate UPI payment link
    const upiLink = this.generatePaymentLink({
      amount,
      transactionRef,
      transactionNote: description
    });

    return {
      transactionRef,
      upiLink,
      amount,
      type,
      description,
      businessVPA: this.businessVPA,
      businessName: this.businessName,
      createdAt: new Date().toISOString(),
      metadata
    };
  }

  /**
   * Generate payment QR code data
   * Can be used to generate QR codes for desktop payments
   * 
   * @param {Object} params - Payment parameters
   * @returns {string} - UPI string for QR code
   */
  generateQRCodeData(params) {
    // Same as payment link, but can be encoded as QR
    return this.generatePaymentLink(params);
  }

  /**
   * Verify payment callback signature (for payment gateway integration)
   * This is a placeholder for future gateway integration
   * 
   * @param {Object} callbackData - Callback data from payment gateway
   * @param {string} signature - Signature to verify
   * @returns {boolean} - True if signature is valid
   */
  verifyCallbackSignature(callbackData, signature) {
    // TODO: Implement when using payment gateway
    // For now, return true for manual verification flow
    console.log('Payment callback signature verification not implemented yet');
    return true;
  }

  /**
   * Get supported UPI apps
   * Returns list of popular UPI apps with deep link schemes
   * 
   * @returns {Array} - List of UPI apps
   */
  getSupportedUPIApps() {
    return [
      {
        name: 'PhonePe',
        id: 'phonepe',
        packageName: 'com.phonepe.app',
        icon: 'phonepe',
        color: '#5f259f'
      },
      {
        name: 'Google Pay',
        id: 'googlepay',
        packageName: 'com.google.android.apps.nbu.paisa.user',
        icon: 'googlepay',
        color: '#4285f4'
      },
      {
        name: 'Paytm',
        id: 'paytm',
        packageName: 'net.one97.paytm',
        icon: 'paytm',
        color: '#00b9f5'
      },
      {
        name: 'BHIM',
        id: 'bhim',
        packageName: 'in.org.npci.upiapp',
        icon: 'bhim',
        color: '#d32f2f'
      },
      {
        name: 'Amazon Pay',
        id: 'amazonpay',
        packageName: 'in.amazon.mShop.android.shopping',
        icon: 'amazon',
        color: '#ff9900'
      }
    ];
  }

  /**
   * Format amount for display
   * 
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  formatAmount(amount) {
    return `₹ ${parseFloat(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  }
}

module.exports = new UPIService();
