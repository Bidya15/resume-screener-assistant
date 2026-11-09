// Input limits enforced in the UI. Kept in sync with backend Bean Validation constraints.
export const LIMITS = {
  JOB_DESCRIPTION_MAX: 10000,
  RESUME_MAX: 20000,
  MIN_LENGTH: 50,
};

// Candidate score tier thresholds
export const SCORE_THRESHOLDS = {
  STRONG: 70,
  MODERATE: 40,
};

// Application route paths
export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  NEW_ANALYSIS: '/analysis/new',
  ANALYSIS_HISTORY: '/analysis/history',
  ANALYSIS_DETAILS: (id) => `/analysis/${id}`,
  SETTINGS: '/settings',
};
