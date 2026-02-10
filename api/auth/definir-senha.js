import bcrypt from 'bcryptjs';
import { supabase } from '../../_lib/supabase.js';
import { signToken } from '../../_lib/auth.js';
import { cors, json, badRequest, serverError, allowMethods } from '../../_lib/response.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email, codigo, senha } = req.body || {};
    if (!email || !codigo || !senha) {
      return badRequest(res, 'Email, código e senha são obrigatórios.');
    }

    const emailNorm = email.toLowerCase().trim();

    // Buscar código válido (não usado, não expirado)
    const { data: codigoRow, error: cErr } = await supabase
      .from('codigos_acesso')
      .select('*')
      .eq('email', emailNorm)
      .eq('usado', false)
      .gt('expira_em', new Date().toISOString())
      .order('criado_em', { ascending: false })
      .limit(1)
      .single();

    if (cErr || !codigoRow) {
      return badRequest(res, 'Código inválido ou expirado.');
    }

    // Verificar tentativas (máx 3)
    if (codigoRow.tentativas >= 3) {
      await supabase
        .from('codigos_acesso')
        .update({ usado: true })
        .eq('id', codigoRow.id);
      return badRequest(res, 'Número de tentativas excedido. Solicite um novo código.');
    }

    // Código correto?
    if (codigoRow.codigo !== codigo) {
      await supabase
        .from('codigos_acesso')
        .update({ tentativas: codigoRow.tentativas + 1 })
        .eq('id', codigoRow.id);
      return badRequest(res, 'Código inválido.');
    }

    // Marcar código como usado
    await supabase
      .from('codigos_acesso')
      .update({ usado: true })
      .eq('id', codigoRow.id);

    const senhaHash = await bcrypt.hash(senha, 10);

    // Verificar se o usuário já existe
    const { data: user } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', emailNorm)
      .single();

    let finalUser;

    if (user) {
      // Atualizar senha
      const { data, error } = await supabase
        .from('usuarios')
        .update({ senha_hash: senhaHash })
        .eq('id', user.id)
        .select()
        .single();
      if (error) return serverError(res, error);
      finalUser = data;
    } else {
      // Criar novo usuário Designer
      // Buscar pessoa pelo email
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('email', emailNorm)
        .eq('ativo', true)
        .single();

      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          email: emailNorm,
          senha_hash: senhaHash,
          tipo: 1,
          pessoa_id: pessoa?.id || null,
        })
        .select()
        .single();
      if (error) return serverError(res, error);
      finalUser = data;
    }

    const token = signToken({
      userId: finalUser.id,
      email: finalUser.email,
      tipo: finalUser.tipo,
      pessoaId: finalUser.pessoa_id,
    });

    return json(res, {
      token,
      tipo: finalUser.tipo,
      pessoaId: finalUser.pessoa_id || null,
      email: finalUser.email,
    });
  } catch (err) {
    return serverError(res, err);
  }
}
