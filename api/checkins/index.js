import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, created, badRequest, unauthorized,
  serverError, allowMethods,
} from '../../_lib/response.js';

function formatCheckin(c) {
  return {
    id: c.id,
    pessoaId: c.pessoa_id,
    pessoaNome: c.pessoas?.nome || null,
    data: c.data,
    carga: c.carga,
    bloqueio: c.bloqueio,
  };
}

// Retorna início e fim da semana atual (seg-dom)
function getSemanaAtual() {
  const agora = new Date();
  const dia = agora.getUTCDay(); // 0=dom, 1=seg...
  const diffSeg = dia === 0 ? -6 : 1 - dia;
  const segunda = new Date(agora);
  segunda.setUTCDate(agora.getUTCDate() + diffSeg);
  segunda.setUTCHours(0, 0, 0, 0);
  const domingo = new Date(segunda);
  domingo.setUTCDate(segunda.getUTCDate() + 7);
  return { inicio: segunda.toISOString(), fim: domingo.toISOString() };
}

// GET  /api/checkins  → listar (query: ?semanaAtual=true)
// POST /api/checkins  → criar/atualizar
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    if (req.method === 'GET') {
      let query = supabase
        .from('checkins')
        .select('*, pessoas(nome)')
        .order('data', { ascending: false });

      // Designer só vê os próprios
      if (user.tipo === TipoUsuario.DESIGNER) {
        query = query.eq('pessoa_id', user.pessoaId);
      }

      if (req.query.semanaAtual === 'true') {
        const { inicio, fim } = getSemanaAtual();
        query = query.gte('data', inicio).lt('data', fim);
      }

      const { data, error } = await query;
      if (error) return serverError(res, error);

      return json(res, (data || []).map(formatCheckin));
    }

    // POST — criar ou atualizar
    const body = req.body || {};
    let pessoaId;

    if (user.tipo === TipoUsuario.COORDENADOR) {
      if (!body.pessoaId) return badRequest(res, 'pessoaId é obrigatório para coordenador.');
      pessoaId = body.pessoaId;
    } else {
      pessoaId = user.pessoaId;
    }

    if (body.carga === undefined || body.carga === null) {
      return badRequest(res, 'Carga é obrigatória.');
    }

    // Verificar se já existe check-in na semana
    const { inicio, fim } = getSemanaAtual();

    const { data: existente } = await supabase
      .from('checkins')
      .select('*')
      .eq('pessoa_id', pessoaId)
      .gte('data', inicio)
      .lt('data', fim)
      .limit(1)
      .single();

    if (existente) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('checkins')
        .update({
          carga: body.carga,
          bloqueio: body.bloqueio ?? null,
        })
        .eq('id', existente.id)
        .select('*, pessoas(nome)')
        .single();

      if (error) return serverError(res, error);
      return json(res, formatCheckin(data));
    }

    // Criar novo
    const { data, error } = await supabase
      .from('checkins')
      .insert({
        pessoa_id: pessoaId,
        carga: body.carga,
        bloqueio: body.bloqueio ?? null,
      })
      .select('*, pessoas(nome)')
      .single();

    if (error) return serverError(res, error);
    return created(res, formatCheckin(data), `/api/checkins`);
  } catch (err) {
    return serverError(res, err);
  }
}
