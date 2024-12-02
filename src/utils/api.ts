import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 