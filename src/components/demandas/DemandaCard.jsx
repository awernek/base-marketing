import {
  getStatusEmoji,
  getPrioridadeEmoji,
  getPrioridadeBadgeClass,
  getStatusAutomaticoBadge,
  statusLabels,
  prioridadeLabels,
  tipoLabels,
  impactoLabels,
  StatusDemanda,
} from '../../utils/enums';

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
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{demanda.titulo}</h3>
          {demanda.descricao && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{demanda.descricao}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
            <span>{getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}</span>
            <span>{getStatusEmoji(demanda.status)} {statusLabels[demanda.status] ?? ''}</span>
            {podeAlterarStatus(demanda) && filtro !== 'concluidas' && (
              <select
                value={demanda.status ?? ''}
                onChange={(e) => onAlterarStatus(demanda.id, Number(e.target.value))}
                disabled={atualizandoStatus === demanda.id}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value={StatusDemanda.OK}>OK</option>
                <option value={StatusDemanda.ATENCAO}>Atenção</option>
                <option value={StatusDemanda.RISCO}>Risco</option>
              </select>
            )}
            <span>prazo {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            <span>{demanda.responsavelNome || '—'}</span>
            {demanda.empreendimentoNome && <span className="text-gray-500">· {demanda.empreendimentoNome}</span>}
            {demanda.link && (
              <a href={demanda.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Link</a>
            )}
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {getStatusAutomaticoBadge(demanda.statusAutomatico) && (
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusAutomaticoBadge(demanda.statusAutomatico).className}`}>
                {getStatusAutomaticoBadge(demanda.statusAutomatico).label}
              </span>
            )}
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPrioridadeBadgeClass(demanda.prioridade)}`}>
              {getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}
            </span>
            <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">{tipoLabels[demanda.tipo] || ''}</span>
            <span className="px-2 py-1 rounded-md bg-blue-100 text-xs text-blue-700">{impactoLabels[demanda.impacto] || ''}</span>
            {isCoordenador && filtro !== 'concluidas' && (
              <>
                <button type="button" onClick={() => onEditar(demanda)} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded px-2 py-1">Editar</button>
                <button type="button" onClick={() => onConcluir(demanda)} className="text-xs text-green-600 hover:text-green-800 border border-green-300 rounded px-2 py-1">✓ Concluir</button>
              </>
            )}
            {podeAlterarStatus(demanda) && (
              <button type="button" onClick={() => onComentarios(demanda)} className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1">
                💬 Comentários {demanda.comentariosCount > 0 && <span className="ml-1 font-medium">({demanda.comentariosCount})</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
