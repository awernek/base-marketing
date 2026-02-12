import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import { json, forbidden, serverError } from '../response.js';

// GET /api/dashboard/overview
export async function overview(req, res, params, user) {
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  const [
    { count: totalPessoas },
    { count: totalEmpreendimentos },
    { count: demandasAtivas },
    { count: demandasConcluidas },
    { count: demandasAguardandoPriorizacao },
  ] = await Promise.all([
    supabase.from('pessoas').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('empreendimentos').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('demandas').select('*', { count: 'exact', head: true }).eq('concluida', false),
    supabase.from('demandas').select('*', { count: 'exact', head: true }).eq('concluida', true),
    supabase.from('demandas').select('*', { count: 'exact', head: true }).eq('etapa', 'aguardando_priorizacao'),
  ]);

  const agora = new Date();
  const em7dias = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { count: proximosPrazos } = await supabase.from('demandas')
    .select('*', { count: 'exact', head: true })
    .eq('concluida', false).lte('prazo', em7dias.toISOString());

  const { count: emRisco } = await supabase.from('demandas')
    .select('*', { count: 'exact', head: true })
    .eq('concluida', false).eq('status', 2);

  const { data: cargas } = await supabase.from('vw_carga_semana').select('*');

  return json(res, {
    totalPessoas: totalPessoas || 0,
    totalEmpreendimentos: totalEmpreendimentos || 0,
    demandasAtivas: demandasAtivas || 0,
    demandasConcluidas: demandasConcluidas || 0,
    demandasAguardandoPriorizacao: demandasAguardandoPriorizacao || 0,
    proximosPrazos: proximosPrazos || 0,
    emRisco: emRisco || 0,
    cargaEquipe: cargas || [],
  });
}
