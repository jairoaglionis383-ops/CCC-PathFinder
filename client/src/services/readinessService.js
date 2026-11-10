import apiClient from './apiClient';

// readinessService - the only place in the frontend that calls
// GET /api/v1/readiness/:departmentCode. Pages never call apiClient
// directly (per the Phase 2 API Communication Strategy); they go
// through a service like this one, mirroring the backend's resource
// 1:1 so it's obvious where to look when a new endpoint appears.

/**
 * @param {string} departmentCode - e.g. 'DCI'
 * @returns {Promise<{ department: object, sections: object[] }>}
 */
export async function fetchReadiness(departmentCode) {
  return apiClient.get(`/readiness/${departmentCode}`);
}
