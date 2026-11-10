import apiClient from './apiClient';

// resultsService - the only place in the frontend that calls
// GET /api/v1/results/:sessionId.

/**
 * @param {string} sessionId
 * @returns {Promise<{ sessionId: string, results: object[] }>}
 */
export async function fetchResults(sessionId) {
  const data = await apiClient.get(`/results/${sessionId}`);
  assertValidResults(data);
  return data;
}

// The backend is the only place scores are computed. This only checks
// that what came back is usable (non-empty list, finite percentages
// from 0 to 100, whole ranks) so a malformed response becomes a normal
// error message instead of a blank page, NaN or a crash.
function assertValidResults(data) {
  const rows = data && data.results;
  const valid =
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.every(
      (row) =>
        row &&
        typeof row.departmentCode === 'string' &&
        Number.isFinite(row.percentageScore) &&
        row.percentageScore >= 0 &&
        row.percentageScore <= 100 &&
        Number.isInteger(row.rank) &&
        row.rank >= 1
    );
  if (!valid) {
    throw {
      message: 'We received an incomplete result from the server. Please try again.',
      status: 502,
    };
  }
}
