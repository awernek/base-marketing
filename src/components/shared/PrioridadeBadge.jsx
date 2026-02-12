import { PrioridadeDemanda, prioridadeLabels } from '../../utils/enums';

/**
 * Badge de prioridade (Alta/Média/Baixa) com emoji e cores do design system.
 * Aceita prioridade como número (PrioridadeDemanda) ou string ('alta'|'media'|'baixa').
 */
export default function PrioridadeBadge({ prioridade, className = '' }) {
  const key = normalizePrioridade(prioridade);
  const configs = {
    alta: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      emoji: '🔴',
      label: 'Alta',
    },
    media: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      emoji: '🟡',
      label: 'Média',
    },
    baixa: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      emoji: '🟢',
      label: 'Baixa',
    },
  };

  const config = configs[key] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    emoji: '⚪',
    label: prioridadeLabels[prioridade] ?? '—',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
        border ${config.bg} ${config.text} ${config.border}
        ${className}
      `.trim()}
    >
      <span aria-hidden="true">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

function normalizePrioridade(prioridade) {
  if (typeof prioridade === 'string') {
    const p = prioridade.toLowerCase();
    if (p === 'alta') return 'alta';
    if (p === 'media' || p === 'média') return 'media';
    if (p === 'baixa') return 'baixa';
    return null;
  }
  if (prioridade === PrioridadeDemanda.ALTA || prioridade === 0) return 'alta';
  if (prioridade === PrioridadeDemanda.MEDIA || prioridade === 1) return 'media';
  if (prioridade === PrioridadeDemanda.BAIXA || prioridade === 2) return 'baixa';
  return null;
}
