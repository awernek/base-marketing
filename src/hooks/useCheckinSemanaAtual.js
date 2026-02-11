import { useState, useEffect, useCallback } from 'react';
import { checkinsApi } from '../services/api';

/**
 * Hook para check-in da semana atual. Para designer: filtra por user.pessoaId.
 * @param {{ pessoaId: number }} user - useAuth().user; se null, não busca
 * @param {boolean} isDesigner - se false (coordenador), pode passar pessoaId opcional
 */
export function useCheckinSemanaAtual(user, isDesigner = false) {
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkinsApi.semanaAtual();
      const list = Array.isArray(data) ? data : [];
      if (isDesigner && user?.pessoaId != null) {
        const meu = list.find(c => c.pessoaId === user.pessoaId);
        setCheckin(meu ?? null);
      } else {
        setCheckin(list.length > 0 ? list : null);
      }
    } catch (err) {
      console.error('useCheckinSemanaAtual:', err);
      setError(err?.message || 'Erro ao carregar check-in');
      setCheckin(null);
    } finally {
      setLoading(false);
    }
  }, [user?.pessoaId, isDesigner]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { checkin, loading, error, refetch };
}
