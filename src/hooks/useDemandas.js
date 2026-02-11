import { useState, useEffect, useCallback } from 'react';
import { demandasApi } from '../services/api';

/**
 * Hook para lista de demandas com filtros.
 * @param {Object} opts
 * @param {string} opts.filtro - 'ativas' | 'risco' | 'concluidas'
 * @param {string} opts.empreendimentoId
 * @param {string|number} opts.prioridade
 * @param {string|number} opts.responsavelId
 * @param {string} opts.de - data ISO
 * @param {string} opts.ate - data ISO
 * @param {boolean} opts.isCoordenador
 * @param {{ pessoaId: number }} opts.user - user.pessoaId para designer
 */
export function useDemandas(opts = {}) {
  const {
    filtro = 'ativas',
    empreendimentoId = '',
    prioridade = '',
    responsavelId = '',
    de = '',
    ate = '',
    isCoordenador = true,
    user = null,
  } = opts;

  const [demandas, setDemandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (isCoordenador) {
        if (filtro === 'risco') {
          data = await demandasApi.listarEmRisco().catch(() => []);
        } else if (filtro === 'concluidas') {
          const params = {};
          if (empreendimentoId) params.empreendimentoId = Number(empreendimentoId);
          if (prioridade !== '') params.prioridade = Number(prioridade);
          if (responsavelId) params.responsavelId = Number(responsavelId);
          if (de) params.de = de;
          if (ate) params.ate = ate;
          const todas = await demandasApi.listar(params).catch(() => []);
          data = (todas || []).filter(d => d.concluida);
        } else {
          const params = { ativas: true };
          if (empreendimentoId) params.empreendimentoId = Number(empreendimentoId);
          if (prioridade !== '') params.prioridade = Number(prioridade);
          if (responsavelId) params.responsavelId = Number(responsavelId);
          if (de) params.de = de;
          if (ate) params.ate = ate;
          data = await demandasApi.listar(params);
        }
      } else {
        const ativas = await demandasApi.listarAtivas();
        data = (ativas || []).filter(d => d.responsavelId === user?.pessoaId);
      }
      setDemandas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('useDemandas:', err);
      setError(err?.message || 'Erro ao carregar demandas');
      setDemandas([]);
    } finally {
      setLoading(false);
    }
  }, [filtro, empreendimentoId, prioridade, responsavelId, de, ate, isCoordenador, user?.pessoaId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { demandas, setDemandas, loading, error, refetch };
}
