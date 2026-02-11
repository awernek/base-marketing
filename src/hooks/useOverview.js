import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api';

/**
 * Hook para overview do dashboard (coordenador).
 */
export function useOverview(enabled = true) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.overview();
      setOverview(data);
    } catch (err) {
      console.error('useOverview:', err);
      setError(err?.message || 'Erro ao carregar overview');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { overview, setOverview, loading, error, refetch };
}
