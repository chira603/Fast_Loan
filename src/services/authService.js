import api from './api';

// Register user
export const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  // Save token and user data
  if (response.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Get current user
export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

// Update password
export const updatePassword = async (passwords) => {
  return await api.put('/auth/updatepassword', passwords);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get user from local storage
export const getUserFromStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUserFromStorage();
  return user && user.role === 'admin';
};
