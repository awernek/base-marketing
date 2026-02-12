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
  emptyActionLabel,
  onEmptyAction,
}) {
  const demandasOrdenadas = [...demandas].sort((a, b) => {
    const prioridadeOrder = { [PrioridadeDemanda.ALTA]: 0, [PrioridadeDemanda.MEDIA]: 1, [PrioridadeDemanda.BAIXA]: 2 };
    const pa = prioridadeOrder[a.prioridade] ?? 3, pb = prioridadeOrder[b.prioridade] ?? 3;
    if (pa !== pb) return pa - pb;
    return new Date(a.prazo) - new Date(b.prazo);
  });

  if (demandasOrdenadas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-ds-sm overflow-hidden">
        <EmptyState
          icon="📋"
          title="Nenhuma demanda nesta lista"
          description="Crie uma nova demanda ou ajuste os filtros."
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
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
        />
      ))}
    </div>
  );
}
