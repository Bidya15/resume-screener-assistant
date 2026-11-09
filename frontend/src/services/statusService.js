import api from './api';

/**
 * Updates the HR recruitment status for a candidate analysis.
 *
 * @param {number|string} analysisId - The analysis ID
 * @param {string} status - One of: NEW, SHORTLISTED, UNDER_REVIEW, NOT_SUITABLE
 * @param {string|null} reason - Optional reason / HR note
 * @returns {Promise<object>} Updated AnalysisResponse
 */
export async function updateRecruitmentStatus(analysisId, status, reason = null) {
  const response = await api.patch(`/api/analyses/${analysisId}/status`, {
    status,
    reason: reason || null,
  });
  return response.data;
}

/**
 * Fetches the status change audit history for one candidate.
 *
 * @param {number|string} analysisId
 * @returns {Promise<Array>} Array of StatusHistoryDTO objects
 */
export async function getStatusHistory(analysisId) {
  const response = await api.get(`/api/analyses/${analysisId}/status-history`);
  return response.data;
}

