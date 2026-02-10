import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import { cors, json, unauthorized, serverError, allowMethods } from '../../_lib/response.js';

function formatCheckin(c) {
  return {
    id: c.id, pessoaId: c.pessoa_id, pessoaNome: c.pessoas?.nome || null,
    data: c.data, carga: c.carga, bloqueio: c.bloqueio,
  };
}

function getSemanaAtual() {
  const agora = new Date();
  const dia = agora.getUTCDay();
  const diffSeg = dia === 0 ? -6 : 1 - dia;
  const segunda = new Date(agora);
  segunda.setUTCDate(agora.getUTCDate() + diffSeg);
  segunda.setUTCHours(0, 0, 0, 0);
  const domingo = new Date(segunda);
  domingo.setUTCDate(segunda.getUTCDate() + 7);
  return { inicio: segunda.toISOString(), fim: domingo.toISOString() };
}

// GET /api/checkins/semana-atual
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    const { inicio, fim } = getSemanaAtual();

    let query = supabase
      .from('checkins')
      .select('*, pessoas(nome)')
      .gte('data', inicio)
      .lt('data', fim)
      .order('data', { ascending: false });

    if (user.tipo === TipoUsuario.DESIGNER) {
      query = query.eq('pessoa_id', user.pessoaId);
    }

    const { data, error } = await query;
    if (error) return serverError(res, error);

    return json(res, (data || []).map(formatCheckin));
  } catch (err) {
    return serverError(res, err);
  }
}
