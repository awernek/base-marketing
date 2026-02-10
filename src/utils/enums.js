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

export const TipoDemanda = {
  POST: 0,
  CAMPANHA: 1,
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
  [TipoDemanda.POST]: 'Post',
  [TipoDemanda.CAMPANHA]: 'Campanha',
  [TipoDemanda.LANDING]: 'Landing',
  [TipoDemanda.INSTITUCIONAL]: 'Institucional',
  [TipoDemanda.OUTRO]: 'Outro',
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
