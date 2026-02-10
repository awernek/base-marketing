import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, json, created, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../../_lib/response.js';

function formatAtualizacao(a) {
  return {
    id: a.id,
    demandaId: a.demanda_id,
    pessoaId: a.pessoa_id,
    pessoaNome: a.pessoas?.nome || null,
    texto: a.texto,
    criadoEm: a.criado_em,
  };
}

// GET  /api/demandas/:id/atualizacoes  → listar
// POST /api/demandas/:id/atualizacoes  → criar
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { id } = req.query;
  const demandaId = parseInt(id, 10);
  if (isNaN(demandaId)) return badRequest(res, 'ID inválido.');

  try {
    // Verificar permissão
    const { data: demanda } = await supabase
      .from('demandas')
      .select('responsavel_id')
      .eq('id', demandaId)
      .single();

    if (!demanda) return notFound(res, 'Demanda não encontrada.');

    if (user.tipo === TipoUsuario.DESIGNER && demanda.responsavel_id !== user.pessoaId) {
      return forbidden(res);
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('atualizacoes_demanda')
        .select('*, pessoas(nome)')
        .eq('demanda_id', demandaId)
        .order('criado_em', { ascending: false });

      if (error) return serverError(res, error);
      return json(res, (data || []).map(formatAtualizacao));
    }

    // POST — criar atualização
    const { texto } = req.body || {};
    if (!texto) return badRequest(res, 'Texto é obrigatório.');

    // Se coordenador, pessoa_id é null; se designer, é o pessoaId dele
    const pessoaId = user.tipo === TipoUsuario.DESIGNER ? user.pessoaId : null;

    const { data, error } = await supabase
      .from('atualizacoes_demanda')
      .insert({
        demanda_id: demandaId,
        pessoa_id: pessoaId,
        texto,
      })
      .select('*, pessoas(nome)')
      .single();

    if (error) return serverError(res, error);

    return created(
      res,
      formatAtualizacao(data),
      `/api/demandas/${demandaId}/atualizacoes`,
    );
  } catch (err) {
    return serverError(res, err);
  }
}
