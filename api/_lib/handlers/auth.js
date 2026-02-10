import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from '../supabase.js';
import { signToken } from '../auth.js';
import {
  json, badRequest, unauthorized, serverError,
} from '../response.js';

// POST /api/auth/login
export async function login(req, res) {
  const { email, senha } = req.body || {};
  if (!email || !senha) return badRequest(res, 'Email e senha são obrigatórios.');

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !user) return unauthorized(res, 'Credenciais inválidas.');

  const senhaValida = await bcrypt.compare(senha, user.senha_hash);
  if (!senhaValida) return unauthorized(res, 'Credenciais inválidas.');

  const token = signToken({
    userId: user.id, email: user.email, tipo: user.tipo, pessoaId: user.pessoa_id,
  });

  return json(res, { token, tipo: user.tipo, pessoaId: user.pessoa_id || null, email: user.email });
}

// POST /api/auth/register
export async function register(req, res) {
  const { email, senha, tipo = 0, pessoaId = null } = req.body || {};
  if (!email || !senha) return badRequest(res, 'Email e senha são obrigatórios.');

  const emailNorm = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from('usuarios').select('id').eq('email', emailNorm).single();
  if (existing) return badRequest(res, 'Email já cadastrado.');

  if (tipo === 1 && !pessoaId) return badRequest(res, 'pessoaId é obrigatório para Designer.');

  const senhaHash = await bcrypt.hash(senha, 10);

  const { data: user, error } = await supabase
    .from('usuarios')
    .insert({ email: emailNorm, senha_hash: senhaHash, tipo, pessoa_id: pessoaId })
    .select().single();

  if (error) return serverError(res, error);

  const token = signToken({
    userId: user.id, email: user.email, tipo: user.tipo, pessoaId: user.pessoa_id,
  });

  return json(res, { token, tipo: user.tipo, pessoaId: user.pessoa_id || null, email: user.email });
}

// POST /api/auth/solicitar-codigo
export async function solicitarCodigo(req, res) {
  const { email } = req.body || {};
  if (!email) return badRequest(res, 'Email é obrigatório.');

  const emailNorm = email.toLowerCase().trim();
  const msg = { message: 'Se o email estiver cadastrado, o código foi enviado.' };

  const { data: user } = await supabase
    .from('usuarios').select('id').eq('email', emailNorm).single();
  if (!user) return json(res, msg);

  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('codigos_acesso')
    .select('*', { count: 'exact', head: true })
    .eq('email', emailNorm).gte('criado_em', umaHoraAtras);
  if (count >= 5) return json(res, msg);

  await supabase.from('codigos_acesso')
    .update({ usado: true }).eq('email', emailNorm).eq('usado', false);

  const codigo = crypto.randomInt(100000, 999999).toString();
  await supabase.from('codigos_acesso').insert({
    email: emailNorm, codigo,
    expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  console.log(`[CÓDIGO DE ACESSO] ${emailNorm}: ${codigo}`);
  return json(res, msg);
}

// POST /api/auth/definir-senha
export async function definirSenha(req, res) {
  const { email, codigo, senha } = req.body || {};
  if (!email || !codigo || !senha) return badRequest(res, 'Email, código e senha são obrigatórios.');

  const emailNorm = email.toLowerCase().trim();

  const { data: codigoRow, error: cErr } = await supabase
    .from('codigos_acesso').select('*')
    .eq('email', emailNorm).eq('usado', false)
    .gt('expira_em', new Date().toISOString())
    .order('criado_em', { ascending: false }).limit(1).single();

  if (cErr || !codigoRow) return badRequest(res, 'Código inválido ou expirado.');

  if (codigoRow.tentativas >= 3) {
    await supabase.from('codigos_acesso').update({ usado: true }).eq('id', codigoRow.id);
    return badRequest(res, 'Número de tentativas excedido. Solicite um novo código.');
  }

  if (codigoRow.codigo !== codigo) {
    await supabase.from('codigos_acesso')
      .update({ tentativas: codigoRow.tentativas + 1 }).eq('id', codigoRow.id);
    return badRequest(res, 'Código inválido.');
  }

  await supabase.from('codigos_acesso').update({ usado: true }).eq('id', codigoRow.id);

  const senhaHash = await bcrypt.hash(senha, 10);
  const { data: user } = await supabase
    .from('usuarios').select('*').eq('email', emailNorm).single();

  let finalUser;
  if (user) {
    const { data, error } = await supabase.from('usuarios')
      .update({ senha_hash: senhaHash }).eq('id', user.id).select().single();
    if (error) return serverError(res, error);
    finalUser = data;
  } else {
    const { data: pessoa } = await supabase
      .from('pessoas').select('id').eq('email', emailNorm).eq('ativo', true).single();
    const { data, error } = await supabase.from('usuarios')
      .insert({ email: emailNorm, senha_hash: senhaHash, tipo: 1, pessoa_id: pessoa?.id || null })
      .select().single();
    if (error) return serverError(res, error);
    finalUser = data;
  }

  const token = signToken({
    userId: finalUser.id, email: finalUser.email, tipo: finalUser.tipo, pessoaId: finalUser.pessoa_id,
  });
  return json(res, { token, tipo: finalUser.tipo, pessoaId: finalUser.pessoa_id || null, email: finalUser.email });
}
