/**
 * Application Form service
 * Handles all application form-related API calls
 */

import { apiRequest } from './api.js';

/**
 * Get all application forms with pagination and filters
 * @param {object} params - Query parameters (companyId, vacancyId, status, page, limit)
 * @returns {Promise<object>} Application forms data with pagination
 */
export const getAllApplicationForms = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.companyId) queryParams.append('companyId', params.companyId);
    if (params.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/application-forms?${queryString}` : '/application-forms';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single application form by ID
 * @param {string} id - Application Form ID
 * @returns {Promise<object>} Application Form data
 */
export const getApplicationFormById = async (id) => {
  try {
    const response = await apiRequest(`/application-forms/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get application form by vacancy ID
 * @param {string} vacancyId - Vacancy ID
 * @returns {Promise<object>} Application Form data
 */
export const getApplicationFormByVacancyId = async (vacancyId) => {
  try {
    const response = await apiRequest(`/application-forms/vacancy/${vacancyId}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new application form
 * @param {object} formData - Application Form data
 * @returns {Promise<object>} Created application form data
 */
export const createApplicationForm = async (formData) => {
  try {
    const response = await apiRequest('/application-forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update application form
 * @param {string} id - Application Form ID
 * @param {object} formData - Application Form data to update
 * @returns {Promise<object>} Updated application form data
 */
export const updateApplicationForm = async (id, formData) => {
  try {
    const response = await apiRequest(`/application-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete application form
 * @param {string} id - Application Form ID
 * @returns {Promise<object>} Success response
 */
export const deleteApplicationForm = async (id) => {
  try {
    const response = await apiRequest(`/application-forms/${id}`, {
      method: 'DELETE',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};


