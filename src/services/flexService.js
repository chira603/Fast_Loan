import api from './api';

/**
 * Get Flex+ pricing plans
 */
export const getFlexPricing = async () => {
  const response = await api.get('/flex/pricing');
  return response.data;
};

/**
 * Subscribe to Flex+ membership
 */
export const subscribeToFlex = async (subscriptionData) => {
  const response = await api.post('/flex/subscribe', subscriptionData);
  return response.data;
};

/**
 * Get user's active subscription
 */
export const getMySubscription = async () => {
  const response = await api.get('/flex/my-subscription');
  return response.data;
};

/**
 * Get subscription history
 */
export const getSubscriptionHistory = async () => {
  const response = await api.get('/flex/history');
  return response.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  const response = await api.post(`/flex/cancel/${subscriptionId}`);
  return response.data;
};

/**
 * Renew subscription
 */
export const renewSubscription = async (durationMonths) => {
  const response = await api.post('/flex/renew', { duration_months: durationMonths });
  return response.data;
};

/**
 * Check Flex+ status
 */
export const checkFlexStatus = async () => {
  const response = await api.get('/flex/check-status');
  return response.data;
};

/**
 * Get Flex+ statistics (admin)
 */
export const getFlexStats = async () => {
  const response = await api.get('/flex/stats');
  return response.data;
};

export default {
  getFlexPricing,
  subscribeToFlex,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
  renewSubscription,
  checkFlexStatus,
  getFlexStats,
};
