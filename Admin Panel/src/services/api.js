/**
 * API service configuration
 * Base API configuration and request utilities
 */

const BASE_URL = 'https://api.milliycrm.uz/api';

/**
 * Create headers with optional authorization
 * @param {boolean} includeAuth - Whether to include auth token
 * @returns {Headers} Headers object
 */
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise} Parsed JSON response
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const error = {
      message: data.message || 'An error occurred',
      errors: data.errors || [],
      status: response.status,
    };
    throw error;
  }

  return data;
};

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {boolean} requireAuth - Whether authentication is required
 * @returns {Promise} API response
 */
export const apiRequest = async (endpoint, options = {}, requireAuth = false) => {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...createHeaders(requireAuth),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  }
};
