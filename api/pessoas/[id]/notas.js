import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, noContent, badRequest, unauthorized, forbidden,
  serverError, allowMethods,
} from '../../../_lib/response.js';

// PUT /api/pessoas/:id/notas
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['PUT'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  const { id } = req.query;
  const pessoaId = parseInt(id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');

  try {
    const { notas } = req.body || {};

    const { error } = await supabase
      .from('pessoas')
      .update({ notas_coordenacao: notas ?? null })
      .eq('id', pessoaId);

    if (error) return serverError(res, error);
    return noContent(res);
  } catch (err) {
    return serverError(res, err);
  }
}
