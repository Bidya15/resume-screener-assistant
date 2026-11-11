import axios from 'axios';

// Normalise the API base URL:
// - Render's `fromService.property: hostURL` already includes https://, e.g. https://resume-screener-backend.onrender.com
// - If the env var is set to just a hostname (no protocol), prefix https://
// - Fall back to localhost:8080 for local development
function resolveBaseURL() {
  const raw = import.meta.env.VITE_API_BASE_URL || '';
  if (!raw) return 'http://localhost:8080';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `https://${raw}`;
}

// Single configured Axios instance. Every service function goes through this.
const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 90000, // 90s to comfortably tolerate cloud free-tier cold starts and LLM generation
  headers: { 'Content-Type': 'application/json' },
});

// Turn any Axios failure into one predictable Error with a user-readable message.
// Components only ever need `error.message`.
export function toFriendlyError(err) {
  if (err.response) {
    const data = err.response.data;
    const serverMsg = (data && (data.message || data.error || data.detail)) || null;
    if (err.response.status === 404) return new Error(serverMsg || 'The requested item was not found.');
    if (err.response.status === 400) return new Error(serverMsg || 'The server rejected the request. Check your input.');
    if (err.response.status === 429) return new Error('The AI provider is rate limiting requests. Please try again shortly.');
    if (err.response.status === 502) return new Error('The AI service returned an unexpected response. Please try again.');
    if (err.response.status >= 500) return new Error(serverMsg || 'A server error occurred. Please try again.');
    return new Error(serverMsg || `The server returned an error (${err.response.status}). Try again.`);
  }
  if (err.code === 'ECONNABORTED') return new Error('The request timed out. The backend may be waking up from sleep — please wait 30 seconds and try again.');
  if (err.code === 'ERR_NETWORK') return new Error('Cannot reach the server. It may be starting up — please try again in a moment.');
  return new Error('Cannot reach the server. Check that the backend is running and the API URL is correct.');
}

export default api;
