import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, noContent, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../_lib/response.js';

// GET    /api/empreendimentos/:id   → detalhe
// PUT    /api/empreendimentos/:id   → atualizar
// DELETE /api/empreendimentos/:id   → desativar
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'PUT', 'DELETE'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { id } = req.query;
  const empId = parseInt(id, 10);
  if (isNaN(empId)) return badRequest(res, 'ID inválido.');

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('*')
        .eq('id', empId)
        .single();

      if (error || !data) return notFound(res, 'Empreendimento não encontrado.');
      return json(res, { id: data.id, nome: data.nome, ativo: data.ativo });
    }

    // PUT e DELETE — só coordenador
    if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

    if (req.method === 'PUT') {
      const { nome, ativo } = req.body || {};

      const { error } = await supabase
        .from('empreendimentos')
        .update({ nome, ativo: ativo ?? true })
        .eq('id', empId);

      if (error) return serverError(res, error);
      return noContent(res);
    }

    // DELETE — soft delete
    const { error } = await supabase
      .from('empreendimentos')
      .update({ ativo: false })
      .eq('id', empId);

    if (error) return serverError(res, error);
    return noContent(res);
  } catch (err) {
    return serverError(res, err);
  }
}
