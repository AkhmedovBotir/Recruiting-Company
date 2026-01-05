/**
 * Token management utilities
 * Handles JWT token storage and retrieval from localStorage
 */

const TOKEN_KEY = 'admin_token';

/**
 * Save token to localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} true if token exists
 */
export const isAuthenticated = () => {
  return !!getToken();
};

