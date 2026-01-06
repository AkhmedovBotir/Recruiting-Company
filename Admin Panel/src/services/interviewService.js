/**
 * Interview service
 * Handles all interview-related API calls for admin
 */

import { apiRequest } from './api.js';

/**
 * Get candidates ready for interview (completed all materials)
 * @param {object} params - Query parameters (vacancyId, page, limit)
 * @returns {Promise<object>} Candidates ready data with pagination
 */
export const getCandidatesReady = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/interviews/candidates-ready?${queryString}`
      : '/admin/interviews/candidates-ready';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all interviews with pagination and filters
 * @param {object} params - Query parameters (candidateId, vacancyId, status, result, page, limit)
 * @returns {Promise<object>} Interviews data with pagination
 */
export const getAllInterviews = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.candidateId) queryParams.append('candidateId', params.candidateId);
    if (params.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params.status) queryParams.append('status', params.status);
    if (params.result) queryParams.append('result', params.result);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/admin/interviews?${queryString}`
      : '/admin/interviews';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single interview by ID
 * @param {string} id - Interview ID
 * @returns {Promise<object>} Interview data
 */
export const getInterviewById = async (id) => {
  try {
    const response = await apiRequest(`/admin/interviews/${id}`, {
      method: 'GET',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Schedule new interview
 * @param {object} interviewData - Interview data (candidateId, vacancyId, content, interviewer, location, date, time)
 * @returns {Promise<object>} Created interview data
 */
export const scheduleInterview = async (interviewData) => {
  try {
    const response = await apiRequest('/admin/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update interview
 * @param {string} id - Interview ID
 * @param {object} interviewData - Interview data to update
 * @returns {Promise<object>} Updated interview data
 */
export const updateInterview = async (id, interviewData) => {
  try {
    const response = await apiRequest(`/admin/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Complete interview
 * @param {string} id - Interview ID
 * @param {object} data - Completion data (result: 'passed' | 'failed')
 * @returns {Promise<object>} Completed interview data
 */
export const completeInterview = async (id, data) => {
  try {
    const response = await apiRequest(`/admin/interviews/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel interview
 * @param {string} id - Interview ID
 * @returns {Promise<object>} Cancelled interview data
 */
export const cancelInterview = async (id) => {
  try {
    const response = await apiRequest(`/admin/interviews/${id}/cancel`, {
      method: 'PATCH',
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Add evaluation to interview
 * @param {string} id - Interview ID
 * @param {object} evaluationData - Evaluation data (text, rating)
 * @returns {Promise<object>} Interview data with new evaluation
 */
export const addEvaluation = async (id, evaluationData) => {
  try {
    const response = await apiRequest(`/admin/interviews/${id}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update evaluation
 * @param {string} id - Interview ID
 * @param {string} evaluationId - Evaluation ID
 * @param {object} evaluationData - Evaluation data to update (text, rating)
 * @returns {Promise<object>} Interview data with updated evaluation
 */
export const updateEvaluation = async (id, evaluationId, evaluationData) => {
  try {
    const response = await apiRequest(`/admin/interviews/${id}/evaluations/${evaluationId}`, {
      method: 'PUT',
      body: JSON.stringify(evaluationData),
    }, true);

    return response;
  } catch (error) {
    throw error;
  }
};

