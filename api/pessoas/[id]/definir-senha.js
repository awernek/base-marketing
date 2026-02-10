import bcrypt from 'bcryptjs';
import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, noContent, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../../_lib/response.js';

// POST /api/pessoas/:id/definir-senha
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['POST'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  const { id } = req.query;
  const pessoaId = parseInt(id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');

  try {
    const { senha } = req.body || {};
    if (!senha || senha.length < 6) {
      return badRequest(res, 'Senha deve ter no mínimo 6 caracteres.');
    }

    // Verificar se a pessoa existe e tem usuário
    const { data: pessoa } = await supabase
      .from('pessoas')
      .select('id, ativo')
      .eq('id', pessoaId)
      .single();

    if (!pessoa || !pessoa.ativo) return notFound(res, 'Pessoa não encontrada ou inativa.');

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('pessoa_id', pessoaId)
      .single();

    if (!usuario) return notFound(res, 'Pessoa sem usuário vinculado.');

    const senhaHash = await bcrypt.hash(senha, 10);

    const { error } = await supabase
      .from('usuarios')
      .update({ senha_hash: senhaHash })
      .eq('id', usuario.id);

    if (error) return serverError(res, error);
    return noContent(res);
  } catch (err) {
    return serverError(res, err);
  }
}
