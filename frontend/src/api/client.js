import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wbso-time-tracker-production.up.railway.app'
  : 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      alert('Too many requests. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      alert('Request timeout. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
