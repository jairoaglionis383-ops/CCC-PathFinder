import { useCallback, useEffect, useState } from 'react';
import { fetchResults } from '../services/resultsService';

// useResultsHistory - fetches the REAL persisted result for each
// session id in SessionContext's client-side history, by calling the
// existing GET /api/v1/results/:sessionId once per id (via the
// existing resultsService.fetchResults - no new endpoint, no new
// service function). This hook does not compute or invent anything;
// a history entry only appears here if the backend actually has a
// result for it.
//
// Promise.allSettled is used deliberately: one stale/invalid historical
// id (e.g. left over from data cleared on the backend) should not take
// down the rest of the list - it's just quietly omitted.
export function useResultsHistory(sessionIds) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Depend on a stable string key rather than the array reference
  // itself, since callers often derive a fresh array each render.
  const key = (sessionIds || []).join(',');

  const load = useCallback(async () => {
    if (!sessionIds || sessionIds.length === 0) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const settled = await Promise.allSettled(sessionIds.map((id) => fetchResults(id)));
      const successful = settled
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
      setItems(successful);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, error, refetch: load };
}
