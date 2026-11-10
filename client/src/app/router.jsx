import { createBrowserRouter, Navigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import FlowGuard from './FlowGuard';
import { ROUTES } from '../constants/routes';

import LandingPage from '../pages/landing/LandingPage';
import StudentInfoPage from '../pages/student-info/StudentInfoPage';
import LanguageSelectionPage from '../pages/language-select/LanguageSelectionPage';
import AssessmentPage from '../pages/assessment/AssessmentPage';
import ProcessingPage from '../pages/processing/ProcessingPage';
import ResultsPage from '../pages/results/ResultsPage';
import ProgramReadinessPage from '../pages/program-readiness/ProgramReadinessPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

// This file's SHAPE is final: createBrowserRouter is the only routing
// primitive used, FlowGuard is the designated wrapper for step-order-
// sensitive routes, and path strings always come from
// src/constants/routes.js, never inline literals.
//
// The route TREE below matches the Phase 2 architecture document's
// route table exactly. Every leaf now has its real page element
// (Milestone 4) - each page is a route-level scaffold only (layout +
// shared components), with no business/assessment/scoring/auth logic
// behind it yet.

// React Router path segments are relative when nested; ROUTES stores
// absolute paths for use elsewhere (<Link>, navigate()). This strips
// the leading slash so the same constants can be reused here as
// child-route segments without duplicating the strings.
const relative = (absolutePath) => absolutePath.replace(/^\//, '');

export const router = createBrowserRouter([
  {
    // Pathless layout route: wraps every student-facing path in
    // PageShell (Header/Footer) without consuming a URL segment itself.
    element: <PageShell />,
    children: [
      { index: true, element: <LandingPage /> }, // ROUTES.landing ('/')
      {
        // FlowGuard wraps every step from Student Information through
        // Dashboard - the step-order-sensitive part of the journey.
        // Landing sits outside it since there's no prior step to enforce.
        element: <FlowGuard />,
        children: [
          { path: relative(ROUTES.studentInfo), element: <StudentInfoPage /> },
          { path: relative(ROUTES.languageSelect), element: <LanguageSelectionPage /> },
          { path: relative(ROUTES.assessment), element: <AssessmentPage /> },
          { path: relative(ROUTES.processing), element: <ProcessingPage /> },
          { path: relative(ROUTES.results), element: <ResultsPage /> },
          { path: relative(ROUTES.readiness), element: <ProgramReadinessPage /> },
          { path: relative(ROUTES.dashboard), element: <DashboardPage /> },
        ],
      },
    ],
  },
  {
    // Admin backend is out of scope for the local thesis prototype
    // (student flow only). There is no visible admin link in the
    // student UI; direct visits to /admin/* are sent back to the
    // landing page instead of showing a page that cannot work.
    path: `${ROUTES.adminRoot}/*`,
    element: <Navigate to={ROUTES.landing} replace />,
  },
  {
    // Any other unknown URL goes back to the landing page instead of
    // React Router's default "Unexpected Application Error" screen.
    path: '*',
    element: <Navigate to={ROUTES.landing} replace />,
  },
]);
