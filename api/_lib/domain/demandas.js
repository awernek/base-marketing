/**
 * Regras de domínio e formatação para demandas.
 * Lógica pura, sem dependência de HTTP ou Supabase.
 */

export const ETAPAS = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido'];

/**
 * Status automático por prazo: atrasado, urgente, atencao, normal.
 */
export function statusAutomatico(prazo, concluida) {
  if (concluida || !prazo) return 'normal';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const p = new Date(prazo);
  p.setHours(0, 0, 0, 0);
  const diasRestantes = Math.ceil((p - hoje) / (1000 * 60 * 60 * 24));
  if (diasRestantes < 0) return 'atrasado';
  if (diasRestantes <= 2) return 'urgente';
  if (diasRestantes <= 7) return 'atencao';
  return 'normal';
}

/**
 * Formata uma linha de demanda do banco para o contrato da API.
 */
export function fmt(d, comentariosCount = 0) {
  const etapa = d.etapa && ETAPAS.includes(d.etapa) ? d.etapa : (d.concluida ? 'concluido' : 'a_fazer');
  return {
    id: d.id,
    titulo: d.titulo,
    descricao: d.descricao,
    tipo: d.tipo,
    responsavelId: d.responsavel_id,
    responsavelNome: d.pessoas?.nome || null,
    prazo: d.prazo,
    impacto: d.impacto,
    status: d.status,
    prioridade: d.prioridade,
    etapa,
    ordem: d.ordem,
    link: d.link,
    empreendimentoId: d.empreendimento_id,
    empreendimentoNome: d.empreendimentos?.nome || null,
    concluida: d.concluida,
    criadaEm: d.criada_em,
    atualizadaEm: d.atualizada_em,
    comentariosCount,
    statusAutomatico: statusAutomatico(d.prazo, d.concluida),
  };
}
