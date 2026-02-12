import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import { fmt, ETAPAS, ETAPAS_EXECUCAO } from '../domain/demandas.js';
import {
  json, created, noContent, badRequest, forbidden,
  notFound, serverError,
} from '../response.js';

const SELECT_DEMANDA = '*, pessoas!demandas_responsavel_id_fkey(nome), empreendimentos(nome)';

// GET /api/demandas — coordenador: todas; designer: minhas + disponíveis (a_fazer sem responsável)
export async function listar(req, res, params, user) {
  let query = supabase.from('demandas').select(SELECT_DEMANDA);

  if (user.tipo === TipoUsuario.DESIGNER) {
    query = query.or(
      `responsavel_id.eq.${user.pessoaId},and(etapa.eq.a_fazer,responsavel_id.is.null)`
    );
  }

  const { ativas, de, ate, empreendimentoId, tipo, prioridade, responsavelId, etapa } = req.query;
  if (ativas === 'true') query = query.eq('concluida', false);
  if (etapa !== undefined && etapa !== '') query = query.eq('etapa', etapa);
  if (de) query = query.gte('prazo', de);
  if (ate) query = query.lte('prazo', ate);
  if (empreendimentoId) query = query.eq('empreendimento_id', parseInt(empreendimentoId, 10));
  if (tipo !== undefined && tipo !== '') query = query.eq('tipo', parseInt(tipo, 10));
  if (prioridade !== undefined && prioridade !== '') query = query.eq('prioridade', parseInt(prioridade, 10));
  if (responsavelId !== undefined && responsavelId !== '' && user.tipo === TipoUsuario.COORDENADOR) {
    query = query.eq('responsavel_id', parseInt(responsavelId, 10));
  }

  if (user.tipo !== TipoUsuario.COORDENADOR) {
    query = query.order('prioridade', { ascending: true, nullsFirst: true }).order('prazo', { ascending: true, nullsFirst: true });
  }

  const { data, error } = await query;
  if (error) return serverError(res, error);
  let list = data || [];
  if (user.tipo === TipoUsuario.COORDENADOR) {
    const ordemEtapa = (e) => ETAPAS.indexOf(e) >= 0 ? ETAPAS.indexOf(e) : 999;
    list = [...list].sort((a, b) => {
      const diffEtapa = ordemEtapa(a.etapa) - ordemEtapa(b.etapa);
      if (diffEtapa !== 0) return diffEtapa;
      const pa = a.prioridade != null ? a.prioridade : 999;
      const pb = b.prioridade != null ? b.prioridade : 999;
      if (pa !== pb) return pa - pb;
      if (!a.prazo) return 1;
      if (!b.prazo) return -1;
      return new Date(a.prazo) - new Date(b.prazo);
    });
  }
  const ids = list.map(d => d.id);
  let countByDemanda = {};
  if (ids.length > 0) {
    const { data: comentariosRows, error: errComentarios } = await supabase.from('comentarios').select('demanda_id').in('demanda_id', ids);
    if (!errComentarios && comentariosRows) {
      comentariosRows.forEach(r => { countByDemanda[r.demanda_id] = (countByDemanda[r.demanda_id] || 0) + 1; });
    }
  }
  return json(res, list.map(d => fmt(d, countByDemanda[d.id] || 0)));
}

// POST /api/demandas — coordenador ou designer; nova demanda entra em aguardando_priorizacao
export async function criar(req, res, params, user) {
  const b = req.body || {};
  if (!b.titulo) return badRequest(res, 'Título é obrigatório.');
  if (b.tipo === undefined || b.tipo === null) return badRequest(res, 'Tipo é obrigatório.');

  const isCoordenador = user.tipo === TipoUsuario.COORDENADOR;
  const responsavelId = isCoordenador && b.responsavelId != null ? b.responsavelId : null;
  const prazo = b.prazo || null;
  const prioridade = b.prioridade != null ? b.prioridade : null;

  const { data, error } = await supabase.from('demandas').insert({
    titulo: b.titulo,
    descricao: b.descricao || null,
    tipo: parseInt(b.tipo, 10),
    etapa: 'aguardando_priorizacao',
    responsavel_id: responsavelId,
    prazo: prazo || null,
    impacto: b.impacto ?? 0,
    prioridade,
    ordem: b.ordem ?? null,
    link: b.link || null,
    empreendimento_id: b.empreendimentoId || null,
    criada_por_usuario_id: user.userId || null,
  }).select(SELECT_DEMANDA).single();
  if (error) return serverError(res, error);
  return created(res, fmt(data), `/api/demandas/${data.id}`);
}

// GET /api/demandas/ativas — coordenador: todas não concluídas; designer: minhas + disponíveis
export async function ativas(req, res, params, user) {
  let query = supabase.from('demandas').select(SELECT_DEMANDA).eq('concluida', false);
  if (user.tipo === TipoUsuario.DESIGNER) {
    query = query.or(
      `responsavel_id.eq.${user.pessoaId},and(etapa.eq.a_fazer,responsavel_id.is.null)`
    );
  }
  query = query.order('prazo', { ascending: true, nullsFirst: true });
  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, (data || []).map(fmt));
}

// GET /api/demandas/proximos-prazos — designer: minhas + disponíveis (com prazo)
export async function proximosPrazos(req, res, params, user) {
  const dias = parseInt(req.query.dias || '7', 10);
  const agora = new Date();
  const limite = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000);
  let query = supabase.from('demandas').select(SELECT_DEMANDA)
    .eq('concluida', false).gte('prazo', agora.toISOString()).lte('prazo', limite.toISOString());
  if (user.tipo === TipoUsuario.DESIGNER) {
    query = query.or(
      `responsavel_id.eq.${user.pessoaId},and(etapa.eq.a_fazer,responsavel_id.is.null)`
    );
  }
  query = query.order('prazo', { ascending: true });
  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, (data || []).map(fmt));
}

// GET /api/demandas/risco
export async function risco(req, res, params, user) {
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);
  const { data, error } = await supabase.from('demandas').select(SELECT_DEMANDA)
    .eq('concluida', false).eq('status', 2).order('prazo');
  if (error) return serverError(res, error);
  return json(res, (data || []).map(fmt));
}

// GET /api/demandas/:id — coordenador: qualquer; designer: minhas ou disponíveis (a_fazer sem responsável)
export async function obter(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data, error } = await supabase.from('demandas').select(SELECT_DEMANDA).eq('id', id).single();
  if (error || !data) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER) {
    const ehMinha = data.responsavel_id === user.pessoaId;
    const ehDisponivel = data.etapa === 'a_fazer' && data.responsavel_id == null;
    if (!ehMinha && !ehDisponivel) return forbidden(res);
  }
  return json(res, fmt(data));
}

// PUT /api/demandas/:id — coordenador: todos os campos; designer: só titulo e descricao (e só nas suas)
export async function atualizar(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: atual } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!atual) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && atual.responsavel_id !== user.pessoaId) return forbidden(res);

  const b = req.body || {};

  if (user.tipo === TipoUsuario.DESIGNER) {
    const { error } = await supabase.from('demandas').update({
      titulo: b.titulo,
      descricao: b.descricao ?? null,
    }).eq('id', id);
    if (error) return serverError(res, error);
    return noContent(res);
  }

  const { error } = await supabase.from('demandas').update({
    titulo: b.titulo, descricao: b.descricao ?? null, tipo: b.tipo,
    responsavel_id: b.responsavelId != null && b.responsavelId !== '' ? parseInt(b.responsavelId, 10) : null,
    prazo: b.prazo || null, impacto: b.impacto,
    status: b.status, prioridade: b.prioridade != null ? b.prioridade : null, ordem: b.ordem ?? null,
    link: b.link ?? null, empreendimento_id: b.empreendimentoId ?? null,
  }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/demandas/:id/status — coordenador: qualquer; designer: só suas
export async function atualizarStatus(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { status } = req.body || {};
  if (status === undefined || status === null) return badRequest(res, 'Status é obrigatório.');
  const { data: d } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && d.responsavel_id !== user.pessoaId) return forbidden(res);
  const { error } = await supabase.from('demandas').update({ status }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/demandas/:id/priorizar — só coordenador; aguardando_priorizacao → a_fazer
export async function priorizar(req, res, params, user) {
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const b = req.body || {};
  if (b.prioridade === undefined || b.prioridade === null) return badRequest(res, 'prioridade é obrigatória.');

  const { data: d } = await supabase.from('demandas').select('etapa').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (d.etapa !== 'aguardando_priorizacao') return badRequest(res, 'Só é possível priorizar demandas em Aguardando Priorização.');

  const update = {
    etapa: 'a_fazer',
    prioridade: parseInt(b.prioridade, 10),
    responsavel_id: b.responsavelId != null && b.responsavelId !== '' ? parseInt(b.responsavelId, 10) : null,
    prazo: b.prazo || null,
  };
  const { error } = await supabase.from('demandas').update(update).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/demandas/:id/etapa — coordenador: qualquer; designer: só suas (responsável = eu), só entre etapas de execução
export async function atualizarEtapa(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { etapa } = req.body || {};
  if (!etapa || !ETAPAS.includes(etapa)) return badRequest(res, 'etapa inválida. Use: aguardando_priorizacao, a_fazer, em_andamento, em_revisao, concluido.');

  const { data: d } = await supabase.from('demandas').select('etapa, responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');

  if (user.tipo === TipoUsuario.DESIGNER) {
    if (d.responsavel_id !== user.pessoaId) return forbidden(res);
    if (!ETAPAS_EXECUCAO.includes(d.etapa) || !ETAPAS_EXECUCAO.includes(etapa)) {
      return forbidden(res, 'Designer só pode mover demandas entre A Fazer, Em Andamento, Revisão e Concluído.');
    }
  }

  const concluida = etapa === 'concluido';
  const { error } = await supabase.from('demandas').update({ etapa, concluida }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// POST /api/demandas/:id/pegar — designer se atribui em demanda a_fazer sem responsável
export async function pegar(req, res, params, user) {
  if (user.tipo !== TipoUsuario.DESIGNER) return forbidden(res);
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');

  const { data: d } = await supabase.from('demandas').select('etapa, responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (d.etapa !== 'a_fazer') return badRequest(res, 'Só é possível pegar demandas em A Fazer.');
  if (d.responsavel_id != null) return badRequest(res, 'Demanda já possui responsável.');

  const { error } = await supabase.from('demandas').update({ responsavel_id: user.pessoaId }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/demandas/:id/concluir — coordenador: qualquer; designer: só suas
export async function concluir(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: d } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && d.responsavel_id !== user.pessoaId) return forbidden(res);
  const { error } = await supabase.from('demandas').update({ etapa: 'concluido', concluida: true }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

function fmtAtualiz(a) {
  return {
    id: a.id, demandaId: a.demanda_id, pessoaId: a.pessoa_id,
    pessoaNome: a.pessoas?.nome || null, texto: a.texto, criadoEm: a.criado_em,
  };
}

// GET /api/demandas/:id/atualizacoes — designer: minhas ou disponíveis
export async function listarAtualizacoes(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: d } = await supabase.from('demandas').select('etapa, responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER) {
    const ehMinha = d.responsavel_id === user.pessoaId;
    const ehDisponivel = d.etapa === 'a_fazer' && d.responsavel_id == null;
    if (!ehMinha && !ehDisponivel) return forbidden(res);
  }

  const { data, error } = await supabase.from('atualizacoes_demanda')
    .select('*, pessoas(nome)').eq('demanda_id', id).order('criado_em', { ascending: false });
  if (error) return serverError(res, error);
  return json(res, (data || []).map(fmtAtualiz));
}

// POST /api/demandas/:id/atualizacoes — designer: minhas ou disponíveis
export async function criarAtualizacao(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: d } = await supabase.from('demandas').select('etapa, responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER) {
    const ehMinha = d.responsavel_id === user.pessoaId;
    const ehDisponivel = d.etapa === 'a_fazer' && d.responsavel_id == null;
    if (!ehMinha && !ehDisponivel) return forbidden(res);
  }

  const { texto } = req.body || {};
  if (!texto) return badRequest(res, 'Texto é obrigatório.');
  const pessoaId = user.tipo === TipoUsuario.DESIGNER ? user.pessoaId : null;

  const { data, error } = await supabase.from('atualizacoes_demanda')
    .insert({ demanda_id: id, pessoa_id: pessoaId, texto })
    .select('*, pessoas(nome)').single();
  if (error) return serverError(res, error);
  return created(res, fmtAtualiz(data), `/api/demandas/${id}/atualizacoes`);
}
