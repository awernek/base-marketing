import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import { json, badRequest, forbidden, serverError } from '../response.js';

// GET /api/relatorios/demandas-concluidas
export async function demandasConcluidas(req, res, params, user) {
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);
  const { de, ate, empreendimentoId, responsavelId } = req.query;
  if (!de || !ate) return badRequest(res, 'Parâmetros de e ate são obrigatórios.');

  let query = supabase.from('demandas')
    .select('*, pessoas!demandas_responsavel_id_fkey(nome), empreendimentos(nome)')
    .eq('concluida', true).gte('atualizada_em', de).lte('atualizada_em', ate)
    .order('atualizada_em', { ascending: false });

  if (empreendimentoId) query = query.eq('empreendimento_id', parseInt(empreendimentoId, 10));
  if (responsavelId) query = query.eq('responsavel_id', parseInt(responsavelId, 10));

  const { data, error } = await query;
  if (error) return serverError(res, error);
  return json(res, (data || []).map(d => ({
    id: d.id, titulo: d.titulo, tipo: d.tipo, responsavelNome: d.pessoas?.nome || null,
    empreendimentoNome: d.empreendimentos?.nome || null, prazo: d.prazo,
    concluidaEm: d.atualizada_em,
  })));
}
