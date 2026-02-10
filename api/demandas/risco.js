import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import { cors, json, unauthorized, forbidden, serverError, allowMethods } from '../../_lib/response.js';

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

// GET /api/demandas/risco — só coordenador
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  try {
    const { data, error } = await supabase
      .from('demandas')
      .select(SELECT_DEMANDA)
      .eq('concluida', false)
      .eq('status', 2) // Risco
      .order('prazo');

    if (error) return serverError(res, error);
    return json(res, (data || []).map(formatDemanda));
  } catch (err) {
    return serverError(res, err);
  }
}
