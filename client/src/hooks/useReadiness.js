import { useCallback, useEffect, useState } from 'react';
import { fetchReadiness } from '../services/readinessService';

// useReadiness - the only place ProgramReadinessPage touches data
// fetching. Wraps readinessService.fetchReadiness() with loading/error/
// data state, per the Phase 2 State Management Approach ("small custom
// hooks... that manage loading/error/data locally"). No Axios call
// exists inside the page component itself.
export function useReadiness(departmentCode) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!departmentCode) return;
    setStatus('loading');
    setError(null);
    try {
      const result = await fetchReadiness(departmentCode);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [departmentCode]);

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
