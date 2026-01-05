/**
 * Vacancy service
 * Handles all vacancy-related API calls
 */

import { apiRequest } from './api.js';

/**
 * Get all vacancies with pagination and filters
 * @param {object} params - Query parameters (status, workType, company, page, limit, search)
 * @returns {Promise<object>} Vacancies data with pagination
 */
export const getAllVacancies = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.workType) queryParams.append('workType', params.workType);
    if (params.company) queryParams.append('company', params.company);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/vacancies?${queryString}` : '/vacancies';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single vacancy by ID
 * @param {string} id - Vacancy ID
 * @returns {Promise<object>} Vacancy data
 */
export const getVacancyById = async (id) => {
  try {
    const response = await apiRequest(`/vacancies/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new vacancy
 * @param {object} vacancyData - Vacancy data
 * @returns {Promise<object>} Created vacancy data
 */
export const createVacancy = async (vacancyData) => {
  try {
    const response = await apiRequest('/vacancies', {
      method: 'POST',
      body: JSON.stringify(vacancyData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update vacancy
 * @param {string} id - Vacancy ID
 * @param {object} vacancyData - Updated vacancy data
 * @returns {Promise<object>} Updated vacancy data
 */
export const updateVacancy = async (id, vacancyData) => {
  try {
    const response = await apiRequest(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vacancyData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Close vacancy
 * @param {string} id - Vacancy ID
 * @returns {Promise<object>} Success response
 */
export const closeVacancy = async (id) => {
  try {
    const response = await apiRequest(`/vacancies/${id}/close`, {
      method: 'PATCH',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete vacancy
 * @param {string} id - Vacancy ID
 * @returns {Promise<object>} Success response
 */
export const deleteVacancy = async (id) => {
  try {
    const response = await apiRequest(`/vacancies/${id}`, {
      method: 'DELETE',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

