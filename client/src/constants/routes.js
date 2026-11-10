// Route path constants, matching the Phase 2 Architecture document's
// route table exactly. Defined once here so pages, the router, and
// any <Link>/navigate() call all reference the same strings instead
// of retyping paths.

export const ROUTES = Object.freeze({
  landing: '/',
  studentInfo: '/student-info',
  languageSelect: '/questionnaire/language',
  assessment: '/questionnaire',
  processing: '/processing',
  results: '/results/:sessionId',
  readiness: '/readiness/:departmentCode',
  dashboard: '/dashboard',
  adminLogin: '/admin/login',
  adminRoot: '/admin',
  adminReports: '/admin/reports',
});

export function resultsPath(sessionId) {
  return `/results/${sessionId}`;
}

export function readinessPath(departmentCode) {
  return `/readiness/${departmentCode}`;
}
