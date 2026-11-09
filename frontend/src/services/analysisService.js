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

export function createAnalysis({ candidateName, jobDescription, resume, resumeText }) {
  return request(async () => {
    const { data } = await api.post(ENDPOINTS.analyses, {
      candidateName: (candidateName && candidateName.trim()) ? candidateName.trim() : 'Unknown',
      jobDescription: (jobDescription || '').trim(),
      resumeText: (resumeText || resume || '').trim(),
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
