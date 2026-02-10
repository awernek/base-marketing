import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import { cors, json, unauthorized, serverError, allowMethods } from '../../_lib/response.js';

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

// GET /api/demandas/proximos-prazos?dias=7
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    const dias = parseInt(req.query.dias || '7', 10);
    const agora = new Date();
    const limite = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000);

    let query = supabase
      .from('demandas')
      .select(SELECT_DEMANDA)
      .eq('concluida', false)
      .gte('prazo', agora.toISOString())
      .lte('prazo', limite.toISOString())
      .order('prazo');

    if (user.tipo === TipoUsuario.DESIGNER) {
      query = query.eq('responsavel_id', user.pessoaId);
    }

    const { data, error } = await query;
    if (error) return serverError(res, error);

    return json(res, (data || []).map(formatDemanda));
  } catch (err) {
    return serverError(res, err);
  }
}
