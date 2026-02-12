import PrioridadeBadge from '../shared/PrioridadeBadge';
import Avatar from '../shared/Avatar';
import {
  getStatusEmoji,
  getStatusAutomaticoBadge,
  statusLabels,
  tipoLabels,
  impactoLabels,
  StatusDemanda,
} from '../../utils/enums';

/**
 * Card de demanda para a lista (DemandasList).
 * Layout do design system: header (PrioridadeBadge + Avatar), título, footer (empreendimento, prazo, comentários), ações.
 */
export default function DemandaCard({
  demanda,
  isCoordenador,
  filtro,
  atualizandoStatus,
  podeAlterarStatus,
  onAlterarStatus,
  onEditar,
  onConcluir,
  onComentarios,
  onPriorizar,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-ds-sm hover:shadow-ds-md hover:border-primary-blue transition-all duration-200">
      {/* Header: prioridade + avatar */}
      <div className="flex items-center justify-between mb-3">
        <PrioridadeBadge prioridade={demanda.prioridade} />
        <Avatar user={demanda.responsavelNome || demanda.responsavel} size="sm" />
      </div>

      {/* Título */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{demanda.titulo}</h3>
      {demanda.descricao && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{demanda.descricao}</p>
      )}

      {/* Footer: empreendimento, prazo, comentários */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1 truncate">
          <span aria-hidden="true">🏢</span> {demanda.empreendimentoNome || '—'}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <span aria-hidden="true">📅</span>{' '}
          {demanda.prazo
            ? new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            : '—'}
        </span>
        <button
          type="button"
          onClick={() => onComentarios?.(demanda)}
          className="flex items-center gap-1 text-gray-500 hover:text-primary-blue"
        >
          <span aria-hidden="true">💬</span> {demanda.comentariosCount ?? 0}
        </button>
      </div>

      {/* Ações e metadados */}
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          {getStatusAutomaticoBadge(demanda.statusAutomatico) && (
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusAutomaticoBadge(demanda.statusAutomatico).className}`}
            >
              {getStatusAutomaticoBadge(demanda.statusAutomatico).label}
            </span>
          )}
          <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
            {getStatusEmoji(demanda.status)} {statusLabels[demanda.status] ?? ''}
          </span>
          <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
            {tipoLabels[demanda.tipo] || ''}
          </span>
          <span className="px-2 py-1 rounded-md bg-primary-blue-light text-xs text-primary-blue">
            {impactoLabels[demanda.impacto] || ''}
          </span>
          {demanda.link && (
            <a
              href={demanda.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-blue hover:underline"
            >
              Link
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {podeAlterarStatus(demanda) && filtro !== 'concluidas' && (
            <select
              value={demanda.status ?? ''}
              onChange={(e) => onAlterarStatus(demanda.id, Number(e.target.value))}
              disabled={atualizandoStatus === demanda.id}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
              title="Alterar status"
            >
              <option value={StatusDemanda.OK}>OK</option>
              <option value={StatusDemanda.ATENCAO}>Atenção</option>
              <option value={StatusDemanda.RISCO}>Risco</option>
            </select>
          )}
          {isCoordenador && filtro === 'aguardando' && onPriorizar && (
            <button
              type="button"
              onClick={() => onPriorizar(demanda)}
              className="text-xs font-medium text-amber-700 hover:text-amber-800 border border-amber-300 rounded-lg px-2 py-1.5 hover:bg-amber-50"
            >
              Priorizar
            </button>
          )}
          {onEditar && filtro !== 'aguardando' && (isCoordenador || podeAlterarStatus(demanda)) && (
            <button
              type="button"
              onClick={() => onEditar(demanda)}
              className="text-xs font-medium text-primary-blue hover:text-primary-blue-dark border border-gray-300 rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              Editar
            </button>
          )}
          {isCoordenador && filtro !== 'concluidas' && filtro !== 'aguardando' && onConcluir && (
            <button
              type="button"
              onClick={() => onConcluir(demanda)}
              className="text-xs font-medium text-green-600 hover:text-green-800 border border-green-300 rounded-lg px-2 py-1.5 hover:bg-green-50"
            >
              ✓ Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
