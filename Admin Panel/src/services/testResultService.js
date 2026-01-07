/**
 * Test Result service
 * Handles all test result-related API calls for admin
 */

import { apiRequest } from './api.js';

/**
 * Get all test results with pagination and filters
 * @param {object} params - Query parameters (candidateId, materialId, vacancyId, minScore, maxScore, page, limit)
 * @returns {Promise<object>} Test results data with pagination
 */
export const getAllTestResults = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.candidateId) queryParams.append('candidateId', params.candidateId);
    if (params.materialId) queryParams.append('materialId', params.materialId);
    if (params.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params.minScore) queryParams.append('minScore', params.minScore);
    if (params.maxScore) queryParams.append('maxScore', params.maxScore);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/test-results?${queryString}` : '/admin/test-results';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single test result by ID
 * @param {string} id - Test Result ID
 * @returns {Promise<object>} Test result data
 */
export const getTestResultById = async (id) => {
  try {
    const response = await apiRequest(`/admin/test-results/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get test results by candidate ID
 * @param {string} candidateId - Candidate ID
 * @param {object} params - Query parameters (page, limit)
 * @returns {Promise<object>} Test results data with pagination
 */
export const getTestResultsByCandidate = async (candidateId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/test-results/candidate/${candidateId}?${queryString}`
      : `/admin/test-results/candidate/${candidateId}`;

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get test results by material ID
 * @param {string} materialId - Material ID
 * @param {object} params - Query parameters (page, limit, minScore, maxScore)
 * @returns {Promise<object>} Test results data with pagination
 */
export const getTestResultsByMaterial = async (materialId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.minScore) queryParams.append('minScore', params.minScore);
    if (params.maxScore) queryParams.append('maxScore', params.maxScore);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/test-results/material/${materialId}?${queryString}`
      : `/admin/test-results/material/${materialId}`;

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get test results by vacancy ID
 * @param {string} vacancyId - Vacancy ID
 * @param {object} params - Query parameters (page, limit)
 * @returns {Promise<object>} Test results data with pagination
 */
export const getTestResultsByVacancy = async (vacancyId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/test-results/vacancy/${vacancyId}?${queryString}`
      : `/admin/test-results/vacancy/${vacancyId}`;

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};


