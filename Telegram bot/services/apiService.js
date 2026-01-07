const axios = require('axios');
const config = require('../config/config');

/**
 * Call API endpoint (POST) for registration
 * @param {string} endpoint - API endpoint (e.g., '/register-start')
 * @param {object} data - Request body data
 * @returns {Promise<{success: boolean, data?: object, message?: string, errors?: array}>}
 */
async function callAPI(endpoint, data) {
  try {
    const response = await axios.post(`${config.api.registrationBaseUrl}${endpoint}`, data, {
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
 * Call API endpoint (GET) with authentication for bot operations
 * @param {string} endpoint - API endpoint (e.g., '/vacancies')
 * @param {string} token - JWT token
 * @param {object} params - Query parameters
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
async function callAPIGet(endpoint, token, params = {}) {
  try {
    const response = await axios.get(`${config.api.botBaseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params,
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
        status: error.response.status,
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
 * Login start - Send SMS code (only phone required)
 * @param {string} phone - Phone number
 * @returns {Promise<object>}
 */
async function loginStart(phone) {
  return callAPI('/login-start', {
    phone,
  });
}

/**
 * Verify SMS code and check if candidate exists
 * @param {string} phone - Phone number
 * @param {string} code - Verification code
 * @returns {Promise<object>}
 */
async function verifyCode(phone, code) {
  return callAPI('/verify', {
    phone,
    code,
  });
}

/**
 * Register new candidate (after verify returns exists: false)
 * @param {object} userData - User registration data
 * @returns {Promise<object>}
 */
async function register(userData) {
  return callAPI('/register', {
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    telegramId: userData.telegramId,
  });
}

/**
 * Get vacancies list
 * @param {string} token - JWT token
 * @param {object} params - Query parameters (page, limit)
 * @returns {Promise<object>}
 */
async function getVacancies(token, params = {}) {
  return callAPIGet('/vacancies', token, params);
}

/**
 * Get single vacancy
 * @param {string} token - JWT token
 * @param {string} vacancyId - Vacancy ID
 * @returns {Promise<object>}
 */
async function getVacancy(token, vacancyId) {
  return callAPIGet(`/vacancies/${vacancyId}`, token);
}

/**
 * Get candidate profile
 * @param {string} token - JWT token
 * @returns {Promise<object>}
 */
async function getProfile(token) {
  return callAPIGet('/profile', token);
}

/**
 * Get candidate applications
 * @param {string} token - JWT token
 * @param {object} params - Query parameters (status, page, limit)
 * @returns {Promise<object>}
 */
async function getApplications(token, params = {}) {
  return callAPIGet('/applications', token, params);
}

/**
 * Get candidate interviews
 * @param {string} token - JWT token
 * @param {object} params - Query parameters (status, result, page, limit)
 * @returns {Promise<object>}
 */
async function getInterviews(token, params = {}) {
  return callAPIGet('/interviews', token, params);
}

/**
 * Get candidate certificates
 * @param {string} token - JWT token
 * @param {object} params - Query parameters (status, page, limit)
 * @returns {Promise<object>}
 */
async function getCertificates(token, params = {}) {
  return callAPIGet('/certificates', token, params);
}

module.exports = {
  callAPI,
  callAPIGet,
  loginStart,
  verifyCode,
  register,
  getVacancies,
  getVacancy,
  getProfile,
  getApplications,
  getInterviews,
  getCertificates,
};

