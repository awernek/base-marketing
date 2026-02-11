import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { demandasApi } from '../services/api';

const ETAPAS_ORDEM = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido'];

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const byEtapa = groupByEtapa(demandas);

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
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {ETAPAS_ORDEM.map(etapa => (
          <KanbanColumn
            key={etapa}
            etapa={etapa}
            demandas={byEtapa[etapa] || []}
            onAbrirComentarios={onAbrirComentarios}
            activeId={activeId}
          />
        ))}
      </div>
    </DndContext>
  );
}
