import {
  prioridadeLabels,
  tipoLabels,
  impactoLabels,
  TipoDemanda,
  ImpactoNegocio,
  PrioridadeDemanda,
} from '../../utils/enums';

export default function DemandaForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = 'Salvar',
  pessoasLista = [],
  empreendimentosLista = [],
}) {
  const set = (field, val) => {
    if (typeof onChange === 'function') {
      if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
        onChange({ ...value, ...val });
      } else {
        onChange({ ...value, [field]: val });
      }
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit?.(e); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">O que é?</label>
        <input
          type="text"
          required
          value={value.titulo ?? ''}
          onChange={e => set('titulo', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Título"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Briefing / descrição (opcional)</label>
        <textarea
          value={value.descricao ?? ''}
          onChange={e => set('descricao', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
          placeholder="Contexto, referências, instruções..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
        <select
          value={value.prioridade ?? PrioridadeDemanda.MEDIA}
          onChange={e => set('prioridade', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          {Object.entries(prioridadeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          value={value.tipo ?? TipoDemanda.POST}
          onChange={e => set('tipo', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          {Object.entries(tipoLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
        <select
          required
          value={value.responsavelId ?? ''}
          onChange={e => set('responsavelId', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Selecione...</option>
          {pessoasLista.map(p => (
            <option key={p.id} value={p.id}>
              {p.nome} — carga {p.cargaAtual || '—'}, {p.demandasAtivas ?? 0} demanda(s)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
        <input
          type="url"
          value={value.link ?? ''}
          onChange={e => set('link', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Empreendimento (opcional)</label>
        <select
          value={value.empreendimentoId ?? ''}
          onChange={e => set('empreendimentoId', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Nenhum</option>
          {empreendimentosLista.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
        <input
          type="date"
          required
          value={value.prazo ?? ''}
          onChange={e => set('prazo', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Impacto</label>
        <div className="flex gap-4">
          {[ImpactoNegocio.VENDA, ImpactoNegocio.LEAD, ImpactoNegocio.INSTITUCIONAL].map(i => (
            <label key={i} className="flex items-center">
              <input
                type="radio"
                name="impacto"
                value={i}
                checked={(value.impacto ?? ImpactoNegocio.LEAD) === i}
                onChange={() => set('impacto', i)}
                className="mr-1"
              />
              <span className="text-sm">{impactoLabels[i]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
