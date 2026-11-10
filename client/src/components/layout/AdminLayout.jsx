import { Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../services/adminAuthService';
import { ROUTES } from '../../constants/routes';

// AdminLayout - the admin branch's own root layout, isolated from
// PageShell/Header/Footer per the Phase 2 scalability decision. Adds
// a minimal Log Out action (Admin Authentication milestone) - always
// rendered rather than conditionally shown based on auth state, since
// that would require making this layout reactive to login/logout
// events; clicking it while already logged out is a harmless no-op
// (clears an already-absent token, redirects to a page you're already
// heading toward anyway).
export default function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.adminLogin, { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-light">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <p className="font-mono text-small tracking-wide">CCC PathFinder — Admin</p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-small text-white/80 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
          >
            Log Out
          </button>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
