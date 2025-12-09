import api from './api';

// Detect mobile operator
export const detectOperator = async (mobile) => {
  return await api.post('/recharge/detect-operator', { mobile });
};

// Get mobile recharge plans
export const getRechargePlans = async (operator, circle) => {
  return await api.get('/recharge/plans', { params: { operator, circle } });
};

// Get DTH operators
export const getDTHOperators = async () => {
  return await api.get('/recharge/dth-operators');
};

// Get DTH plans
export const getDTHPlans = async (operator) => {
  return await api.get('/recharge/dth-plans', { params: { operator } });
};

// Process mobile recharge
export const processMobileRecharge = async (rechargeData) => {
  return await api.post('/recharge/mobile', rechargeData);
};

// Process DTH recharge
export const processDTHRecharge = async (rechargeData) => {
  return await api.post('/recharge/dth', rechargeData);
};

// Get recharge history
export const getRechargeHistory = async (type = null, limit = null) => {
  const params = {};
  if (type) params.type = type;
  if (limit) params.limit = limit;
  return await api.get('/recharge/history', { params });
};

// Get recharge statistics
export const getRechargeStats = async () => {
  return await api.get('/recharge/stats');
};
