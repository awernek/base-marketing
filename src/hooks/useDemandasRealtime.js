import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para sincronização realtime de demandas via Supabase.
 * 
 * Quando qualquer alteração acontece na tabela 'demandas',
 * a callback onDemandasChange é chamada para atualizar o estado.
 * 
 * @param {Object} options
 * @param {Function} options.onDemandasChange - Callback chamada com (eventType, payload) quando há mudança
 * @param {Function} options.refetch - Função para refetch silencioso das demandas
 * @param {boolean} options.enabled - Se true, ativa a subscription (default: true)
 */
export function useDemandasRealtime({ onDemandasChange, refetch, enabled = true }) {
  const channelRef = useRef(null);
  const refetchRef = useRef(refetch);
  const onChangeRef = useRef(onDemandasChange);

  // Manter refs atualizadas
  useEffect(() => {
    refetchRef.current = refetch;
    onChangeRef.current = onDemandasChange;
  }, [refetch, onDemandasChange]);

  const handleChange = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Chamar callback customizada se fornecida
    if (onChangeRef.current) {
      onChangeRef.current(eventType, { new: newRecord, old: oldRecord });
    }

    // Refetch silencioso para garantir consistência
    // Isso é importante pois o realtime pode ter dados parciais
    if (refetchRef.current) {
      refetchRef.current({ silent: true });
    }
  }, []);

  useEffect(() => {
    // Se Supabase não está configurado ou disabled, não fazer nada
    if (!supabase || !enabled) {
      return;
    }

    // Criar channel para escutar mudanças na tabela demandas
    const channel = supabase
      .channel('demandas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'demandas',
        },
        handleChange
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Conectado ao canal de demandas');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Erro no canal de demandas');
        }
      });

    channelRef.current = channel;

    // Cleanup: remover subscription quando o componente desmontar
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, handleChange]);

  return {
    isSubscribed: !!channelRef.current,
  };
}
