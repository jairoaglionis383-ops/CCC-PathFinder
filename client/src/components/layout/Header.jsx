// Header - the persistent site header for the student-facing shell.
// Deliberately minimal: brand mark + institution name only. No nav
// links to other flow steps (that would be a flow/UX decision outside
// this milestone's scope) and no auth-aware UI (admin login state is
// explicitly out of scope here, per instruction).
//
// The brand mark + name is a Home link (Landing Page) on every student-facing
// page. It only navigates: it never clears saved results, history or the
// in-progress draft (those are cleared only by the explicit Retake / New
// Assessment / End Session actions on the Dashboard).
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-navy/5 shadow-1">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <Link
          to={ROUTES.landing}
          aria-label="CCC PathFinder, City College of Calamba - go to the Home page"
          className="inline-flex items-center gap-3 rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2"
        >
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="12.5" fill="none" stroke="var(--color-sky)" strokeWidth="1.5" />
          <path d="M14 5 L16.5 14 L14 23 L11.5 14 Z" fill="var(--color-sky)" />
          <circle cx="14" cy="14" r="1.75" fill="var(--color-navy)" />
        </svg>
        <div className="leading-tight">
          <p className="font-display font-semibold text-h3 text-navy">CCC PathFinder</p>
          <p className="text-caption uppercase tracking-wide text-gray-dark">
            City College of Calamba
          </p>
        </div>
        </Link>
      </div>
    </header>
  );
}
