import { LIMITS } from './constants';

// Pure function: easy to test and reuse. Returns an object of { fieldName: message }.
export function validateAnalysisInput({ jobDescription, resume }) {
  const errors = {};
  const jd = jobDescription.trim();
  const cv = resume.trim();

  if (!jd) errors.jobDescription = 'Enter the job description.';
  else if (jd.length < LIMITS.MIN_LENGTH) errors.jobDescription = `Add more detail. At least ${LIMITS.MIN_LENGTH} characters are needed.`;
  else if (jobDescription.length > LIMITS.JOB_DESCRIPTION_MAX) errors.jobDescription = `Shorten the job description to ${LIMITS.JOB_DESCRIPTION_MAX.toLocaleString()} characters or fewer.`;

  if (!cv) errors.resume = 'Paste the candidate resume.';
  else if (cv.length < LIMITS.MIN_LENGTH) errors.resume = `Add more detail. At least ${LIMITS.MIN_LENGTH} characters are needed.`;
  else if (resume.length > LIMITS.RESUME_MAX) errors.resume = `Shorten the resume to ${LIMITS.RESUME_MAX.toLocaleString()} characters or fewer.`;

  return errors;
}
