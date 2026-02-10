import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, json, unauthorized, forbidden, serverError, allowMethods,
} from '../../../_lib/response.js';

// GET /api/relatorios/demandas-concluidas — só coordenador
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  try {
    // Defaults: último mês
    const ate = req.query.ate || new Date().toISOString();
    const de = req.query.de || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('demandas')
      .select('id, titulo, tipo, responsavel_id, prazo, atualizada_em, empreendimento_id, pessoas!demandas_responsavel_id_fkey(nome), empreendimentos(nome)')
      .eq('concluida', true)
      .gte('atualizada_em', de)
      .lte('atualizada_em', ate)
      .order('atualizada_em', { ascending: false });

    if (req.query.responsavelId) {
      query = query.eq('responsavel_id', parseInt(req.query.responsavelId, 10));
    }
    if (req.query.empreendimentoId) {
      query = query.eq('empreendimento_id', parseInt(req.query.empreendimentoId, 10));
    }

    const { data, error } = await query;
    if (error) return serverError(res, error);

    const itens = (data || []).map(d => ({
      id: d.id,
      titulo: d.titulo,
      tipo: d.tipo,
      responsavelId: d.responsavel_id,
      responsavelNome: d.pessoas?.nome || null,
      prazo: d.prazo,
      atualizadaEm: d.atualizada_em,
      empreendimentoNome: d.empreendimentos?.nome || null,
    }));

    return json(res, { total: itens.length, itens });
  } catch (err) {
    return serverError(res, err);
  }
}
