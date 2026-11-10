import api, { toFriendlyError } from './api';
import { normalizeAnalysis, normalizeAnalysisList, normalizeStats } from './normalizers';

// ASSUMED endpoints. Confirm against the Spring Boot controllers and edit here if they differ.
const ENDPOINTS = {
  analyses: '/api/analyses',
  dashboardStats: '/api/dashboard/stats',
};

async function request(fn) {
  try {
    return await fn();
  } catch (err) {
    throw toFriendlyError(err);
  }
}

export function createAnalysis(payload) {
  return request(async () => {
    const candidateName = payload.candidateName?.trim() || 'Unknown Candidate';
    const jobDescription = (payload.jobDescription || '').trim();
    const resumeText = (payload.resumeText || payload.resume || '').trim();

    const { data } = await api.post(ENDPOINTS.analyses, {
      candidateName,
      jobDescription,
      resumeText,
      resumeFileData: payload.resumeFileData || null,
      resumeFileName: payload.resumeFileName || null,
      jobDescriptionFileData: payload.jobDescriptionFileData || null,
      jobDescriptionFileName: payload.jobDescriptionFileName || null,
    });
    return normalizeAnalysis(data);
  });
}

export function getAnalyses() {
  return request(async () => normalizeAnalysisList((await api.get(ENDPOINTS.analyses)).data));
}

export function getAnalysisById(id) {
  return request(async () => normalizeAnalysis((await api.get(`${ENDPOINTS.analyses}/${id}`)).data));
}

export function deleteAnalysis(id) {
  return request(async () => {
    await api.delete(`${ENDPOINTS.analyses}/${id}`);
  });
}

export function getDashboardStats() {
  return request(async () => normalizeStats((await api.get(ENDPOINTS.dashboardStats)).data));
}
