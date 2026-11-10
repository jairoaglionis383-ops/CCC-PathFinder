// The one Axios instance every service/* file imports, per the Phase 2
// API Communication Strategy. Response interceptor unwraps the
// backend's standard { success, data, message } envelope (see Phase 4
// utils/apiResponse.js on the server) so calling code just gets `data`
// back, or a thrown error with the backend's message attached.
//
// Scope boundary (explicit, per current-phase instruction): this file
// configures a request interceptor (attach token) and a response
// interceptor (unwrap envelope / normalize errors) only. No token
// refresh, no automatic retry, no auth-recovery redirect logic lives
// here - a 401 is simply surfaced as a rejected promise for the
// calling code (or a future auth context) to react to.

import axios from 'axios';
import { ADMIN_TOKEN_STORAGE_KEY } from '../constants/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

const apiClient = axios.create({
  baseURL,
  // Without a timeout a server that never answers leaves the page waiting
  // forever; after 20 s the request fails and the normal error screen with
  // "Try again" appears.
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attaches the admin JWT, if present, to every request. Harmless for
// public/student-facing endpoints - the backend simply ignores an
// Authorization header on routes that don't require it.
apiClient.interceptors.request.use((config) => {
  // Storage can be blocked (private mode / disabled site data); a failed
  // read must never stop a public request from being sent.
  let token = null;
  try {
    token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    token = null;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data?.data,
  (error) => {
    const envelope = error.response?.data;
    const message = envelope?.message || error.message || 'Something went wrong.';
    const status = error.response?.status;

    return Promise.reject({ message, status, raw: error });
  }
);

export default apiClient;
