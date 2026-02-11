import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import {
  json, created, noContent, badRequest, forbidden,
  notFound, serverError,
} from '../response.js';

const SELECT_DEMANDA = '*, pessoas!demandas_responsavel_id_fkey(nome), empreendimentos(nome)';

const ETAPAS = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido'];

/** Status automático por prazo (Sprint 4): atrasado, urgente, atencao, normal */
function statusAutomatico(prazo, concluida) {
  if (concluida || !prazo) return 'normal';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const p = new Date(prazo);
  p.setHours(0, 0, 0, 0);
  const diasRestantes = Math.ceil((p - hoje) / (1000 * 60 * 60 * 24));
  if (diasRestantes < 0) return 'atrasado';
  if (diasRestantes <= 2) return 'urgente';
  if (diasRestantes <= 7) return 'atencao';
  return 'normal';
}

function fmt(d, comentariosCount = 0) {
  const etapa = d.etapa && ETAPAS.includes(d.etapa) ? d.etapa : (d.concluida ? 'concluido' : 'a_fazer');
  return {
    id: d.id, titulo: d.titulo, descricao: d.descricao, tipo: d.tipo,
    responsavelId: d.responsavel_id, responsavelNome: d.pessoas?.nome || null,
    prazo: d.prazo, impacto: d.impacto, status: d.status, prioridade: d.prioridade,
    etapa,
    ordem: d.ordem, link: d.link, empreendimentoId: d.empreendimento_id,
    empreendimentoNome: d.empreendimentos?.nome || null, concluida: d.concluida,
    criadaEm: d.criada_em, atualizadaEm: d.atualizada_em,
    comentariosCount,
    statusAutomatico: statusAutomatico(d.prazo, d.concluida),
  };
}

// GET /api/demandas — ordenação: prioridade (Alta primeiro), depois prazo
export async function listar(req, res, params, user) {
  let query = supabase
    .from('demandas')
    .select(SELECT_DEMANDA)
    .order('prioridade', { ascending: true })
    .order('prazo', { ascending: true });
  if (user.tipo === TipoUsuario.DESIGNER) query = query.eq('responsavel_id', user.pessoaId);

  const { ativas, de, ate, empreendimentoId, tipo, prioridade, responsavelId } = req.query;
  if (ativas === 'true') query = query.eq('concluida', false);
  if (de) query = query.gte('prazo', de);
  if (ate) query = query.lte('prazo', ate);
  if (empreendimentoId) query = query.eq('empreendimento_id', parseInt(empreendimentoId, 10));
  if (tipo !== undefined && tipo !== '') query = query.eq('tipo', parseInt(tipo, 10));
  if (prioridade !== undefined && prioridade !== '') query = query.eq('prioridade', parseInt(prioridade, 10));
  if (responsavelId !== undefined && responsavelId !== '') query = query.eq('responsavel_id', parseInt(responsavelId, 10));

  const { data, error } = await query;
  if (error) return serverError(res, error);
  const list = data || [];
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

// POST /api/demandas
export async function criar(req, res, params, user) {
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);
  const b = req.body || {};
  if (!b.titulo) return badRequest(res, 'Título é obrigatório.');
  if (!b.responsavelId) return badRequest(res, 'responsavelId é obrigatório.');
  if (!b.prazo) return badRequest(res, 'Prazo é obrigatório.');

  const { data, error } = await supabase.from('demandas').insert({
    titulo: b.titulo, descricao: b.descricao || null, tipo: b.tipo ?? 0,
    responsavel_id: b.responsavelId, prazo: b.prazo, impacto: b.impacto ?? 0,
    prioridade: b.prioridade ?? 1, ordem: b.ordem ?? null, link: b.link || null,
    empreendimento_id: b.empreendimentoId || null,
  }).select(SELECT_DEMANDA).single();
  if (error) return serverError(res, error);
  return created(res, fmt(data), `/api/demandas/${data.id}`);
}

// GET /api/demandas/ativas
export async function ativas(req, res, params, user) {
  let query = supabase.from('demandas').select(SELECT_DEMANDA).eq('concluida', false).order('prazo');
  if (user.tipo === TipoUsuario.DESIGNER) query = query.eq('responsavel_id', user.pessoaId);
  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, (data || []).map(fmt));
}

// GET /api/demandas/proximos-prazos
export async function proximosPrazos(req, res, params, user) {
  const dias = parseInt(req.query.dias || '7', 10);
  const agora = new Date();
  const limite = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000);
  let query = supabase.from('demandas').select(SELECT_DEMANDA)
    .eq('concluida', false).gte('prazo', agora.toISOString()).lte('prazo', limite.toISOString()).order('prazo');
  if (user.tipo === TipoUsuario.DESIGNER) query = query.eq('responsavel_id', user.pessoaId);
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

// GET /api/demandas/:id
export async function obter(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data, error } = await supabase.from('demandas').select(SELECT_DEMANDA).eq('id', id).single();
  if (error || !data) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && data.responsavel_id !== user.pessoaId) return forbidden(res);
  return json(res, fmt(data));
}

// PUT /api/demandas/:id
export async function atualizar(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: atual } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!atual) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && atual.responsavel_id !== user.pessoaId) return forbidden(res);

  const b = req.body || {};
  const { error } = await supabase.from('demandas').update({
    titulo: b.titulo, descricao: b.descricao ?? null, tipo: b.tipo,
    responsavel_id: b.responsavelId, prazo: b.prazo, impacto: b.impacto,
    status: b.status, prioridade: b.prioridade, ordem: b.ordem ?? null,
    link: b.link ?? null, empreendimento_id: b.empreendimentoId ?? null,
  }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/demandas/:id/status
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

// PUT /api/demandas/:id/etapa (Sprint 3 — Kanban)
export async function atualizarEtapa(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { etapa } = req.body || {};
  if (!etapa || !ETAPAS.includes(etapa)) return badRequest(res, 'etapa inválida. Use: a_fazer, em_andamento, em_revisao, concluido.');
  const { data: d } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && d.responsavel_id !== user.pessoaId) return forbidden(res);
  const concluida = etapa === 'concluido';
  const { error } = await supabase.from('demandas').update({ etapa, concluida }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/demandas/:id/concluir
export async function concluir(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: d } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && d.responsavel_id !== user.pessoaId) return forbidden(res);
  const { error } = await supabase.from('demandas').update({ concluida: true }).eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}

function fmtAtualiz(a) {
  return {
    id: a.id, demandaId: a.demanda_id, pessoaId: a.pessoa_id,
    pessoaNome: a.pessoas?.nome || null, texto: a.texto, criadoEm: a.criado_em,
  };
}

// GET /api/demandas/:id/atualizacoes
export async function listarAtualizacoes(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: d } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && d.responsavel_id !== user.pessoaId) return forbidden(res);

  const { data, error } = await supabase.from('atualizacoes_demanda')
    .select('*, pessoas(nome)').eq('demanda_id', id).order('criado_em', { ascending: false });
  if (error) return serverError(res, error);
  return json(res, (data || []).map(fmtAtualiz));
}

// POST /api/demandas/:id/atualizacoes
export async function criarAtualizacao(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');
  const { data: d } = await supabase.from('demandas').select('responsavel_id').eq('id', id).single();
  if (!d) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && d.responsavel_id !== user.pessoaId) return forbidden(res);

  const { texto } = req.body || {};
  if (!texto) return badRequest(res, 'Texto é obrigatório.');
  const pessoaId = user.tipo === TipoUsuario.DESIGNER ? user.pessoaId : null;

  const { data, error } = await supabase.from('atualizacoes_demanda')
    .insert({ demanda_id: id, pessoa_id: pessoaId, texto })
    .select('*, pessoas(nome)').single();
  if (error) return serverError(res, error);
  return created(res, fmtAtualiz(data), `/api/demandas/${id}/atualizacoes`);
}
