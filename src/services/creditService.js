import api from './api';

export const getCreditCard = async () => {
  return await api.get('/credit-card');
};

export const getCreditStats = async () => {
  return await api.get('/credit-card/stats');
};
