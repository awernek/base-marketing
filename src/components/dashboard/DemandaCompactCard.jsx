import { Link } from 'react-router-dom';
import PrioridadeBadge from '../shared/PrioridadeBadge';
import Avatar from '../shared/Avatar';

/**
 * Card compacto de demanda para o grid do Dashboard (prioridade, avatar, título, empreendimento, prazo).
 */
export default function DemandaCompactCard({ demanda }) {
  return (
    <Link
      to="/demandas"
      className="block bg-white rounded-lg p-4 shadow-ds-sm border border-gray-200 hover:shadow-ds-md hover:border-primary-blue transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <PrioridadeBadge prioridade={demanda.prioridade} />
        <Avatar user={demanda.responsavelNome || demanda.responsavel} size="sm" />
      </div>
      <h3 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2 leading-tight">
        {demanda.titulo}
      </h3>
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1 truncate">
          <span aria-hidden="true">🏢</span> {demanda.empreendimentoNome || '—'}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <span aria-hidden="true">📅</span>{' '}
          {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </Link>
  );
}
