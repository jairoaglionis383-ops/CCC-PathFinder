import apiClient from './apiClient';
import { ADMIN_TOKEN_STORAGE_KEY } from '../constants/auth';

// adminAuthService - the only place in the frontend that calls the
// admin auth endpoints, mirroring every other service file. Also owns
// the small set of token-persistence helpers used by AdminLoginPage,
// AdminLayout's logout action, and AdminRouteGuard - this is the ONE
// mechanism the frontend uses to know "is an admin logged in", not a
// second auth system alongside it. apiClient's existing request
// interceptor already reads this exact same storage key (see
// constants/auth.js) and attaches it as a Bearer token automatically -
// nothing else needs to change for authenticated requests to work
// once login stores a token here.

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, admin: object }>}
 */
export async function login(email, password) {
  const result = await apiClient.post('/admin/auth/login', { email, password });
  setAdminToken(result.token);
  return result;
}

/**
 * Best-effort server-side confirmation (the backend's logout endpoint
 * is a stateless no-op - see auth.controller.js's own comment on
 * this). The token is cleared locally regardless of whether this call
 * succeeds, since discarding the token client-side is what actually
 * ends the session.
 */
export async function logout() {
  try {
    await apiClient.post('/admin/auth/logout');
  } catch {
    // Ignore - clearing the local token below is what matters.
  } finally {
    clearAdminToken();
  }
}

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  try {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  } catch {
    // Non-fatal - the token still works in-memory for this request,
    // just won't survive a refresh.
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
}

export function isAdminAuthenticated() {
  return Boolean(getAdminToken());
}
