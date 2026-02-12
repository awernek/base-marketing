/**
 * Cliente Supabase para o frontend.
 * Usa a chave anônima (pública) - seguro para exposição no browser.
 * Usado principalmente para Realtime subscriptions.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Instância singleton - pode ser null se não configurado
let supabaseInstance = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase] Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas. ' +
      'Realtime desabilitado.'
    );
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}

export const supabase = getSupabaseClient();
