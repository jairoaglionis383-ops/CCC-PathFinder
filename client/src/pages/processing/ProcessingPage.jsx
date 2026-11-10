import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorState from '../../components/ui/ErrorState';
import Card from '../../components/ui/Card';
import { useSession } from '../../context/SessionContext';
import { useAssessment } from '../../context/AssessmentContext';
import { useResults } from '../../hooks/useResults';
import { DEPARTMENTS, DEPARTMENT_CODES } from '../../constants/departments';
import { ROUTES, resultsPath } from '../../constants/routes';

// ProcessingPage - reached only after AssessmentPage has awaited a
// successful POST /assessment/submit (the backend has already scored
// and saved the result). This page now reflects real work instead of
// a fixed delay: it reads the saved result back with the existing
// useResults() hook (GET /results/:sessionId) and moves to the Results
// page the moment that request succeeds. If the request fails it shows
// the error with a retry; there is no timer and no simulated progress,
// and no score is computed in the frontend.

// Static class names so Tailwind keeps them in the build.
const TILE_CLASSES = {
  dte: 'bg-dte-tint',
  dci: 'bg-dci-tint',
  dba: 'bg-dba-tint',
  das: 'bg-das-tint',
};

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { state, resetSession } = useSession();
  const { resetAssessment } = useAssessment();
  const { data, isError, error, refetch } = useResults(state.sessionId);

  useEffect(() => {
    if (data && state.sessionId) {
      navigate(resultsPath(state.sessionId), { replace: true });
    }
  }, [data, state.sessionId, navigate]);

  if (!state.sessionId) {
    return (
      <ErrorState
        title="We couldn't find your session"
        description="Please start again to get your results."
        onRetry={() => {
          // Start over cleanly: clear any leftover answers/flow state
          // (saved results stay in the database and in history).
          resetAssessment();
          resetSession();
          navigate(ROUTES.landing, { replace: true });
        }}
        retryLabel="Back to start"
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your results"
        description={error?.message || 'Your answers were submitted. Please try again.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-12 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-pill border-2 border-sky/30 animate-ping motion-reduce:animate-none" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-md bg-hero-gradient shadow-2">
          <svg width="30" height="30" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12.5" fill="none" stroke="white" strokeWidth="1.5" />
            <path d="M14 5 L16.5 14 L14 23 L11.5 14 Z" fill="white" />
            <circle cx="14" cy="14" r="1.75" fill="var(--color-navy)" />
          </svg>
        </span>
      </div>

      <div role="status" aria-live="polite">
        <h1 className="mb-3 font-display text-display-2 font-extrabold text-navy">
          Analyzing your responses…
        </h1>
        <p className="text-body text-gray-dark">
          We&apos;re preparing your Program compatibility results.
        </p>
      </div>

      <Card className="w-full shadow-2" padding="p-6">
        <div
          className="h-2.5 w-full overflow-hidden rounded-pill bg-sky-mist"
          aria-hidden="true"
        >
          <div className="h-full w-1/2 rounded-pill bg-progress-gradient animate-pulse motion-reduce:animate-none" />
        </div>
        <ul className="mt-6 grid grid-cols-4 gap-3" aria-label="Departments being compared">
          {DEPARTMENT_CODES.map((code) => {
            const d = DEPARTMENTS[code];
            return (
              <li key={code} className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-md text-2xl animate-pulse motion-reduce:animate-none ${TILE_CLASSES[d.colorKey]}`}
                  aria-hidden="true"
                >
                  {d.emoji}
                </span>
                <span className="text-caption leading-tight text-gray-dark">{d.mascotName}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="flex items-center gap-2 text-caption text-gray-dark">
        <span className="h-1.5 w-1.5 rounded-pill bg-sky" aria-hidden="true" />
        This will only take a moment.
      </p>
    </div>
  );
}
