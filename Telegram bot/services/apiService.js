const axios = require('axios');
const config = require('../config/config');

/**
 * Call API endpoint
 * @param {string} endpoint - API endpoint (e.g., '/register-start')
 * @param {object} data - Request body data
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: array}>}
 */
async function callAPI(endpoint, data) {
  try {
    const response = await axios.post(`${config.api.baseUrl}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      // API returned error response
      return {
        success: false,
        message: error.response.data?.message || 'API error',
        errors: error.response.data?.errors,
      };
    }
    
    if (error.request) {
      // Request made but no response received
      return {
        success: false,
        message: 'Serverga ulanib bo\'lmadi',
      };
    }
    
    // Error in request setup
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
}

/**
 * Register start - Send SMS code
 * @param {object} userData - User registration data
 * @returns {Promise<object>}
 */
async function registerStart(userData) {
  return callAPI('/register-start', {
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    telegramId: userData.telegramId,
  });
}

/**
 * Verify SMS code and create/update candidate
 * @param {object} userData - User registration data
 * @param {string} code - Verification code
 * @returns {Promise<object>}
 */
async function verifyCode(userData, code) {
  return callAPI('/verify', {
    phone: userData.phone,
    code,
    firstName: userData.firstName,
    lastName: userData.lastName,
    telegramId: userData.telegramId,
  });
}

module.exports = {
  callAPI,
  registerStart,
  verifyCode,
};

