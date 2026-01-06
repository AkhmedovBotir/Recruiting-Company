/**
 * Material service
 * Handles all material-related API calls
 */

import { apiRequest } from './api.js';

/**
 * Get all materials with pagination and filters
 * @param {object} params - Query parameters (vacancy, company, isActive, page, limit)
 * @returns {Promise<object>} Materials data with pagination
 */
export const getAllMaterials = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.vacancy) queryParams.append('vacancy', params.vacancy);
    if (params.company) queryParams.append('company', params.company);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/materials?${queryString}` : '/admin/materials';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single material by ID
 * @param {string} id - Material ID
 * @returns {Promise<object>} Material data
 */
export const getMaterialById = async (id) => {
  try {
    const response = await apiRequest(`/admin/materials/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new material
 * @param {object} materialData - Material data
 * @returns {Promise<object>} Created material data
 */
export const createMaterial = async (materialData) => {
  try {
    const response = await apiRequest('/admin/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update material
 * @param {string} id - Material ID
 * @param {object} materialData - Material data to update
 * @returns {Promise<object>} Updated material data
 */
export const updateMaterial = async (id, materialData) => {
  try {
    const response = await apiRequest(`/admin/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete material
 * @param {string} id - Material ID
 * @returns {Promise<object>} Success response
 */
export const deleteMaterial = async (id) => {
  try {
    const response = await apiRequest(`/admin/materials/${id}`, {
      method: 'DELETE',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};
