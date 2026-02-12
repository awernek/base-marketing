import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { KanbanCard } from './KanbanColumn';
import { demandasApi } from '../services/api';
import { useIsMobile } from '../hooks/useMediaQuery';

const ETAPAS_ORDEM = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido'];
const ETAPA_LABELS = {
  a_fazer: 'Backlog',
  em_andamento: 'Em Andamento',
  em_revisao: 'Revisão',
  concluido: 'Concluído',
};

function groupByEtapa(demandas) {
  const map = { a_fazer: [], em_andamento: [], em_revisao: [], concluido: [] };
  (demandas || []).forEach(d => {
    const etapa = d.etapa && map[d.etapa] ? d.etapa : (d.concluida ? 'concluido' : 'a_fazer');
    if (!map[etapa]) map[etapa] = [];
    map[etapa].push({ ...d, etapa });
  });
  return map;
}

export default function KanbanBoard({ demandas, setDemandas, onAbrirComentarios }) {
  const [activeId, setActiveId] = useState(null);
  const [mobileTab, setMobileTab] = useState('a_fazer');
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const byEtapa = groupByEtapa(demandas);
  const activeDemanda = activeId ? demandas.find(d => String(d.id) === String(activeId)) : null;

  function handleDragStart(ev) {
    setActiveId(ev.active.id);
  }

  function handleDragEnd(ev) {
    setActiveId(null);
    const { active, over } = ev;
    if (!over) return;
    const demandaId = Number(active.id);
    const novaEtapa = String(over.id);
    if (!ETAPAS_ORDEM.includes(novaEtapa)) return;
    const demanda = demandas.find(d => d.id === demandaId);
    if (!demanda || demanda.etapa === novaEtapa) return;

    demandasApi
      .atualizarEtapa(demandaId, novaEtapa)
      .then(() => {
        setDemandas(prev =>
          prev.map(d =>
            d.id === demandaId
              ? { ...d, etapa: novaEtapa, concluida: novaEtapa === 'concluido' }
              : d
          )
        );
      })
      .catch(err => {
        alert(err?.message || 'Erro ao mover demanda.');
      });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Mobile: tabs para trocar de coluna */}
        {isMobile && (
          <div className="flex shrink-0 gap-1 p-2 bg-gray-100 rounded-lg mb-3 overflow-x-auto" role="tablist" aria-label="Colunas do Kanban">
            {ETAPAS_ORDEM.map((etapa) => (
              <button
                key={etapa}
                type="button"
                role="tab"
                aria-selected={mobileTab === etapa}
                onClick={() => setMobileTab(etapa)}
                className={`
                  shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${mobileTab === etapa
                    ? 'bg-primary-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'}
                `}
              >
                {ETAPA_LABELS[etapa]} ({byEtapa[etapa]?.length ?? 0})
              </button>
            ))}
          </div>
        )}

        {/* Desktop: todas as colunas ocupam a largura disponível | Mobile: só a coluna ativa */}
        <div className={`flex gap-4 pb-4 min-h-[600px] flex-1 min-w-0 ${isMobile ? '' : 'overflow-y-hidden'}`}>
          {(isMobile ? [mobileTab] : ETAPAS_ORDEM).map((etapa) => (
            <KanbanColumn
              key={etapa}
              etapa={etapa}
              demandas={byEtapa[etapa] || []}
              onAbrirComentarios={onAbrirComentarios}
              activeId={activeId}
              fullWidth={isMobile}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDemanda ? (
          <div className="rotate-3 scale-105">
            <KanbanCard
              demanda={{ ...activeDemanda, etapa: activeDemanda.etapa }}
              onAbrirComentarios={onAbrirComentarios}
              isDragging={false}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
