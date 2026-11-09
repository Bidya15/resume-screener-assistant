import axios from 'axios';

// Single configured Axios instance. Every service function goes through this.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 60000, // AI analysis can be slow, so allow up to a minute
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
    return new Error(serverMsg || `The server returned an error (${err.response.status}). Try again.`);
  }
  if (err.code === 'ECONNABORTED') return new Error('The request timed out. Try again.');
  return new Error('Cannot reach the server. Check that the backend is running and the API URL is correct.');
}

export default api;
