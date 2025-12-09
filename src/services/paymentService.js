import api from './api';

export const getPaymentsByLoan = async (loanId) => {
  return await api.get(`/payments/loan/${loanId}`);
};

export const getPaymentsByUser = async () => {
  return await api.get('/payments/user');
};
