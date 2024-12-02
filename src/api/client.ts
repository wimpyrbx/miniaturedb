/**
 * @file client.ts
 * @description Centralized API client with auth handling
 */

import axios from 'axios';

export interface LoginCredentials {
  username: string;
  password: string;
}

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true, // Required for cookies/session
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for auth handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const checkAuth = async () => {
  const response = await api.get('/api/auth/status');
  return response.data;
};

export default api;
