import api from './api';

// Get bill operators by category
export const getBillOperators = async (category) => {
  return await api.get('/bills/operators', { params: { category } });
};

// Fetch bill details
export const fetchBillDetails = async (billerId, accountNumber) => {
  return await api.post('/bills/fetch', { billerId, accountNumber });
};

// Pay bill
export const payBill = async (paymentData) => {
  return await api.post('/bills/pay', paymentData);
};

// Get bill payment history
export const getBillHistory = async (category = null, limit = null) => {
  const params = {};
  if (category) params.category = category;
  if (limit) params.limit = limit;
  return await api.get('/bills/history', { params });
};

// Get saved billers
export const getSavedBillers = async (category = null) => {
  const params = {};
  if (category) params.category = category;
  return await api.get('/bills/saved', { params });
};

// Save biller
export const saveBiller = async (billerData) => {
  return await api.post('/bills/save-biller', billerData);
};

// Delete saved biller
export const deleteSavedBiller = async (id) => {
  return await api.delete(`/bills/saved/${id}`);
};

// Get bill payment statistics
export const getBillStats = async () => {
  return await api.get('/bills/stats');
};
