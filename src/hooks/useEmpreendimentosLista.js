import { useState, useEffect, useCallback } from 'react';
import { empreendimentosApi } from '../services/api';

/**
 * Hook para lista enxuta de empreendimentos (filtros, selects).
 */
export function useEmpreendimentosLista(enabled = true) {
  const [lista, setLista] = useState([]);
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
      const data = await empreendimentosApi.listaEnxuta().catch(() => []);
      setLista(data || []);
    } catch (err) {
      console.error('useEmpreendimentosLista:', err);
      setError(err?.message || 'Erro ao carregar empreendimentos');
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { lista, setLista, loading, error, refetch };
}
