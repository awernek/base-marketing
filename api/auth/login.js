import bcrypt from 'bcryptjs';
import { supabase } from '../../_lib/supabase.js';
import { signToken } from '../../_lib/auth.js';
import { cors, json, badRequest, unauthorized, serverError, allowMethods } from '../../_lib/response.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['POST'])) return;

  try {
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
