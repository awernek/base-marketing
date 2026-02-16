import { formatDemandaId } from '../../utils/enums';
import PrioridadeBadge from '../shared/PrioridadeBadge';
import Avatar from '../shared/Avatar';
import Comentarios from '../Comentarios';
import Button from '../shared/Button';

/**
 * Conteúdo do Quick View (drawer): briefing completo, anexos (placeholder), comentários, editar.
 */
export default function DemandaQuickView({ demanda, onClose, onEditar, podeEditar, onComentarioAdicionado }) {
  if (!demanda) return null;

  const prazoFormatado = demanda.prazo
    ? new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-mono text-gray-500">{formatDemandaId(demanda.id)}</span>
          <PrioridadeBadge prioridade={demanda.prioridade} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 leading-snug">{demanda.titulo}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Avatar user={demanda.responsavelNome || demanda.responsavel} size="sm" />
          <span>{demanda.responsavelNome || 'Sem responsável'}</span>
          {prazoFormatado && (
            <>
              <span className="text-gray-400">·</span>
              <span>Entrega: {prazoFormatado}</span>
            </>
          )}
        </div>
        {demanda.empreendimentoNome && (
          <p className="text-sm text-gray-500">
            <span className="font-medium">Empreendimento:</span> {demanda.empreendimentoNome}
          </p>
        )}
      </div>

      <div className="p-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Briefing</h4>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {demanda.descricao || '— Sem descrição —'}
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Anexos</h4>
        <p className="text-sm text-gray-500">Nenhum anexo no momento.</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Comentários</h4>
        <div className="flex-1 min-h-[200px] overflow-hidden">
          <Comentarios demandaId={demanda.id} onComentarioAdicionado={onComentarioAdicionado} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
        {podeEditar && onEditar && (
          <Button variant="primary" onClick={() => { onClose(); onEditar(demanda); }}>
            Editar demanda
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
