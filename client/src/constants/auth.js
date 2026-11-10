// Single source of truth for the localStorage key the admin JWT is
// stored under. Previously this string was hardcoded directly inside
// apiClient.js's request interceptor with nothing else referencing
// it - now that adminAuthService.js also needs to read/write/clear the
// same value, both import this constant instead of keeping two
// independently-typed copies of the same string that could silently
// drift apart. The value itself is unchanged, so any token already
// stored under the old hardcoded string remains valid.
export const ADMIN_TOKEN_STORAGE_KEY = 'ccc_pathfinder_admin_token';
