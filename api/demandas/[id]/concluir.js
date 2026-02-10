import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, noContent, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../../_lib/response.js';

// PUT /api/demandas/:id/concluir
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['PUT'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { id } = req.query;
  const demandaId = parseInt(id, 10);
  if (isNaN(demandaId)) return badRequest(res, 'ID inválido.');

  try {
    const { data: demanda } = await supabase
      .from('demandas')
      .select('responsavel_id')
      .eq('id', demandaId)
      .single();

    if (!demanda) return notFound(res, 'Demanda não encontrada.');

    if (user.tipo === TipoUsuario.DESIGNER && demanda.responsavel_id !== user.pessoaId) {
      return forbidden(res);
    }

    const { error } = await supabase
      .from('demandas')
      .update({ concluida: true })
      .eq('id', demandaId);

    if (error) return serverError(res, error);
    return noContent(res);
  } catch (err) {
    return serverError(res, err);
  }
}
