import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, json, noContent, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../../_lib/response.js';

const SELECT_DEMANDA = '*, pessoas!demandas_responsavel_id_fkey(nome), empreendimentos(nome)';

function formatDemanda(d) {
  return {
    id: d.id, titulo: d.titulo, descricao: d.descricao, tipo: d.tipo,
    responsavelId: d.responsavel_id, responsavelNome: d.pessoas?.nome || null,
    prazo: d.prazo, impacto: d.impacto, status: d.status, prioridade: d.prioridade,
    ordem: d.ordem, link: d.link, empreendimentoId: d.empreendimento_id,
    empreendimentoNome: d.empreendimentos?.nome || null, concluida: d.concluida,
    criadaEm: d.criada_em, atualizadaEm: d.atualizada_em,
  };
}

// GET /api/demandas/:id
// PUT /api/demandas/:id
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'PUT'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { id } = req.query;
  const demandaId = parseInt(id, 10);
  if (isNaN(demandaId)) return badRequest(res, 'ID inválido.');

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('demandas')
        .select(SELECT_DEMANDA)
        .eq('id', demandaId)
        .single();

      if (error || !data) return notFound(res, 'Demanda não encontrada.');

      // Designer só vê próprias demandas
      if (user.tipo === TipoUsuario.DESIGNER && data.responsavel_id !== user.pessoaId) {
        return forbidden(res);
      }

      return json(res, formatDemanda(data));
    }

    // PUT — atualizar demanda
    // Buscar atual para verificar permissão
    const { data: atual } = await supabase
      .from('demandas')
      .select('responsavel_id')
      .eq('id', demandaId)
      .single();

    if (!atual) return notFound(res, 'Demanda não encontrada.');

    if (user.tipo === TipoUsuario.DESIGNER && atual.responsavel_id !== user.pessoaId) {
      return forbidden(res);
    }

    const body = req.body || {};

    const { error } = await supabase
      .from('demandas')
      .update({
        titulo: body.titulo,
        descricao: body.descricao ?? null,
        tipo: body.tipo,
        responsavel_id: body.responsavelId,
        prazo: body.prazo,
        impacto: body.impacto,
        status: body.status,
        prioridade: body.prioridade,
        ordem: body.ordem ?? null,
        link: body.link ?? null,
        empreendimento_id: body.empreendimentoId ?? null,
      })
      .eq('id', demandaId);

    if (error) return serverError(res, error);
    return noContent(res);
  } catch (err) {
    return serverError(res, err);
  }
}
