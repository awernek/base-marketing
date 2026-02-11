import { useState, useEffect, useCallback } from 'react';
import { pessoasApi } from '../services/api';

/**
 * Hook para lista de pessoas (coordenador). Retorna pessoas ativas ordenadas por demandas ativas.
 */
export function usePessoas(enabled = true) {
  const [pessoas, setPessoas] = useState([]);
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
      const data = await pessoasApi.listar().catch(() => []);
      const list = (data || []).filter(p => p.ativo !== false);
      setPessoas(list.sort((a, b) => (a.demandasAtivas ?? 0) - (b.demandasAtivas ?? 0)));
    } catch (err) {
      console.error('usePessoas:', err);
      setError(err?.message || 'Erro ao carregar pessoas');
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { pessoas, setPessoas, loading, error, refetch };
}
