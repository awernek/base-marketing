// ─── Enums numéricos conforme contrato da API ──────────

export const TipoUsuario = {
  COORDENADOR: 0,
  DESIGNER: 1,
};

export const CargaSemanal = {
  BAIXA: 0,
  MEDIA: 1,
  ALTA: 2,
};

/** Tipos de demanda (valores 0–4). Labels: Nova Peça, Alteração, Campanha, Ajuste Interno, Ideia. */
export const TipoDemanda = {
  NOVA_PECA: 0,
  ALTERACAO: 1,
  CAMPANHA: 2,
  AJUSTE_INTERNO: 3,
  IDEIA: 4,
  // Aliases para compatibilidade
  POST: 0,
  LANDING: 2,
  INSTITUCIONAL: 3,
  OUTRO: 4,
};

export const ImpactoNegocio = {
  VENDA: 0,
  LEAD: 1,
  INSTITUCIONAL: 2,
};

export const StatusDemanda = {
  OK: 0,
  ATENCAO: 1,
  RISCO: 2,
};

export const PrioridadeDemanda = {
  ALTA: 0,
  MEDIA: 1,
  BAIXA: 2,
};

// ─── Labels para exibição ───────────────────────────────

export const cargaLabels = {
  [CargaSemanal.BAIXA]: 'Baixa',
  [CargaSemanal.MEDIA]: 'Média',
  [CargaSemanal.ALTA]: 'Alta',
};

export const tipoLabels = {
  [TipoDemanda.NOVA_PECA]: 'Nova Peça',
  [TipoDemanda.ALTERACAO]: 'Alteração',
  [TipoDemanda.CAMPANHA]: 'Campanha',
  [TipoDemanda.AJUSTE_INTERNO]: 'Ajuste Interno',
  [TipoDemanda.IDEIA]: 'Ideia',
};

export const impactoLabels = {
  [ImpactoNegocio.VENDA]: 'Venda',
  [ImpactoNegocio.LEAD]: 'Lead',
  [ImpactoNegocio.INSTITUCIONAL]: 'Institucional',
};

export const statusLabels = {
  [StatusDemanda.OK]: 'OK',
  [StatusDemanda.ATENCAO]: 'Atenção',
  [StatusDemanda.RISCO]: 'Risco',
};

export const prioridadeLabels = {
  [PrioridadeDemanda.ALTA]: 'Alta',
  [PrioridadeDemanda.MEDIA]: 'Média',
  [PrioridadeDemanda.BAIXA]: 'Baixa',
};

/** Ordem das etapas no Kanban (coordenador vê aguardando; designer não). */
export const ETAPAS_KANBAN = ['aguardando_priorizacao', 'a_fazer', 'em_andamento', 'em_revisao', 'concluido'];

/** Etapas do fluxo de execução (sem aguardando) — visão designer. */
export const ETAPAS_EXECUCAO = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido'];

export const etapaLabels = {
  aguardando_priorizacao: 'Aguardando Priorização',
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento',
  em_revisao: 'Revisão',
  concluido: 'Concluído',
};

// ─── Helpers de emoji/cor ───────────────────────────────

export function getCargaEmoji(carga) {
  switch (carga) {
    case CargaSemanal.BAIXA: return '🟢';
    case CargaSemanal.MEDIA: return '🟡';
    case CargaSemanal.ALTA: return '🔴';
    default: return '⚪';
  }
}

export function getCargaFromString(str) {
  switch ((str || '').toLowerCase()) {
    case 'baixa': return CargaSemanal.BAIXA;
    case 'media':
    case 'média': return CargaSemanal.MEDIA;
    case 'alta': return CargaSemanal.ALTA;
    default: return null;
  }
}

export function getCargaColor(carga) {
  switch (carga) {
    case CargaSemanal.BAIXA: return 'text-green-600';
    case CargaSemanal.MEDIA: return 'text-yellow-600';
    case CargaSemanal.ALTA: return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function getStatusEmoji(status) {
  switch (status) {
    case StatusDemanda.OK: return '🟢';
    case StatusDemanda.ATENCAO: return '🟡';
    case StatusDemanda.RISCO: return '🔴';
    default: return '⚪';
  }
}

export function getStatusColor(status) {
  switch (status) {
    case StatusDemanda.OK: return 'text-green-600';
    case StatusDemanda.ATENCAO: return 'text-yellow-600';
    case StatusDemanda.RISCO: return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function getCargaEmojiFromString(cargaStr) {
  switch ((cargaStr || '').toLowerCase()) {
    case 'baixa': return '🟢';
    case 'media':
    case 'média': return '🟡';
    case 'alta': return '🔴';
    default: return '⚪';
  }
}

export function getPrioridadeEmoji(prioridade) {
  switch (prioridade) {
    case PrioridadeDemanda.ALTA: return '🔴';
    case PrioridadeDemanda.MEDIA: return '🟡';
    case PrioridadeDemanda.BAIXA: return '🟢';
    default: return '⚪';
  }
}

/** Classes Tailwind para badge de prioridade (Alta=vermelho, Média=amarelo, Baixa=verde) */
export function getPrioridadeBadgeClass(prioridade) {
  switch (prioridade) {
    case PrioridadeDemanda.ALTA: return 'bg-red-100 text-red-800 border border-red-300';
    case PrioridadeDemanda.MEDIA: return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case PrioridadeDemanda.BAIXA: return 'bg-green-100 text-green-800 border border-green-300';
    default: return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
}

/** Badge de status automático por prazo (Sprint 4): atrasado, urgente, atencao, normal */
export function getStatusAutomaticoBadge(statusAutomatico) {
  switch (statusAutomatico) {
    case 'atrasado': return { label: '⚠️ Atrasado', className: 'bg-red-600 text-white' };
    case 'urgente': return { label: '🔥 Urgente', className: 'bg-orange-600 text-white' };
    case 'atencao': return { label: '⏱ Atenção', className: 'bg-amber-500 text-white' };
    default: return null;
  }
}
