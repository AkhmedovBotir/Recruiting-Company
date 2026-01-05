/**
 * Authentication service
 * Handles all authentication-related API calls
 */

import { apiRequest } from './api.js';
import { setToken, removeToken } from '../utils/token.js';

/**
 * Login admin
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<object>} Login response with token and admin data
 */
export const login = async (username, password) => {
  try {
    const response = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false);

    if (response.success && response.data.token) {
      setToken(response.data.token);
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current admin information
 * @returns {Promise<object>} Admin data
 */
export const getCurrentAdmin = async () => {
  try {
    const response = await apiRequest('/admin/me', {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    // If token is invalid, remove it
    if (error.status === 401) {
      removeToken();
    }
    throw error;
  }
};

/**
 * Logout admin
 */
export const logout = () => {
  removeToken();
};

