import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// PageShell - the root layout route element (see router.jsx). Composes
// Header + routed content + Footer for every student-facing route.
// Contains no page content itself - <Outlet /> is where the matched
// route's page renders once pages exist.
export default function PageShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
