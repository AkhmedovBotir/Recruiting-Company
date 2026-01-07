/**
 * Certificate service
 * Handles all certificate-related API calls for admin
 */

import { apiRequest } from './api.js';

/**
 * Get candidates eligible for certificate
 * @param {object} params - Query parameters (vacancyId, page, limit)
 * @returns {Promise<object>} Eligible candidates data with pagination
 */
export const getCandidatesEligible = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/certificates/candidates-eligible?${queryString}`
      : '/admin/certificates/candidates-eligible';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Issue certificate
 * @param {object} data - Certificate data (interviewId)
 * @returns {Promise<object>} Created certificate data
 */
export const issueCertificate = async (data) => {
  try {
    console.log('Issuing certificate with data:', data);
    
    const response = await apiRequest('/admin/certificates', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);

    return response;
  } catch (error) {
    console.error('Error in issueCertificate:', error);
    throw error;
  }
};

/**
 * Get all certificates with pagination and filters
 * @param {object} params - Query parameters (candidateId, vacancyId, status, page, limit)
 * @returns {Promise<object>} Certificates data with pagination
 */
export const getAllCertificates = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.candidateId) queryParams.append('candidateId', params.candidateId);
    if (params.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/certificates?${queryString}`
      : '/admin/certificates';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single certificate by ID
 * @param {string} id - Certificate ID
 * @returns {Promise<object>} Certificate data
 */
export const getCertificateById = async (id) => {
  try {
    const response = await apiRequest(`/admin/certificates/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Revoke certificate
 * @param {string} id - Certificate ID
 * @returns {Promise<object>} Revoked certificate data
 */
export const revokeCertificate = async (id) => {
  try {
    const response = await apiRequest(`/admin/certificates/${id}/revoke`, {
      method: 'PATCH',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get certificate data for frontend (with image and QR code URL)
 * @param {string} id - Certificate ID
 * @returns {Promise<object>} Certificate data for frontend editing
 */
export const getCertificateForFrontend = async (id) => {
  try {
    const response = await apiRequest(`/admin/certificates/${id}/for-frontend`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Save certificate base64 (save edited certificate image)
 * @param {string} id - Certificate ID
 * @param {string} certificateBase64 - Certificate image in base64 format
 * @returns {Promise<object>} Saved certificate data
 */
export const saveCertificate = async (id, certificateBase64) => {
  try {
    const response = await apiRequest(`/admin/certificates/${id}/save-certificate`, {
      method: 'PUT',
      body: JSON.stringify({ certificateBase64 }),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify certificate by QR code (public endpoint)
 * Note: Backend default redirects to frontend, so we request JSON explicitly
 * @param {string} qrCode - QR code token
 * @returns {Promise<object>} Certificate verification data
 */
export const verifyCertificate = async (qrCode) => {
  try {
    // Ask for JSON to avoid redirect
    const response = await apiRequest(`/certificates/verify/${qrCode}?format=json`, {
      method: 'GET',
    }, false); // Public endpoint, no auth required

    return response;
  } catch (error) {
    throw error;
  }
};

