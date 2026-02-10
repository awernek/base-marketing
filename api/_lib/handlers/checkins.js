import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import {
  json, created, badRequest, forbidden, serverError,
} from '../response.js';

function getSemanaAtual() {
  const agora = new Date();
  const dia = agora.getDay();
  const diff = agora.getDate() - dia + (dia === 0 ? -6 : 1);
  const seg = new Date(agora.setDate(diff));
  seg.setHours(0, 0, 0, 0);
  const dom = new Date(seg);
  dom.setDate(dom.getDate() + 6);
  dom.setHours(23, 59, 59, 999);
  return { inicio: seg.toISOString(), fim: dom.toISOString() };
}

// GET /api/checkins
export async function listar(req, res, params, user) {
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);
  const { de, ate } = req.query;
  let query = supabase.from('checkins')
    .select('*, pessoas(nome)').order('data', { ascending: false });
  if (de) query = query.gte('data', de);
  if (ate) query = query.lte('data', ate);
  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, (data || []).map(c => ({
    id: c.id, pessoaId: c.pessoa_id, pessoaNome: c.pessoas?.nome || null,
    data: c.data, carga: c.carga, observacoes: c.observacoes,
  })));
}

// POST /api/checkins
export async function criar(req, res, params, user) {
  if (user.tipo !== TipoUsuario.DESIGNER || !user.pessoaId) return forbidden(res);
  const { carga, observacoes } = req.body || {};
  if (carga === undefined || carga === null) return badRequest(res, 'Carga é obrigatória.');

  const hoje = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase.from('checkins')
    .select('id').eq('pessoa_id', user.pessoaId).eq('data', hoje).single();

  let data, error;
  if (existing) {
    ({ data, error } = await supabase.from('checkins')
      .update({ carga, observacoes: observacoes || null })
      .eq('id', existing.id).select('*, pessoas(nome)').single());
  } else {
    ({ data, error } = await supabase.from('checkins')
      .insert({ pessoa_id: user.pessoaId, data: hoje, carga, observacoes: observacoes || null })
      .select('*, pessoas(nome)').single());
  }
  if (error) return serverError(res, error);
  return created(res, {
    id: data.id, pessoaId: data.pessoa_id, pessoaNome: data.pessoas?.nome || null,
    data: data.data, carga: data.carga, observacoes: data.observacoes,
  });
}

// GET /api/checkins/semana-atual
export async function semanaAtual(req, res, params, user) {
  const semana = getSemanaAtual();
  let query = supabase.from('checkins').select('*, pessoas(nome)')
    .gte('data', semana.inicio.split('T')[0]).lte('data', semana.fim.split('T')[0])
    .order('data', { ascending: false });
  if (user.tipo === TipoUsuario.DESIGNER) query = query.eq('pessoa_id', user.pessoaId);
  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, (data || []).map(c => ({
    id: c.id, pessoaId: c.pessoa_id, pessoaNome: c.pessoas?.nome || null,
    data: c.data, carga: c.carga, observacoes: c.observacoes,
  })));
}

// GET /api/checkins/pessoa/:pessoaId
export async function porPessoa(req, res, params, user) {
  const pessoaId = parseInt(params.pessoaId, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'pessoaId inválido.');
  if (user.tipo === TipoUsuario.DESIGNER && user.pessoaId !== pessoaId) return forbidden(res);
  const { data, error } = await supabase.from('checkins').select('*, pessoas(nome)')
    .eq('pessoa_id', pessoaId).order('data', { ascending: false }).limit(30);
  if (error) return serverError(res, error);
  return json(res, (data || []).map(c => ({
    id: c.id, pessoaId: c.pessoa_id, pessoaNome: c.pessoas?.nome || null,
    data: c.data, carga: c.carga, observacoes: c.observacoes,
  })));
}
