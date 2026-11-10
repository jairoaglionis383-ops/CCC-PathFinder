import { useCallback, useEffect, useState } from 'react';
import {
  fetchReportSummary,
  fetchReportDistribution,
  fetchReportActivity,
} from '../services/adminReportsService';

// useAdminReports - the only place AdminReportsPage touches data
// fetching, mirroring useReadiness.js/useResults.js. Fetches all three
// report endpoints in parallel and exposes them as one combined
// { summary, distribution, activity } object - if any one call fails
// (most likely: 401, since admin login isn't wired into the frontend
// yet), the whole hook reports an error rather than silently showing
// partial data, same as every other data hook in this app.
export function useAdminReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const [summary, distribution, activity] = await Promise.all([
        fetchReportSummary(),
        fetchReportDistribution(),
        fetchReportActivity(),
      ]);
      setData({ summary, distribution, activity });
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading: status === 'loading' || status === 'idle',
    isError: status === 'error',
    error,
    refetch: load,
  };
}
