import apiClient from './apiClient';

// adminReportsService - the only place in the frontend that calls the
// admin report endpoints, mirroring readinessService.js/resultsService.js
// exactly. These all require an admin Bearer token - apiClient already
// attaches one automatically if present in localStorage (see
// apiClient.js's request interceptor); this file has no auth logic of
// its own, same as every other service.

/**
 * @returns {Promise<{ totalAssessmentsCompleted: number, mostRecommendedDepartment: object|null, generatedAt: string }>}
 */
export async function fetchReportSummary() {
  return apiClient.get('/admin/reports/summary');
}

/**
 * @returns {Promise<{ totalAssessmentsCompleted: number, departments: object[] }>}
 */
export async function fetchReportDistribution() {
  return apiClient.get('/admin/reports/distribution');
}

/**
 * @param {number} [limit]
 * @returns {Promise<{ assessmentCountsByDate: object[], recentActivity: object[] }>}
 */
export async function fetchReportActivity(limit) {
  return apiClient.get('/admin/reports/activity', { params: limit ? { limit } : undefined });
}
