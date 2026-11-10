import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/adminAuthService';
import { ROUTES } from '../constants/routes';

// AdminRouteGuard - mirrors FlowGuard's exact pattern (a pathless
// layout route wrapping specific children, checked once per render).
// This only checks whether a token is PRESENT, not whether it's still
// valid - token validity is enforced by the backend on every request
// regardless (authenticateAdmin), and AdminReportsPage already has an
// explicit 401 branch for "the token exists but was rejected" (an
// expired/invalid session). Duplicating that validity check here
// would just be a second, redundant place for the same logic to
// drift out of sync - the backend remains the single source of truth
// for whether a token is actually valid.
export default function AdminRouteGuard() {
  if (!isAdminAuthenticated()) {
    return <Navigate to={ROUTES.adminLogin} replace />;
  }

  return <Outlet />;
}
