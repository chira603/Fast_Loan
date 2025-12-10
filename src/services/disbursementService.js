import api from './api';

/**
 * Initiate loan disbursement (Admin only)
 * @param {number} loanId - Loan ID
 * @param {Object} data - Disbursement data
 * @returns {Promise<Object>} Disbursement details
 */
export const initiateDisbursement = async (loanId, data = {}) => {
  const response = await api.post(`/disbursements/initiate/${loanId}`, data);
  return response.data;
};

/**
 * Complete disbursement with UTR (Admin only)
 * @param {number} disbursementId - Disbursement ID
 * @param {Object} data - Transaction data
 * @returns {Promise<Object>} Updated disbursement
 */
export const completeDisbursement = async (disbursementId, data) => {
  const response = await api.post(`/disbursements/${disbursementId}/complete`, data);
  return response.data;
};

/**
 * Mark disbursement as failed (Admin only)
 * @param {number} disbursementId - Disbursement ID
 * @param {string} reason - Failure reason
 * @returns {Promise<Object>} Updated disbursement
 */
export const failDisbursement = async (disbursementId, reason) => {
  const response = await api.post(`/disbursements/${disbursementId}/fail`, { reason });
  return response.data;
};

/**
 * Get pending disbursements (Admin only)
 * @returns {Promise<Array>} List of pending disbursements
 */
export const getPendingDisbursements = async () => {
  const response = await api.get('/disbursements/pending');
  return response.data;
};

/**
 * Get disbursements for a loan
 * @param {number} loanId - Loan ID
 * @returns {Promise<Array>} List of disbursements
 */
export const getLoanDisbursements = async (loanId) => {
  const response = await api.get(`/disbursements/loan/${loanId}`);
  return response.data;
};

/**
 * Get all disbursements for current user
 * @returns {Promise<Array>} List of user's disbursements
 */
export const getUserDisbursements = async () => {
  const response = await api.get('/disbursements/user/all');
  return response.data;
};

/**
 * Get disbursement by ID
 * @param {number} disbursementId - Disbursement ID
 * @returns {Promise<Object>} Disbursement details
 */
export const getDisbursementById = async (disbursementId) => {
  const response = await api.get(`/disbursements/${disbursementId}`);
  return response.data;
};

/**
 * Get disbursement statistics (Admin only)
 * @returns {Promise<Object>} Statistics
 */
export const getDisbursementStats = async () => {
  const response = await api.get('/disbursements/stats/all');
  return response.data;
};

/**
 * Format disbursement status for display
 * @param {string} status - Disbursement status
 * @returns {Object} Status display info
 */
export const formatDisbursementStatus = (status) => {
  const statusMap = {
    pending: {
      label: 'Pending',
      color: 'yellow',
      icon: '⏳',
      description: 'Disbursement initiated, awaiting transfer'
    },
    processing: {
      label: 'Processing',
      color: 'blue',
      icon: '🔄',
      description: 'Transfer in progress'
    },
    completed: {
      label: 'Completed',
      color: 'green',
      icon: '✅',
      description: 'Amount successfully transferred'
    },
    failed: {
      label: 'Failed',
      color: 'red',
      icon: '❌',
      description: 'Transfer failed'
    }
  };

  return statusMap[status] || statusMap.pending;
};

/**
 * Format payment method for display
 * @param {string} method - Payment method
 * @returns {string} Formatted method name
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    UPI: 'UPI Transfer',
    IMPS: 'IMPS (Instant)',
    NEFT: 'NEFT (2-3 hours)',
    RTGS: 'RTGS (Instant)',
    MANUAL: 'Manual Bank Transfer'
  };

  return methodMap[method] || method;
};

/**
 * Validate bank account number
 * @param {string} accountNumber - Account number
 * @returns {Object} Validation result
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return { valid: false, error: 'Account number is required' };
  }

  const cleaned = accountNumber.replace(/\s/g, '');
  
  if (!/^\d{9,18}$/.test(cleaned)) {
    return { valid: false, error: 'Account number must be 9-18 digits' };
  }

  return { valid: true, cleaned };
};

/**
 * Validate IFSC code
 * @param {string} ifscCode - IFSC code
 * @returns {Object} Validation result
 */
export const validateIFSCCode = (ifscCode) => {
  if (!ifscCode) {
    return { valid: false, error: 'IFSC code is required' };
  }

  const cleaned = ifscCode.toUpperCase().replace(/\s/g, '');
  
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid IFSC code format (e.g., SBIN0001234)' };
  }

  return { valid: true, cleaned };
};

/**
 * Validate UPI ID
 * @param {string} upiId - UPI ID
 * @returns {Object} Validation result
 */
export const validateUPIId = (upiId) => {
  if (!upiId) {
    return { valid: true }; // UPI is optional
  }

  const cleaned = upiId.toLowerCase().trim();
  
  if (!/^[a-z0-9._-]+@[a-z]+$/.test(cleaned)) {
    return { valid: false, error: 'Invalid UPI ID format (e.g., username@bank)' };
  }

  return { valid: true, cleaned };
};

/**
 * Get bank name from IFSC code
 * @param {string} ifscCode - IFSC code
 * @returns {string} Bank name
 */
export const getBankNameFromIFSC = (ifscCode) => {
  if (!ifscCode || ifscCode.length < 4) return 'Unknown Bank';

  const bankCodes = {
    SBIN: 'State Bank of India',
    HDFC: 'HDFC Bank',
    ICIC: 'ICICI Bank',
    AXIS: 'Axis Bank',
    PUNB: 'Punjab National Bank',
    UBIN: 'Union Bank of India',
    IDFB: 'IDFC FIRST Bank',
    KKBK: 'Kotak Mahindra Bank',
    YESB: 'Yes Bank',
    BKID: 'Bank of India',
    CNRB: 'Canara Bank',
    BARB: 'Bank of Baroda',
    IBKL: 'IDBI Bank',
    UTIB: 'Axis Bank',
    INDB: 'IndusInd Bank'
  };

  const prefix = ifscCode.substring(0, 4).toUpperCase();
  return bankCodes[prefix] || 'Other Bank';
};

export default {
  initiateDisbursement,
  completeDisbursement,
  failDisbursement,
  getPendingDisbursements,
  getLoanDisbursements,
  getUserDisbursements,
  getDisbursementById,
  getDisbursementStats,
  formatDisbursementStatus,
  formatPaymentMethod,
  validateAccountNumber,
  validateIFSCCode,
  validateUPIId,
  getBankNameFromIFSC
};
