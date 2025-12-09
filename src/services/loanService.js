import api from './api';

// Create loan application
export const createLoan = async (loanData) => {
  return await api.post('/loans', loanData);
};

// Get all loans (user's loans or all for admin)
export const getLoans = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return await api.get(`/loans?${params}`);
};

// Get single loan by ID
export const getLoanById = async (loanId) => {
  return await api.get(`/loans/${loanId}`);
};

// Update loan status (admin only)
export const updateLoanStatus = async (loanId, status, notes = '') => {
  return await api.put(`/loans/${loanId}/status`, { status, notes });
};

// Get loan statistics
export const getLoanStatistics = async () => {
  return await api.get('/loans/user/stats');
};

// Delete loan (admin only)
export const deleteLoan = async (loanId) => {
  return await api.delete(`/loans/${loanId}`);
};

// Get active loans
export const getActiveLoans = async () => {
  return await api.get('/loans?status=approved,disbursed');
};
