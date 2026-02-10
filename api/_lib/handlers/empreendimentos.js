import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import {
  json, created, noContent, badRequest, forbidden,
  notFound, serverError,
} from '../response.js';

// GET /api/empreendimentos
export async function listar(req, res, params, user) {
  const apenasAtivos = req.query.apenasAtivos === 'true' || user.tipo === TipoUsuario.DESIGNER;
  let query = supabase.from('empreendimentos').select('id, nome, ativo').order('nome');
  if (apenasAtivos) query = query.eq('ativo', true);
  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, data);
}

// GET /api/empreendimentos/lista
export async function listaEnxuta(req, res) {
  const { data, error } = await supabase
    .from('empreendimentos').select('id, nome').eq('ativo', true).order('nome');
  if (error) return serverError(res, error);
  return json(res, data);
}

// GET /api/empreendimentos/:id
export async function obter(req, res, params) {
  const empId = parseInt(params.id, 10);
  if (isNaN(empId)) return badRequest(res, 'ID inválido.');
  const { data, error } = await supabase
    .from('empreendimentos').select('*').eq('id', empId).single();
  if (error || !data) return notFound(res, 'Empreendimento não encontrado.');
  return json(res, { id: data.id, nome: data.nome, ativo: data.ativo });
}

// POST /api/empreendimentos
export async function criar(req, res) {
  const { nome, ativo = true } = req.body || {};
  if (!nome) return badRequest(res, 'Nome é obrigatório.');
  const { data, error } = await supabase
    .from('empreendimentos').insert({ nome, ativo }).select().single();
  if (error) return serverError(res, error);
  return created(res, data, `/api/empreendimentos/${data.id}`);
}

// PUT /api/empreendimentos/:id
export async function atualizar(req, res, params) {
  const empId = parseInt(params.id, 10);
  if (isNaN(empId)) return badRequest(res, 'ID inválido.');
  const { nome, ativo } = req.body || {};
  const { error } = await supabase.from('empreendimentos')
    .update({ nome, ativo: ativo ?? true }).eq('id', empId);
  if (error) return serverError(res, error);
  return noContent(res);
}

// DELETE /api/empreendimentos/:id
export async function desativar(req, res, params) {
  const empId = parseInt(params.id, 10);
  if (isNaN(empId)) return badRequest(res, 'ID inválido.');
  const { error } = await supabase.from('empreendimentos')
    .update({ ativo: false }).eq('id', empId);
  if (error) return serverError(res, error);
  return noContent(res);
}
