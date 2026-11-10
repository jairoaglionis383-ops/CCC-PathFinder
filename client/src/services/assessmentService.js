import apiClient from './apiClient';

// assessmentService - the only place in the frontend that calls
// POST /api/v1/assessment/start and POST /api/v1/assessment/submit.
// Pages never call apiClient directly (per the Phase 2 API
// Communication Strategy) - AssessmentPage calls these functions
// instead.

/**
 * @returns {Promise<{ sessionId: string }>}
 */
export async function startAssessmentSession() {
  return apiClient.post('/assessment/start');
}

/**
 * @param {object} payload - {
 *   sessionId, studentInfo: { firstName, lastName, email,
 *     seniorHighStrand, schoolName, additionalInfo }, language,
 *   answers: [{ questionId, likertValue }]
 * }
 * @returns {Promise<{ sessionId: string, submittedAt: string }>}
 */
export async function submitAssessment(payload) {
  return apiClient.post('/assessment/submit', payload);
}
