import { supabase } from '../../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../../_lib/auth.js';
import {
  cors, json, unauthorized, forbidden, serverError, allowMethods,
} from '../../../_lib/response.js';

// GET /api/dashboard/overview — só coordenador
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  try {
    // Total pessoas ativas
    const { count: totalPessoasAtivas } = await supabase
      .from('pessoas')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Total demandas ativas
    const { count: totalDemandasAtivas } = await supabase
      .from('demandas')
      .select('*', { count: 'exact', head: true })
      .eq('concluida', false);

    // Pessoas com carga alta (semana atual)
    const { count: pessoasComCargaAlta } = await supabase
      .from('vw_carga_semana')
      .select('*', { count: 'exact', head: true })
      .eq('carga', 2); // Alta

    // Demandas em risco
    const { count: demandasEmRisco } = await supabase
      .from('demandas')
      .select('*', { count: 'exact', head: true })
      .eq('concluida', false)
      .eq('status', 2); // Risco

    // Check-ins pendentes: pessoas ativas que NÃO fizeram check-in na semana
    const { data: pessoasAtivas } = await supabase
      .from('pessoas')
      .select('id')
      .eq('ativo', true);

    const { data: checkinsFeitos } = await supabase
      .from('vw_carga_semana')
      .select('pessoa_id');

    const idsComCheckin = new Set((checkinsFeitos || []).map(c => c.pessoa_id));
    const checkInsPendentes = (pessoasAtivas || []).filter(p => !idsComCheckin.has(p.id)).length;

    return json(res, {
      totalPessoasAtivas: totalPessoasAtivas || 0,
      totalDemandasAtivas: totalDemandasAtivas || 0,
      pessoasComCargaAlta: pessoasComCargaAlta || 0,
      demandasEmRisco: demandasEmRisco || 0,
      checkInsPendentes,
    });
  } catch (err) {
    return serverError(res, err);
  }
}
