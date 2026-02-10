import bcrypt from 'bcryptjs';
import { supabase } from '../../_lib/supabase.js';
import { signToken } from '../../_lib/auth.js';
import { cors, json, badRequest, serverError, allowMethods } from '../../_lib/response.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email, senha, tipo = 0, pessoaId = null } = req.body || {};
    if (!email || !senha) return badRequest(res, 'Email e senha são obrigatórios.');

    const emailNorm = email.toLowerCase().trim();

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', emailNorm)
      .single();

    if (existing) return badRequest(res, 'Email já cadastrado.');

    // Se Designer, pessoaId é obrigatório
    if (tipo === 1 && !pessoaId) {
      return badRequest(res, 'pessoaId é obrigatório para Designer.');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const { data: user, error } = await supabase
      .from('usuarios')
      .insert({ email: emailNorm, senha_hash: senhaHash, tipo, pessoa_id: pessoaId })
      .select()
      .single();

    if (error) return serverError(res, error);

    const token = signToken({
      userId: user.id,
      email: user.email,
      tipo: user.tipo,
      pessoaId: user.pessoa_id,
    });

    return json(res, {
      token,
      tipo: user.tipo,
      pessoaId: user.pessoa_id || null,
      email: user.email,
    });
  } catch (err) {
    return serverError(res, err);
  }
}
