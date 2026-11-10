import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import SessionCompletion from '../../features/recommendation/SessionCompletion';
import CompatibilityBar from '../../features/recommendation/CompatibilityBar';
import DepartmentBadge from '../../features/recommendation/DepartmentBadge';
import { useResults } from '../../hooks/useResults';
import { useResultsHistory } from '../../hooks/useResultsHistory';
import { useSession } from '../../context/SessionContext';
import { useAssessment } from '../../context/AssessmentContext';
import { DEPARTMENTS } from '../../constants/departments';
import { useLearningLanguage } from '../../hooks/useLearningLanguage';
import { ROUTES, resultsPath, readinessPath } from '../../constants/routes';
import { readAllDepartmentSummaries } from '../../hooks/useLearningProgress';
import { LEARNING_UI } from '../../constants/learningContent';

// DashboardPage - real, backend-driven Current Result + History.
// Never computes a compatibility score itself: "Current Result" reuses
// the existing useResults()/resultsService (unchanged from the
// Results page), and "History" reuses the same fetchResults() call
// once per session id remembered by SessionContext - both only ever
// display what scoring.service.js already persisted.

function toDisplayResults(resultRows) {
  return resultRows.map((row) => ({
    rank: row.rank,
    percentage: row.percentageScore,
    department: {
      code: row.departmentCode,
      name: row.departmentName,
      mascotName: row.mascotName,
      colorKey: DEPARTMENTS[row.departmentCode]?.colorKey,
      emoji: DEPARTMENTS[row.departmentCode]?.emoji,
    },
  }));
}

function formatDate(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

// Static class names so Tailwind keeps them in the build.
const NAME_CLASSES = {
  dte: 'text-dte-text',
  dci: 'text-dci-text',
  dba: 'text-dba-text',
  das: 'text-das-text',
};

function PageHeading({ children, subtitle }) {
  return (
    <div className="text-center">
      <p className="mb-2 font-mono text-caption uppercase tracking-wide text-sky-ink">Dashboard</p>
      <h1 className="font-display text-display-2 font-extrabold text-navy">{children}</h1>
      {subtitle && <p className="mt-2 text-body text-gray-dark">{subtitle}</p>}
    </div>
  );
}

// Learning-progress card (English, like the rest of this page): reads only this browser's saved learning
// progress (localStorage); it never touches results or the backend.
function LearningProgressCard() {
  // The Dashboard is English-only (as the language screen states), so
  // this card is too - no mixed-language page.
  const ui = LEARNING_UI.en;
  const rows = readAllDepartmentSummaries().filter(
    ({ summary }) => summary.tasksDone + summary.weeksDone + summary.resourcesSaved > 0 || summary.quiz
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-h1 font-extrabold text-navy">{ui.dashboardTitle}</h2>
      {rows.length === 0 ? (
        <p className="text-body text-gray-dark">{ui.dashboardNone}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map(({ code, summary }) => {
            const dept = DEPARTMENTS[code];
            return (
              <Card key={code} accent={dept.colorKey} padding="p-5">
                <h3 className={`mb-3 font-display text-h3 font-bold ${NAME_CLASSES[dept.colorKey]}`}>
                  <span aria-hidden="true">{dept.emoji} </span>
                  {dept.name}
                </h3>
                <ul className="mb-4 text-small text-gray-dark">
                  <li>{ui.tasksCompleted(summary.tasksDone, summary.taskCount)}</li>
                  <li>
                    {ui.pWeeks}: {summary.weeksDone}/{summary.weekCount}
                  </li>
                  <li>
                    {ui.pResources}: {summary.resourcesCompleted} · {ui.pSaved}: {summary.resourcesSaved}
                  </li>
                  {summary.quiz && <li>{ui.lastScore(summary.quiz.score, summary.quiz.total)}</li>}
                </ul>
                <Button as={Link} to={readinessPath(code)} variant="secondary" size="sm">
                  {ui.dashboardOpen}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  // Keeps the chosen language saved in this browser so the Program Readiness
  // guide still uses it after a page reload (this page itself stays English).
  const language = useLearningLanguage();
  const session = useSession();
  const { resetAssessment } = useAssessment();

  // The "current result" is the session this browser just finished. After a
  // Retake (or while a new assessment is in progress) the active session id has
  // no result yet, so fall back to the newest completed attempt instead of
  // hiding every saved result behind an empty state.
  const completedIds = new Set(session.state.sessionHistory.map((entry) => entry.sessionId));
  const currentSessionId = completedIds.has(session.state.sessionId)
    ? session.state.sessionId
    : session.state.sessionHistory[0]?.sessionId ?? null;
  const current = useResults(currentSessionId);

  // History = every id this browser has completed, minus whichever one
  // is already shown as "Current Result" above, so nothing is listed
  // twice. session.state.sessionHistory is already newest-first (see
  // SessionContext.completeAssessment()).
  const historyIds = session.state.sessionHistory
    .filter((entry) => entry.sessionId !== currentSessionId)
    .map((entry) => entry.sessionId);
  const history = useResultsHistory(historyIds);

  function handleRetake() {
    resetAssessment();
    session.resetSession();
    navigate(ROUTES.studentInfo);
  }

  // Take a New Assessment: temporary state (answers, progress, scores, processing flags,
  // draft) is cleared and a separate new session is started on the Student Information
  // page. The chosen language is kept. Saved results and history are never touched.
  function handleNewAssessment() {
    resetAssessment();
    session.resetSession({ keepLanguage: true });
    navigate(ROUTES.studentInfo);
  }

  // End Session: same temporary-state reset (language included), then back to the Landing
  // Page. Saved results and history stay available. Not a logout - there are no accounts.
  function handleEndSession() {
    resetAssessment();
    session.resetSession();
    navigate(ROUTES.landing, { replace: true });
  }

  // No session at all yet - the honest "nothing here" state, not a
  // fabricated one.
  if (!currentSessionId) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="mb-6"><PageHeading>Your Dashboard</PageHeading></div>
        <EmptyState
          title="No assessment history yet"
          description="Once you complete an assessment, your results and past attempts will appear here."
          action={
            <Button as={Link} to={ROUTES.landing}>
              Take the Assessment
            </Button>
          }
        />
      </div>
    );
  }

  if (current.isLoading) {
    return <LoadingState label="Loading your dashboard…" />;
  }

  // A 404 here means "this session has no persisted result" (e.g.
  // abandoned mid-assessment) - that's an empty state, not an error.
  if (current.isError && current.error?.status === 404) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="mb-6"><PageHeading>Your Dashboard</PageHeading></div>
        <EmptyState
          title="No completed assessment yet"
          description="Finish the questionnaire to see your results here."
          action={
            <Button as={Link} to={ROUTES.landing}>
              Take the Assessment
            </Button>
          }
        />
      </div>
    );
  }

  if (current.isError) {
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        description={current.error?.message || 'Please try again.'}
        onRetry={current.refetch}
      />
    );
  }

  const currentResults = toDisplayResults(current.data.results);
  const topResult = currentResults.find((result) => result.rank === 1) ?? currentResults[0];
  const topMatches = currentResults.filter((result) => result.rank === topResult.rank);
  const isTie = topMatches.length > 1;
  const currentDate = formatDate(current.data.assessmentDate);
  // Only greet by name when the result shown is the one this student just finished.
  const studentName =
    session.state.sessionId === currentSessionId ? session.state.studentInfo?.fullName?.trim() : undefined;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-8">
      <PageHeading subtitle={studentName ? `Welcome back, ${studentName}.` : undefined}>
        Your Dashboard
      </PageHeading>

      {/* Current result */}
      <section className="flex flex-col gap-5">
        <div className="rounded-lg bg-hero-gradient px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-mono text-caption uppercase tracking-wide text-white/80">
              Current result
            </p>
            {currentDate && <p className="text-small text-white/80">Assessed on {currentDate}</p>}
          </div>
          <h2 className="mt-3 font-display text-h1 font-extrabold text-white">
            {isTie
              ? 'You have more than one strongest match.'
              : `Your strongest match is ${topResult.department.name}.`}
          </h2>
          <p className="mt-2 max-w-xl text-body text-white/80">
            {isTie
              ? `${topMatches.map((match) => match.department.name).join(', ')} are tied at ${Math.round(topResult.percentage)}% compatibility.`
              : `${topResult.department.mascotName} is your closest fit at ${Math.round(topResult.percentage)}% compatibility.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to={resultsPath(currentSessionId)} variant="secondary">
              View Full Results
            </Button>
            <Button
              as={Link}
              to={readinessPath(topResult.department.code)}
              className="bg-white/10 text-white shadow-none hover:bg-white/20"
            >
              View Program Readiness
            </Button>
            <Button
              onClick={handleRetake}
              className="bg-white/10 text-white shadow-none hover:bg-white/20"
            >
              Retake Assessment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {currentResults.map((result) => {
            const { department, rank, percentage } = result;
            return (
              <Card key={department.code} accent={department.colorKey} hoverable padding="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md font-display text-body font-extrabold ${
                      rank === topResult.rank ? 'bg-sky-ink text-white' : 'bg-gray-light text-gray-dark'
                    }`}
                  >
                    #{rank}
                  </span>
                  <span className="text-2xl leading-none" aria-hidden="true">
                    {department.emoji}
                  </span>
                  <h3 className={`font-display text-h3 font-bold ${NAME_CLASSES[department.colorKey]}`}>
                    {department.name}
                  </h3>
                </div>
                <DepartmentBadge department={department} size="sm" className="mb-4" />
                <CompatibilityBar
                  colorKey={department.colorKey}
                  percentage={percentage}
                  label="Compatibility"
                />
              </Card>
            );
          })}
        </div>
      </section>

      <LearningProgressCard />

      {history.isLoading && <LoadingState label="Loading previous attempts…" />}

      {!history.isLoading && history.items.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-h1 font-extrabold text-navy">Previous Attempts</h2>

          <div className="flex flex-col gap-3">
            {history.items.map((item) => {
              const results = toDisplayResults(item.results);
              const top = results.find((result) => result.rank === 1) ?? results[0];
              const date = formatDate(item.assessmentDate);

              return (
                <Card key={item.sessionId} accent={top.department.colorKey} hoverable padding="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none" aria-hidden="true">
                        {top.department.emoji}
                      </span>
                      <DepartmentBadge department={top.department} size="sm" />
                      <span className="font-mono text-small text-gray-dark">
                        {Math.round(top.percentage)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {date && <span className="text-small text-gray-dark">{date}</span>}
                      <Button as={Link} to={resultsPath(item.sessionId)} variant="secondary" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <SessionCompletion
        language={language}
        onNewAssessment={handleNewAssessment}
        onEndSession={handleEndSession}
      />
    </div>
  );
}
