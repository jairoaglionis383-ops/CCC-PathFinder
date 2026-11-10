import { useCallback, useEffect, useState } from 'react';
import { fetchResults } from '../services/resultsService';

// useResults - the only place ResultsPage touches data fetching.
// Mirrors useReadiness.js exactly: wraps resultsService.fetchResults()
// with loading/error/data state. No Axios call exists inside the page
// component itself, and no compatibility scores are computed here -
// this only reads back what scoring.service.js (Phase 8) already
// persisted.
export function useResults(sessionId) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setStatus('loading');
    setError(null);
    try {
      const result = await fetchResults(sessionId);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [sessionId]);

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
