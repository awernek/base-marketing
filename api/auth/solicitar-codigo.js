import crypto from 'crypto';
import { supabase } from '../../_lib/supabase.js';
import { cors, json, badRequest, serverError, allowMethods } from '../../_lib/response.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email } = req.body || {};
    if (!email) return badRequest(res, 'Email é obrigatório.');

    const emailNorm = email.toLowerCase().trim();
    const mensagemPadrao = { message: 'Se o email estiver cadastrado, o código foi enviado.' };

    // Verificar se a pessoa existe
    const { data: user } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', emailNorm)
      .single();

    // Se não existir, retorna 200 mesmo assim (não revelar)
    if (!user) return json(res, mensagemPadrao);

    // Rate limit: máx 5 códigos por email por hora
    const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('codigos_acesso')
      .select('*', { count: 'exact', head: true })
      .eq('email', emailNorm)
      .gte('criado_em', umaHoraAtras);

    if (count >= 5) return json(res, mensagemPadrao);

    // Invalidar códigos anteriores
    await supabase
      .from('codigos_acesso')
      .update({ usado: true })
      .eq('email', emailNorm)
      .eq('usado', false);

    // Gerar novo código (6 dígitos)
    const codigo = crypto.randomInt(100000, 999999).toString();

    await supabase
      .from('codigos_acesso')
      .insert({
        email: emailNorm,
        codigo,
        expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    // TODO: integrar envio de email real (Resend, SendGrid, etc.)
    // Por agora loga no console (visível nos logs do Vercel)
    console.log(`[CÓDIGO DE ACESSO] ${emailNorm}: ${codigo}`);

    return json(res, mensagemPadrao);
  } catch (err) {
    return serverError(res, err);
  }
}
