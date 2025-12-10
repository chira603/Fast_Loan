import api from './api';

/**
 * Loan Payment Service
 * Handles loan EMI payments and repayments
 */

// Initiate a loan payment
export const initiateLoanPayment = async (paymentData) => {
  return await api.post('/loan-payments/initiate', paymentData);
};

// Get payment by ID
export const getLoanPaymentById = async (paymentId) => {
  return await api.get(`/loan-payments/${paymentId}`);
};

// Get payment by transaction reference
export const getLoanPaymentByRef = async (transactionRef) => {
  return await api.get(`/loan-payments/transaction/${transactionRef}`);
};

// Verify payment status
export const verifyLoanPayment = async (verificationData) => {
  return await api.post('/loan-payments/verify', verificationData);
};

// Get all payments for a loan
export const getLoanPayments = async (loanId) => {
  return await api.get(`/loan-payments/loan/${loanId}`);
};

// Get all payments for current user
export const getUserLoanPayments = async () => {
  return await api.get('/loan-payments/user/all');
};

// Get next EMI details for a loan
export const getNextEMI = async (loanId) => {
  return await api.get(`/loan-payments/loan/${loanId}/next-emi`);
};

// Open UPI app with payment link
export const openUPIApp = (upiLink) => {
  window.location.href = upiLink;
};

// Generate UPI intent URL for specific app
export const generateAppSpecificUPILink = (upiLink, appId) => {
  // Extract parameters from UPI link
  const url = new URL(upiLink.replace('upi://', 'https://'));
  const params = new URLSearchParams(url.search);
  
  // App-specific deep link formats
  const appLinks = {
    phonepe: `phonepe://pay?${params.toString()}`,
    googlepay: `tez://upi/pay?${params.toString()}`,
    paytm: `paytmmp://pay?${params.toString()}`,
    bhim: `bhim://pay?${params.toString()}`,
  };
  
  return appLinks[appId] || upiLink;
};

export default {
  initiateLoanPayment,
  getLoanPaymentById,
  getLoanPaymentByRef,
  verifyLoanPayment,
  getLoanPayments,
  getUserLoanPayments,
  getNextEMI,
  openUPIApp,
  generateAppSpecificUPILink,
};
