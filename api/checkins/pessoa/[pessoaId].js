import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, json, badRequest, unauthorized, forbidden,
  serverError, allowMethods,
} from '../../../_lib/response.js';

function formatCheckin(c) {
  return {
    id: c.id, pessoaId: c.pessoa_id, pessoaNome: c.pessoas?.nome || null,
    data: c.data, carga: c.carga, bloqueio: c.bloqueio,
  };
}

// GET /api/checkins/pessoa/:pessoaId
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { pessoaId } = req.query;
  const pid = parseInt(pessoaId, 10);
  if (isNaN(pid)) return badRequest(res, 'pessoaId inválido.');

  // Designer só vê os próprios
  if (user.tipo === TipoUsuario.DESIGNER && pid !== user.pessoaId) {
    return forbidden(res);
  }

  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('*, pessoas(nome)')
      .eq('pessoa_id', pid)
      .order('data', { ascending: false });

    if (error) return serverError(res, error);
    return json(res, (data || []).map(formatCheckin));
  } catch (err) {
    return serverError(res, err);
  }
}
