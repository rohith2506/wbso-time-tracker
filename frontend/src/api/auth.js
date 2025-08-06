import apiClient from './client';

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    return { user, token: access_token };
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    // For now, we'll store user data in localStorage after login
    // In a real app, you might want a /me endpoint
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};
