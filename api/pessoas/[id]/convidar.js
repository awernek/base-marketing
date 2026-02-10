import crypto from 'crypto';
import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, json, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../../_lib/response.js';

// POST /api/pessoas/:id/convidar
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
    // Buscar pessoa
    const { data: pessoa, error: pErr } = await supabase
      .from('pessoas')
      .select('*')
      .eq('id', pessoaId)
      .single();

    if (pErr || !pessoa) return notFound(res, 'Pessoa não encontrada.');
    if (!pessoa.ativo) return notFound(res, 'Pessoa inativa.');
    if (!pessoa.email) return badRequest(res, 'Pessoa sem email cadastrado.');

    // Verificar se já possui usuário
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('pessoa_id', pessoaId)
      .single();

    if (existing) return badRequest(res, 'Esta pessoa já possui acesso.');

    // Criar usuário sem senha ativa (hash placeholder)
    const { error: uErr } = await supabase
      .from('usuarios')
      .insert({
        email: pessoa.email.toLowerCase().trim(),
        senha_hash: '!PENDENTE',  // Não é um hash válido de bcrypt, impede login
        tipo: 1,
        pessoa_id: pessoaId,
      });

    if (uErr) return serverError(res, uErr);

    // Gerar código de acesso
    const codigo = crypto.randomInt(100000, 999999).toString();

    // Invalidar anteriores
    await supabase
      .from('codigos_acesso')
      .update({ usado: true })
      .eq('email', pessoa.email.toLowerCase().trim())
      .eq('usado', false);

    await supabase
      .from('codigos_acesso')
      .insert({
        email: pessoa.email.toLowerCase().trim(),
        codigo,
        expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    // TODO: enviar email real
    console.log(`[CONVITE] ${pessoa.email}: código ${codigo}`);

    return json(res, { message: `Convite enviado para ${pessoa.email}.` });
  } catch (err) {
    return serverError(res, err);
  }
}
