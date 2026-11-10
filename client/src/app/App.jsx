import { RouterProvider } from 'react-router-dom';
import AppProviders from './providers/AppProviders';
import { router } from './router';

// The application shell. Composes global providers around the router
// and nothing else - no page content, no verification/placeholder UI.
// As AppProviders and router gain real content in later milestones,
// this file itself does not need to change.
export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
