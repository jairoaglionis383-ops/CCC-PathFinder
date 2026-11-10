import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import DepartmentBadge from '../../features/recommendation/DepartmentBadge';
import CompatibilityBar from '../../features/recommendation/CompatibilityBar';
import { useAdminReports } from '../../hooks/useAdminReports';
import { DEPARTMENTS } from '../../constants/departments';
import { clearAdminToken } from '../../services/adminAuthService';
import { ROUTES } from '../../constants/routes';

// AdminReportsPage - real Admin Reports dashboard, replacing
// AdminPlaceholderPage at the admin route(s). Every number on this
// page comes from useAdminReports() (which calls the three real
// GET /api/v1/admin/reports/* endpoints via adminReportsService.js) -
// nothing is computed, aggregated, or invented here. This page is a
// pure display layer over what report.service.js already aggregated.
//
// A 401 here now means an expired/invalid token (login is real as of
// the Admin Authentication milestone) - not "login isn't wired up"
// anymore. AdminRouteGuard already keeps a token-less visitor from
// reaching this page at all, so a 401 that does happen here is
// specifically a stale/rejected token; the response clears it and
// points back to login rather than offering a retry that would just
// fail again with the same bad token.

function formatDate(isoOrDateString) {
  if (!isoOrDateString) return null;
  try {
    return new Date(isoOrDateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAdminReports();

  const isUnauthorized = isError && error?.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      clearAdminToken();
    }
  }, [isUnauthorized]);

  if (isLoading) {
    return <LoadingState label="Loading reports…" />;
  }

  if (isUnauthorized) {
    return (
      <ErrorState
        title="Your session has expired"
        description="Please log in again to continue."
        onRetry={() => navigate(ROUTES.adminLogin, { replace: true })}
        retryLabel="Go to Login"
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load reports"
        description={error?.message || 'Please try again.'}
        onRetry={refetch}
      />
    );
  }

  const { summary, distribution, activity } = data;

  if (summary.totalAssessmentsCompleted === 0) {
    return (
      <EmptyState
        title="No assessments completed yet"
        description="Reports will populate once students start completing the assessment."
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="font-mono text-caption uppercase tracking-wide text-sky-ink mb-2">
          Admin Reports
        </p>
        <h1 className="text-h1 text-navy">Assessment Overview</h1>
      </div>

      {/* Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card padding="p-6">
          <p className="text-small text-gray-dark mb-1">Total Assessments Completed</p>
          <p className="font-mono text-display-2 text-navy">
            {summary.totalAssessmentsCompleted}
          </p>
        </Card>

        <Card padding="p-6">
          <p className="text-small text-gray-dark mb-2">Most Recommended Department</p>
          {summary.mostRecommendedDepartment ? (
            <div className="flex items-center gap-3">
              <DepartmentBadge
                department={{
                  code: summary.mostRecommendedDepartment.code,
                  mascotName: summary.mostRecommendedDepartment.mascotName,
                  colorKey: DEPARTMENTS[summary.mostRecommendedDepartment.code]?.colorKey,
                }}
              />
              <span className="font-mono text-small text-gray-dark">
                {summary.mostRecommendedDepartment.count} times (
                {summary.mostRecommendedDepartment.percentage}%)
              </span>
            </div>
          ) : (
            <p className="text-small text-gray-dark">No recommendations yet.</p>
          )}
        </Card>
      </section>

      {/* Distribution */}
      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-navy">Recommendation Distribution</h2>
        <Card padding="p-6">
          <div className="flex flex-col gap-5">
            {distribution.departments.map((department) => (
              <CompatibilityBar
                key={department.code}
                colorKey={DEPARTMENTS[department.code]?.colorKey}
                percentage={department.percentage}
                label={`${department.name} (${department.mascotName}) — ${department.count} recommendation${department.count === 1 ? '' : 's'}`}
              />
            ))}
          </div>
        </Card>
      </section>

      {/* Activity by date */}
      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-navy">Assessment Activity by Date</h2>
        {activity.assessmentCountsByDate.length === 0 ? (
          <p className="text-small text-gray-dark">No activity recorded yet.</p>
        ) : (
          <Card padding="p-6">
            <div className="flex flex-col divide-y divide-gray-light">
              {activity.assessmentCountsByDate.map((row) => (
                <div key={row.date} className="flex items-center justify-between py-2.5">
                  <span className="text-body text-navy">{formatDate(row.date) || row.date}</span>
                  <span className="font-mono text-small text-gray-dark">
                    {row.count} assessment{row.count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* Recent activity */}
      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-navy">Recent Student Activity</h2>
        {activity.recentActivity.length === 0 ? (
          <p className="text-small text-gray-dark">No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activity.recentActivity.map((entry) => (
              <Card key={entry.sessionId} padding="p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-body text-navy">{entry.studentName}</span>
                    {entry.topDepartmentCode && (
                      <DepartmentBadge
                        size="sm"
                        department={{
                          code: entry.topDepartmentCode,
                          mascotName: DEPARTMENTS[entry.topDepartmentCode]?.mascotName,
                          colorKey: DEPARTMENTS[entry.topDepartmentCode]?.colorKey,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-small text-gray-dark">
                    {formatDate(entry.completedAt) || entry.completedAt}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div>
        <Button variant="secondary" onClick={refetch}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
