import { useDroppable, useDraggable } from '@dnd-kit/core';
import { getPrioridadeEmoji, getPrioridadeBadgeClass, getStatusAutomaticoBadge, prioridadeLabels } from '../utils/enums';

const ETAPA_TITULOS = {
  a_fazer: 'Backlog',
  em_andamento: 'Em Andamento',
  em_revisao: 'Revisão',
  concluido: 'Concluído',
};

function DemandaCardKanban({ demanda, onAbrirComentarios, isDragging }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: String(demanda.id),
    data: { demanda, etapaAtual: demanda.etapa },
  });
  const prazo = demanda.prazo ? new Date(demanda.prazo) : null;
  const hoje = new Date();
  const atrasado = prazo && prazo < hoje && demanda.etapa !== 'concluido';
  const proximo = prazo && !atrasado && (prazo - hoje) / (24 * 60 * 60 * 1000) <= 2;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-lg border bg-white p-3 shadow-sm transition-shadow ${isDragging ? 'opacity-50 shadow-md' : 'hover:shadow'} cursor-grab active:cursor-grabbing`}
      data-demanda-id={demanda.id}
    >
      <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{demanda.titulo}</p>
      {getStatusAutomaticoBadge(demanda.statusAutomatico) && (
        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mb-1.5 ${getStatusAutomaticoBadge(demanda.statusAutomatico).className}`}>
          {getStatusAutomaticoBadge(demanda.statusAutomatico).label}
        </span>
      )}
      <div className="flex flex-wrap gap-1.5 items-center text-xs">
        {demanda.empreendimentoNome && (
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{demanda.empreendimentoNome}</span>
        )}
        <span className={`px-1.5 py-0.5 rounded font-medium ${getPrioridadeBadgeClass(demanda.prioridade)}`}>
          {getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}
        </span>
        <span className="text-gray-500" title={prazo?.toLocaleDateString('pt-BR')}>
          {prazo ? prazo.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}
          {atrasado && <span className="text-red-600 ml-0.5">(atrasado)</span>}
          {proximo && !atrasado && <span className="text-amber-600 ml-0.5">(próximo)</span>}
        </span>
        <span className="text-gray-500 truncate max-w-[80px]" title={demanda.responsavelNome}>{demanda.responsavelNome || '—'}</span>
        {demanda.comentariosCount > 0 && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onAbrirComentarios?.(demanda); }}
            className="text-blue-600 hover:underline"
            title="Comentários"
          >
            💬 {demanda.comentariosCount}
          </button>
        )}
      </div>
    </div>
  );
}

export default function KanbanColumn({ etapa, demandas, onAbrirComentarios, activeId }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const titulo = ETAPA_TITULOS[etapa] ?? etapa;

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[280px] rounded-lg border-2 bg-gray-50/80 flex flex-col transition-colors ${isOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200'}`}
      data-column-etapa={etapa}
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">{titulo}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">{demandas.length}</span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto min-h-[120px] space-y-2">
        {demandas.map(demanda => (
          <DemandaCardKanban
            key={demanda.id}
            demanda={demanda}
            onAbrirComentarios={onAbrirComentarios}
            isDragging={activeId === String(demanda.id)}
          />
        ))}
      </div>
    </div>
  );
}

export { DemandaCardKanban };
