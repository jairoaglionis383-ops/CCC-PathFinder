import { ToastProvider } from '../../components/ui/Toast';
import { SessionProvider } from '../../context/SessionContext';
import { AssessmentProvider } from '../../context/AssessmentContext';

// Single composition point for every app-wide context provider, per
// the Phase 2 State Management Approach (React Context + useReducer).
// Nesting order: Toast (ephemeral UI state) outermost, then Session
// (survives the whole visit), then Assessment (depends on a session
// existing conceptually, though not technically coupled to it). This
// file's job is exactly this: compose whatever providers currently
// exist, so App.jsx's shape stays final and only this component's
// JSX grows, one provider at a time, in the milestones that own that
// state.
export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <SessionProvider>
        <AssessmentProvider>{children}</AssessmentProvider>
      </SessionProvider>
    </ToastProvider>
  );
}
