import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, unauthorized, forbidden, serverError, allowMethods,
} from '../../_lib/response.js';

// GET /api/pessoas/lista  → lista enxuta para dropdown
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  try {
    const { data, error } = await supabase
      .from('pessoas')
      .select('id, nome, email')
      .eq('ativo', true)
      .order('nome');

    if (error) return serverError(res, error);

    return json(res, data);
  } catch (err) {
    return serverError(res, err);
  }
}
