import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { ROUTES } from '../constants/routes';

// FlowGuard - lightweight, client-side, session-based step-order
// enforcement. No authentication, no backend calls: it only checks
// the in-memory SessionContext flow flags (set by SessionContext.jsx)
// against the route currently being requested, and redirects back to
// the earliest step that hasn't been completed yet if one is missing.
//
// Two routes are exempt from the check entirely (plus the two direct-view
// routes described below):
// - Student Information is the entry point of this guarded section,
//   so it has no prerequisite.
// - Dashboard is a "check anytime" destination (viewing history isn't
//   part of the linear flow), so it's never blocked.
//
// Everything else (Language Selection, Assessment, Processing,
// Results, Readiness) is compared against the same ordered
// prerequisite chain, which is what keeps this simple: one function,
// no per-route special-casing beyond the two exemptions above.
const EXEMPT_PATHS = new Set([ROUTES.studentInfo, ROUTES.dashboard]);

// Direct-view routes: /results/:sessionId and /readiness/:departmentCode.
// The in-memory flow flags above are lost on a page reload, but these two
// pages do not depend on them - each one loads its own data from the
// backend using the id in the URL (GET /results/:sessionId, GET
// /readiness/:departmentCode). Only these two exact URL shapes are exempt,
// and nothing is assumed to be valid: an unknown session id or program
// code still reaches the page, whose existing error state shows the
// backend's 404. The step-order guard still applies to every other route
// (language, assessment, processing).
const DIRECT_VIEW_PATTERNS = [
  new RegExp(`^${ROUTES.results.replace(':sessionId', '[^/]+')}/?$`),
  new RegExp(`^${ROUTES.readiness.replace(':departmentCode', '[^/]+')}/?$`),
];
const isDirectViewPath = (pathname) => DIRECT_VIEW_PATTERNS.some((re) => re.test(pathname));

function getFirstUnmetStepPath(flow) {
  if (!flow.studentInfoCompleted) return ROUTES.studentInfo;
  if (!flow.languageSelected) return ROUTES.languageSelect;
  if (!flow.assessmentStarted) return ROUTES.assessment;
  return null;
}

export default function FlowGuard() {
  const location = useLocation();
  const { state } = useSession();

  if (!EXEMPT_PATHS.has(location.pathname) && !isDirectViewPath(location.pathname)) {
    const requiredPath = getFirstUnmetStepPath(state.flow);
    if (requiredPath && requiredPath !== location.pathname) {
      return <Navigate to={requiredPath} replace />;
    }
  }

  return <Outlet />;
}
