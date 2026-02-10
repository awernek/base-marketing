import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import {
  json, created, noContent, badRequest, forbidden,
  notFound, serverError,
} from '../response.js';

const cargaLabels = { 0: 'Baixa', 1: 'Media', 2: 'Alta' };

// GET /api/pessoas
export async function listar(req, res) {
  const { data: pessoas, error } = await supabase
    .from('pessoas').select('*').eq('ativo', true).order('nome');
  if (error) return serverError(res, error);

  const { data: cargas } = await supabase.from('vw_carga_semana').select('*');
  const cargaMap = new Map((cargas || []).map(c => [c.pessoa_id, c]));

  const { data: demandas } = await supabase
    .from('demandas').select('responsavel_id').eq('concluida', false);
  const dc = {};
  (demandas || []).forEach(d => { dc[d.responsavel_id] = (dc[d.responsavel_id] || 0) + 1; });

  return json(res, pessoas.map(p => ({
    id: p.id, nome: p.nome, email: p.email, ativo: p.ativo,
    notasCoordenacao: p.notas_coordenacao,
    cargaAtual: cargaMap.has(p.id) ? cargaLabels[cargaMap.get(p.id).carga] || '' : '',
    demandasAtivas: dc[p.id] || 0,
  })));
}

// GET /api/pessoas/lista
export async function listaEnxuta(req, res) {
  const { data, error } = await supabase
    .from('pessoas').select('id, nome, email').eq('ativo', true).order('nome');
  if (error) return serverError(res, error);
  return json(res, data);
}

// POST /api/pessoas
export async function criar(req, res) {
  const { nome, email, notasCoordenacao } = req.body || {};
  if (!nome) return badRequest(res, 'Nome é obrigatório.');

  const { data: pessoa, error } = await supabase.from('pessoas')
    .insert({ nome, email: email || null, notas_coordenacao: notasCoordenacao || null })
    .select().single();
  if (error) return serverError(res, error);

  return created(res, {
    id: pessoa.id, nome: pessoa.nome, email: pessoa.email, ativo: pessoa.ativo,
    notasCoordenacao: pessoa.notas_coordenacao, cargaAtual: '', demandasAtivas: 0,
  }, `/api/pessoas/${pessoa.id}`);
}

// GET /api/pessoas/:id
export async function obter(req, res, params) {
  const pessoaId = parseInt(params.id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');

  const { data: pessoa, error } = await supabase
    .from('pessoas').select('*').eq('id', pessoaId).single();
  if (error || !pessoa) return notFound(res, 'Pessoa não encontrada.');

  const { data: carga } = await supabase
    .from('vw_carga_semana').select('carga').eq('pessoa_id', pessoaId).single();
  const { count } = await supabase.from('demandas')
    .select('*', { count: 'exact', head: true })
    .eq('responsavel_id', pessoaId).eq('concluida', false);

  return json(res, {
    id: pessoa.id, nome: pessoa.nome, email: pessoa.email, ativo: pessoa.ativo,
    notasCoordenacao: pessoa.notas_coordenacao,
    cargaAtual: carga ? cargaLabels[carga.carga] || '' : '',
    demandasAtivas: count || 0,
  });
}

// PUT /api/pessoas/:id
export async function atualizar(req, res, params) {
  const pessoaId = parseInt(params.id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');
  const { nome, email, notasCoordenacao, ativo } = req.body || {};

  const { error } = await supabase.from('pessoas')
    .update({ nome, email: email || null, notas_coordenacao: notasCoordenacao ?? null, ativo: ativo ?? true })
    .eq('id', pessoaId);
  if (error) return serverError(res, error);
  return noContent(res);
}

// DELETE /api/pessoas/:id
export async function desativar(req, res, params) {
  const pessoaId = parseInt(params.id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');
  const { error } = await supabase.from('pessoas').update({ ativo: false }).eq('id', pessoaId);
  if (error) return serverError(res, error);
  return noContent(res);
}

// PUT /api/pessoas/:id/notas
export async function atualizarNotas(req, res, params) {
  const pessoaId = parseInt(params.id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');
  const { notas } = req.body || {};
  const { error } = await supabase.from('pessoas')
    .update({ notas_coordenacao: notas ?? null }).eq('id', pessoaId);
  if (error) return serverError(res, error);
  return noContent(res);
}

// POST /api/pessoas/:id/convidar
export async function convidar(req, res, params) {
  const pessoaId = parseInt(params.id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');

  const { data: pessoa, error: pErr } = await supabase
    .from('pessoas').select('*').eq('id', pessoaId).single();
  if (pErr || !pessoa) return notFound(res, 'Pessoa não encontrada.');
  if (!pessoa.ativo) return notFound(res, 'Pessoa inativa.');
  if (!pessoa.email) return badRequest(res, 'Pessoa sem email cadastrado.');

  const { data: existing } = await supabase
    .from('usuarios').select('id').eq('pessoa_id', pessoaId).single();
  if (existing) return badRequest(res, 'Esta pessoa já possui acesso.');

  const { error: uErr } = await supabase.from('usuarios').insert({
    email: pessoa.email.toLowerCase().trim(), senha_hash: '!PENDENTE', tipo: 1, pessoa_id: pessoaId,
  });
  if (uErr) return serverError(res, uErr);

  const codigo = crypto.randomInt(100000, 999999).toString();
  await supabase.from('codigos_acesso')
    .update({ usado: true }).eq('email', pessoa.email.toLowerCase().trim()).eq('usado', false);
  await supabase.from('codigos_acesso').insert({
    email: pessoa.email.toLowerCase().trim(), codigo,
    expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  console.log(`[CONVITE] ${pessoa.email}: código ${codigo}`);
  return json(res, { message: `Convite enviado para ${pessoa.email}.` });
}

// POST /api/pessoas/:id/definir-senha
export async function pessoaDefinirSenha(req, res, params) {
  const pessoaId = parseInt(params.id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');
  const { senha } = req.body || {};
  if (!senha || senha.length < 6) return badRequest(res, 'Senha deve ter no mínimo 6 caracteres.');

  const { data: pessoa } = await supabase
    .from('pessoas').select('id, ativo').eq('id', pessoaId).single();
  if (!pessoa || !pessoa.ativo) return notFound(res, 'Pessoa não encontrada ou inativa.');

  const { data: usuario } = await supabase
    .from('usuarios').select('id').eq('pessoa_id', pessoaId).single();
  if (!usuario) return notFound(res, 'Pessoa sem usuário vinculado.');

  const senhaHash = await bcrypt.hash(senha, 10);
  const { error } = await supabase.from('usuarios')
    .update({ senha_hash: senhaHash }).eq('id', usuario.id);
  if (error) return serverError(res, error);
  return noContent(res);
}
