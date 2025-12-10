import api from './api';

/**
 * Request EMI delay (1-2 days only)
 */
export const requestEMIDelay = async (delayData) => {
  const response = await api.post('/delays', delayData);
  return response.data;
};

/**
 * Get user's delay requests
 */
export const getUserDelays = async () => {
  const response = await api.get('/delays/user');
  return response.data;
};

/**
 * Get delays for specific loan
 */
export const getLoanDelays = async (loanId) => {
  const response = await api.get(`/delays/loan/${loanId}`);
  return response.data;
};

/**
 * Calculate delay charges (preview)
 */
export const calculateDelayCharges = async (emiAmount, delayDays, hasFlexPlus = false) => {
  const response = await api.post('/delays/calculate-charges', {
    emi_amount: emiAmount,
    delay_days: delayDays,
    has_flex_subscription: hasFlexPlus
  });
  return response.data;
};

export default {
  requestEMIDelay,
  getUserDelays,
  getLoanDelays,
  calculateDelayCharges,
};
