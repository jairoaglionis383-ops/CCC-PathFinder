import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import DepartmentBadge from '../../features/recommendation/DepartmentBadge';
import CompatibilityBar from '../../features/recommendation/CompatibilityBar';
import { useResults } from '../../hooks/useResults';
import { DEPARTMENTS } from '../../constants/departments';
import { useLearningLanguage } from '../../hooks/useLearningLanguage';
import { ROUTES, readinessPath } from '../../constants/routes';

// ResultsPage - backend-driven. Reads :sessionId from the route,
// fetches the persisted result via useResults() (GET
// /results/:sessionId), and maps the backend's { departmentCode,
// departmentName, mascotName, percentageScore, rank } rows onto the
// display. `colorKey` and `emoji` are frontend-only presentation
// details looked up from the DEPARTMENTS constant by code. No score is
// computed, re-ranked or altered here - ranks (ties included) and
// percentages are shown exactly as the backend saved them.

// Static class names so Tailwind keeps them in the build.
const NAME_CLASSES = {
  dte: 'text-dte-text',
  dci: 'text-dci-text',
  dba: 'text-dba-text',
  das: 'text-das-text',
};

export default function ResultsPage() {
  const { sessionId } = useParams();
  // Keeps the chosen language saved in this browser so the Program Readiness
  // guide still uses it after a page reload (this page itself stays English).
  useLearningLanguage();
  const { data, isLoading, isError, error, refetch } = useResults(sessionId);

  if (isLoading) {
    return <LoadingState label="Loading your results…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your results"
        description={error?.message || 'Please try again.'}
        onRetry={refetch}
      />
    );
  }

  const results = data.results.map((row) => ({
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

  const topResult = results.find((result) => result.rank === 1) ?? results[0];
  const topMatches = results.filter((result) => result.rank === topResult.rank);
  const isTie = topMatches.length > 1;

  return (
    <div className="flex flex-col gap-10 pb-8">
      {/* Summary */}
      <section className="rounded-lg bg-hero-gradient px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="mb-5 inline-flex items-center rounded-pill bg-white/20 px-4 py-1.5 font-mono text-caption uppercase tracking-wide text-white">
          Assessment complete
        </p>
        <h1 className="mb-4 font-display text-display-2 font-extrabold text-white sm:text-display-1">
          {isTie
            ? 'You have more than one strongest match.'
            : `Your strongest match is ${topResult.department.name}.`}
        </h1>
        <p className="mx-auto max-w-xl text-body text-white/80">
          {isTie
            ? `${topMatches
                .map((match) => match.department.name)
                .join(', ')} are tied for first at ${Math.round(topResult.percentage)}% compatibility. Explore each one below.`
            : `${topResult.department.mascotName} is your closest fit at ${Math.round(topResult.percentage)}% compatibility.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to={readinessPath(topResult.department.code)} variant="secondary" size="lg">
            View Program Readiness
          </Button>
          <Button
            as={Link}
            to={ROUTES.dashboard}
            size="lg"
            className="bg-white/10 text-white hover:bg-white/20 shadow-none"
          >
            Go to Dashboard
          </Button>
        </div>
      </section>

      {/* Ranked list */}
      <section>
        <h2 className="mb-6 font-display text-h1 font-extrabold text-navy">
          Ranked by compatibility
        </h2>
        <div className="grid grid-cols-1 gap-5">
          {results.map((result) => {
            const { department, rank, percentage } = result;
            const isTop = rank === topResult.rank;
            return (
              <Card
                key={department.code}
                accent={department.colorKey}
                hoverable
                padding="p-6 sm:p-8"
                className={isTop ? 'shadow-2' : ''}
              >
                <div className="mb-5 flex items-start gap-4">
                  <span
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md font-display text-h2 font-extrabold ${
                      isTop ? 'bg-sky-ink text-white' : 'bg-gray-light text-gray-dark'
                    }`}
                  >
                    #{rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-3xl leading-none" aria-hidden="true">
                        {department.emoji}
                      </span>
                      <h3 className={`font-display text-h2 font-bold ${NAME_CLASSES[department.colorKey]}`}>
                        {department.name}
                      </h3>
                      {isTop && (
                        <span className="rounded-pill bg-sky-mist px-3 py-1 font-mono text-caption uppercase tracking-wide text-sky-ink">
                          Best match
                        </span>
                      )}
                    </div>
                    <DepartmentBadge department={department} size="sm" />
                  </div>
                </div>

                <CompatibilityBar
                  colorKey={department.colorKey}
                  percentage={percentage}
                  label="Compatibility"
                />

                <div className="mt-5 flex justify-end">
                  <Button
                    as={Link}
                    to={readinessPath(department.code)}
                    variant={isTop ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    View Program Readiness
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Explainer */}
      <section className="rounded-lg bg-sky-mist p-6">
        <h2 className="mb-3 font-display text-h3 font-bold text-navy">Understanding your results</h2>
        <div className="grid grid-cols-1 gap-4 text-small text-gray-dark sm:grid-cols-2">
          <p>
            <span className="font-semibold text-navy">Compatibility score.</span> How closely your
            answers match each department&apos;s weighted profile. A higher percentage means a closer
            fit.
          </p>
          <p>
            <span className="font-semibold text-navy">Program Readiness.</span> Shows what to expect
            in the department&apos;s first year, the skills involved, and how to prepare.
          </p>
        </div>
        <p className="mt-4 text-caption text-gray-dark">
          These results are based on your own answers and are a guide, not a final decision. Consider
          discussing your options with academic advisors and family.
        </p>
      </section>
    </div>
  );
}
