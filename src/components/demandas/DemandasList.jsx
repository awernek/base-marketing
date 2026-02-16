import { PrioridadeDemanda } from '../../utils/enums';
import DemandaCard from './DemandaCard';
import EmptyState from '../shared/EmptyState';

export default function DemandasList({
  demandas,
  isCoordenador,
  filtro,
  atualizandoStatus,
  podeAlterarStatus,
  onAlterarStatus,
  onEditar,
  onConcluir,
  onComentarios,
  onPriorizar,
  onAbrirQuickView,
  emptyActionLabel,
  onEmptyAction,
}) {
  const demandasOrdenadas = [...demandas].sort((a, b) => {
    if (filtro === 'concluidas') {
      const da = a.atualizadaEm || a.criadaEm || '';
      const db = b.atualizadaEm || b.criadaEm || '';
      return new Date(db) - new Date(da);
    }
    const prioridadeOrder = { [PrioridadeDemanda.ALTA]: 0, [PrioridadeDemanda.MEDIA]: 1, [PrioridadeDemanda.BAIXA]: 2 };
    const pa = prioridadeOrder[a.prioridade] ?? 3, pb = prioridadeOrder[b.prioridade] ?? 3;
    if (pa !== pb) return pa - pb;
    const pazoA = a.prazo ? new Date(a.prazo).getTime() : 0;
    const pazoB = b.prazo ? new Date(b.prazo).getTime() : 0;
    return pazoB - pazoA;
  });

  if (demandasOrdenadas.length === 0) {
    const isConcluidas = filtro === 'concluidas';
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-ds-sm overflow-hidden">
        <EmptyState
          icon={isConcluidas ? '✅' : '📋'}
          title={isConcluidas ? 'Nenhuma demanda concluída' : 'Nenhuma demanda nesta lista'}
          description={isConcluidas ? 'As demandas concluídas aparecerão aqui.' : 'Crie uma nova demanda ou ajuste os filtros.'}
          actionLabel={isConcluidas ? undefined : emptyActionLabel}
          onAction={isConcluidas ? undefined : onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {demandasOrdenadas.map(demanda => (
        <DemandaCard
          key={demanda.id}
          demanda={demanda}
          isCoordenador={isCoordenador}
          filtro={filtro}
          atualizandoStatus={atualizandoStatus}
          podeAlterarStatus={podeAlterarStatus}
          onAlterarStatus={onAlterarStatus}
          onEditar={onEditar}
          onConcluir={onConcluir}
          onComentarios={onComentarios}
          onPriorizar={onPriorizar}
          onAbrirQuickView={onAbrirQuickView}
        />
      ))}
    </div>
  );
}
