/**
 * Company service
 * Handles all company-related API calls
 */

import { apiRequest } from './api.js';

/**
 * Get all companies with pagination and filters
 * @param {object} params - Query parameters (status, page, limit, search)
 * @returns {Promise<object>} Companies data with pagination
 */
export const getAllCompanies = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/companies?${queryString}` : '/companies';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single company by ID
 * @param {string} id - Company ID
 * @returns {Promise<object>} Company data
 */
export const getCompanyById = async (id) => {
  try {
    const response = await apiRequest(`/companies/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new company
 * @param {object} companyData - Company data
 * @returns {Promise<object>} Created company data
 */
export const createCompany = async (companyData) => {
  try {
    const response = await apiRequest('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update company
 * @param {string} id - Company ID
 * @param {object} companyData - Updated company data
 * @returns {Promise<object>} Updated company data
 */
export const updateCompany = async (id, companyData) => {
  try {
    const response = await apiRequest(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete company
 * @param {string} id - Company ID
 * @returns {Promise<object>} Success response
 */
export const deleteCompany = async (id) => {
  try {
    const response = await apiRequest(`/companies/${id}`, {
      method: 'DELETE',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

