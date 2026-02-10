import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, created, badRequest, unauthorized, forbidden,
  serverError, allowMethods,
} from '../../_lib/response.js';

// Helper: formata demanda do banco para o formato do contrato
function formatDemanda(d) {
  return {
    id: d.id,
    titulo: d.titulo,
    descricao: d.descricao,
    tipo: d.tipo,
    responsavelId: d.responsavel_id,
    responsavelNome: d.pessoas?.nome || null,
    prazo: d.prazo,
    impacto: d.impacto,
    status: d.status,
    prioridade: d.prioridade,
    ordem: d.ordem,
    link: d.link,
    empreendimentoId: d.empreendimento_id,
    empreendimentoNome: d.empreendimentos?.nome || null,
    concluida: d.concluida,
    criadaEm: d.criada_em,
    atualizadaEm: d.atualizada_em,
  };
}

const SELECT_DEMANDA = '*, pessoas!demandas_responsavel_id_fkey(nome), empreendimentos(nome)';

// GET  /api/demandas   → listar (com filtros)
// POST /api/demandas   → criar (só coordenador)
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    if (req.method === 'GET') {
      let query = supabase
        .from('demandas')
        .select(SELECT_DEMANDA)
        .order('prazo', { ascending: true });

      // Designer só vê suas demandas
      if (user.tipo === TipoUsuario.DESIGNER) {
        query = query.eq('responsavel_id', user.pessoaId);
      }

      // Filtros opcionais
      const { ativas, de, ate, empreendimentoId, tipo } = req.query;
      if (ativas === 'true') query = query.eq('concluida', false);
      if (de) query = query.gte('prazo', de);
      if (ate) query = query.lte('prazo', ate);
      if (empreendimentoId) query = query.eq('empreendimento_id', parseInt(empreendimentoId, 10));
      if (tipo !== undefined && tipo !== '') query = query.eq('tipo', parseInt(tipo, 10));

      const { data, error } = await query;
      if (error) return serverError(res, error);

      return json(res, (data || []).map(formatDemanda));
    }

    // POST — criar demanda (só coordenador)
    if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

    const body = req.body || {};
    if (!body.titulo) return badRequest(res, 'Título é obrigatório.');
    if (!body.responsavelId) return badRequest(res, 'responsavelId é obrigatório.');
    if (!body.prazo) return badRequest(res, 'Prazo é obrigatório.');

    const { data, error } = await supabase
      .from('demandas')
      .insert({
        titulo: body.titulo,
        descricao: body.descricao || null,
        tipo: body.tipo ?? 0,
        responsavel_id: body.responsavelId,
        prazo: body.prazo,
        impacto: body.impacto ?? 0,
        prioridade: body.prioridade ?? 1,
        ordem: body.ordem ?? null,
        link: body.link || null,
        empreendimento_id: body.empreendimentoId || null,
      })
      .select(SELECT_DEMANDA)
      .single();

    if (error) return serverError(res, error);

    return created(res, formatDemanda(data), `/api/demandas/${data.id}`);
  } catch (err) {
    return serverError(res, err);
  }
}
