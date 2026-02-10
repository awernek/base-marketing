import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, created, badRequest, unauthorized, forbidden,
  serverError, allowMethods,
} from '../../_lib/response.js';

// GET  /api/empreendimentos       → listar
// POST /api/empreendimentos       → criar (só coordenador)
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    if (req.method === 'GET') {
      const apenasAtivos = req.query.apenasAtivos === 'true' || user.tipo === TipoUsuario.DESIGNER;

      let query = supabase.from('empreendimentos').select('id, nome, ativo').order('nome');
      if (apenasAtivos) query = query.eq('ativo', true);

      const { data, error } = await query;
      if (error) return serverError(res, error);
      return json(res, data);
    }

    // POST — criar
    if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

    const { nome, ativo = true } = req.body || {};
    if (!nome) return badRequest(res, 'Nome é obrigatório.');

    const { data, error } = await supabase
      .from('empreendimentos')
      .insert({ nome, ativo })
      .select()
      .single();

    if (error) return serverError(res, error);
    return created(res, data, `/api/empreendimentos/${data.id}`);
  } catch (err) {
    return serverError(res, err);
  }
}
