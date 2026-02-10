import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
}

// Service Role client — acesso completo, SEM RLS.
// Usado apenas nas serverless functions (nunca no frontend).
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
