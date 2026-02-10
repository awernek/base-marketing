import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest } from '../../_lib/auth.js';
import { cors, json, unauthorized, serverError, allowMethods } from '../../_lib/response.js';

// GET /api/empreendimentos/lista  → dropdown (apenas ativos)
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    const { data, error } = await supabase
      .from('empreendimentos')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome');

    if (error) return serverError(res, error);
    return json(res, data);
  } catch (err) {
    return serverError(res, err);
  }
}
