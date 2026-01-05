/**
 * Application service
 * Handles all application-related API calls
 */

import { apiRequest } from './api.js';

/**
 * Get all applications with pagination and filters
 * @param {object} params - Query parameters (status, vacancy, candidate, page, limit)
 * @returns {Promise<object>} Applications data with pagination
 */
export const getAllApplications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.vacancy) queryParams.append('vacancy', params.vacancy);
    if (params.candidate) queryParams.append('candidate', params.candidate);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/applications?${queryString}` : '/admin/applications';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single application by ID
 * @param {string} id - Application ID
 * @returns {Promise<object>} Application data
 */
export const getApplicationById = async (id) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Accept application for interview
 * @param {string} id - Application ID
 * @param {object} data - Notes (optional)
 * @returns {Promise<object>} Updated application data
 */
export const acceptInterview = async (id, data = {}) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/interview`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark interview as passed
 * @param {string} id - Application ID
 * @param {object} data - Notes (optional)
 * @returns {Promise<object>} Updated application data
 */
export const markInterviewPassed = async (id, data = {}) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/passed`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark interview as failed
 * @param {string} id - Application ID
 * @param {object} data - Notes (optional)
 * @returns {Promise<object>} Updated application data
 */
export const markInterviewFailed = async (id, data = {}) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/failed`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update application status
 * @param {string} id - Application ID
 * @param {object} data - Status and notes
 * @returns {Promise<object>} Updated application data
 */
export const updateApplicationStatus = async (id, data) => {
  try {
    const response = await apiRequest(`/admin/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

