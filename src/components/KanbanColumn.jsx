import { useDroppable, useDraggable } from '@dnd-kit/core';
import PrioridadeBadge from './shared/PrioridadeBadge';
import Avatar from './shared/Avatar';
import EmptyState from './shared/EmptyState';
import { tipoLabels, etapaLabels } from '../utils/enums';

const ETAPA_TITULOS = etapaLabels;

const ETAPA_HEADER_CLASS = {
  aguardando_priorizacao: { bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-200 text-amber-800' },
  a_fazer: { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-700' },
  em_andamento: { bg: 'bg-primary-blue-light', text: 'text-primary-blue', badge: 'bg-primary-blue/20 text-primary-blue' },
  em_revisao: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-200 text-purple-700' },
  concluido: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-200 text-green-700' },
};

const TIPO_BADGE_CLASS = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-purple-100 text-purple-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-gray-100 text-gray-700',
  4: 'bg-gray-100 text-gray-600',
};

/**
 * Card de demanda no Kanban: grip, prioridade, avatar, título, tipo, footer, comentários.
 * Pode ser usado dentro de useDraggable (no column) ou estático (no DragOverlay).
 * isDisponivel + onPegar: designer vê card "disponível" (A Fazer sem responsável) com botão Pegar.
 */
export function KanbanCard({ demanda, onAbrirComentarios, isDragging, isOverlay, isCoordenador, onAtribuirResponsavel, isDisponivel, onPegar }) {
  const tipoClass = TIPO_BADGE_CLASS[demanda.tipo] ?? TIPO_BADGE_CLASS[4];
  const tipoLabel = tipoLabels[demanda.tipo] ?? 'Outro';

  const cardClass = `
    bg-white rounded-lg p-4 shadow-ds-sm border-2 border-gray-200
    transition-all duration-200
    ${isOverlay ? 'rotate-3 scale-105 shadow-ds-xl cursor-grabbing' : ''}
    ${!isOverlay && isDragging ? 'opacity-50 scale-95' : ''}
    ${!isOverlay && !isDragging && !isDisponivel ? 'hover:shadow-ds-md hover:border-primary-blue cursor-grab active:cursor-grabbing' : ''}
    ${!isOverlay && !isDragging && isDisponivel ? 'hover:shadow-ds-md hover:border-primary-blue' : ''}
  `.trim();

  return (
    <div className={cardClass} data-demanda-id={demanda.id}>
      {/* Grip handle */}
      <div className="flex items-center justify-center mb-2 -mt-1" aria-hidden="true">
        <div className="w-8 h-1 bg-gray-300 rounded-full" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <PrioridadeBadge prioridade={demanda.prioridade} />
        <Avatar user={demanda.responsavelNome || demanda.responsavel} size="sm" />
      </div>

      <h4 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2 leading-snug">
        {demanda.titulo}
      </h4>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${tipoClass}`}>
          {tipoLabel}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1 truncate">
          <span aria-hidden="true">🏢</span> {demanda.empreendimentoNome || '—'}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <span aria-hidden="true">📅</span>{' '}
          {demanda.prazo
            ? new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            : '—'}
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
        {demanda.comentariosCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAbrirComentarios?.(demanda);
            }}
            className="text-xs text-gray-500 hover:text-primary-blue flex items-center gap-1"
          >
            <span aria-hidden="true">💬</span> {demanda.comentariosCount}{' '}
            {demanda.comentariosCount === 1 ? 'comentário' : 'comentários'}
          </button>
        )}
        {isDisponivel && onPegar && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPegar(demanda);
            }}
            className="text-xs font-medium text-primary-blue hover:text-primary-blue-dark bg-primary-blue/10 hover:bg-primary-blue/20 px-2 py-1 rounded"
          >
            Pegar
          </button>
        )}
        {isCoordenador && onAtribuirResponsavel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAtribuirResponsavel(demanda);
            }}
            className="text-xs text-gray-500 hover:text-primary-blue"
          >
            Atribuir
          </button>
        )}
      </div>
    </div>
  );
}

/** Wrapper que torna o card arrastável (useDraggable). Designer: só arrastável quando é minha demanda. */
function KanbanCardDraggable({ demanda, onAbrirComentarios, isDragging, isCoordenador, onAtribuirResponsavel, isDisponivel, onPegar }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: String(demanda.id),
    data: { demanda, etapaAtual: demanda.etapa },
  });

  return (
    <div ref={setNodeRef} {...(isDisponivel ? {} : { ...listeners, ...attributes })}>
      <KanbanCard
        demanda={demanda}
        onAbrirComentarios={onAbrirComentarios}
        isDragging={isDragging}
        isOverlay={false}
        isCoordenador={isCoordenador}
        onAtribuirResponsavel={onAtribuirResponsavel}
        isDisponivel={isDisponivel}
        onPegar={onPegar}
      />
    </div>
  );
}

export default function KanbanColumn({ etapa, demandas, onAbrirComentarios, activeId, fullWidth, isCoordenador, pessoasLista, onAtribuirResponsavel, isDesigner, userPessoaId, onPegarDemanda }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const titulo = ETAPA_TITULOS[etapa] ?? etapa;
  const headerClass = ETAPA_HEADER_CLASS[etapa] ?? ETAPA_HEADER_CLASS.a_fazer;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-xl shadow-ds-sm border-2 transition-colors
        ${fullWidth ? 'w-full min-w-0 flex-1' : 'flex-1 min-w-64'}
        ${isOver ? 'border-primary-blue bg-primary-blue-light/50' : 'border-gray-200 bg-gray-50'}
      `}
      data-column-etapa={etapa}
    >
      <div
        className={`${headerClass.bg} rounded-t-xl px-4 py-3 flex items-center justify-between shrink-0`}
      >
        <h3 className={`font-semibold text-sm ${headerClass.text}`}>{titulo}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${headerClass.badge}`}
        >
          {demandas.length}
        </span>
      </div>

      <div className="p-3 flex-1 min-h-[600px] overflow-y-auto space-y-3">
        {demandas.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Nenhuma demanda"
            description="Arraste demandas para esta coluna ou crie uma nova."
          />
        ) : (
          demandas.map((demanda) => {
            const isDisponivel = isDesigner && etapa === 'a_fazer' && (demanda.responsavelId == null || demanda.responsavelId === '');
            return (
              <KanbanCardDraggable
                key={demanda.id}
                demanda={demanda}
                onAbrirComentarios={onAbrirComentarios}
                isDragging={activeId === String(demanda.id)}
                isCoordenador={isCoordenador}
                onAtribuirResponsavel={onAtribuirResponsavel}
                isDisponivel={isDisponivel}
                onPegar={onPegarDemanda}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
