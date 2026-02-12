import Button from './Button';
import {
  prioridadeLabels,
  tipoLabels,
  impactoLabels,
  TipoDemanda,
  ImpactoNegocio,
  PrioridadeDemanda,
} from '../../utils/enums';

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ' +
  'focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-colors ' +
  'disabled:opacity-50 disabled:bg-gray-50';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function DemandaForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = 'Salvar',
  pessoasLista = [],
  empreendimentosLista = [],
  error = null,
  onDismissError,
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }} className="space-y-4">
      {error && (
        <div
          id="demanda-form-error"
          className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200"
          role="alert"
        >
          <span className="text-red-600 shrink-0" aria-hidden="true">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">Erro ao salvar</p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
            {onDismissError && (
              <button
                type="button"
                onClick={onDismissError}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="demanda-titulo">O que é?</label>
        <input
          id="demanda-titulo"
          type="text"
          required
          value={value.titulo ?? ''}
          onChange={(e) => set('titulo', e.target.value)}
          className={inputClass}
          placeholder="Título"
          aria-invalid={!!error}
          aria-describedby={error ? 'demanda-form-error' : undefined}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-descricao">Briefing / descrição (opcional)</label>
        <textarea
          id="demanda-descricao"
          value={value.descricao ?? ''}
          onChange={(e) => set('descricao', e.target.value)}
          className={`${inputClass} min-h-[80px]`}
          placeholder="Contexto, referências, instruções..."
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-prioridade">Prioridade</label>
        <select
          id="demanda-prioridade"
          value={value.prioridade ?? PrioridadeDemanda.MEDIA}
          onChange={(e) => set('prioridade', Number(e.target.value))}
          className={inputClass}
        >
          {Object.entries(prioridadeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-tipo">Tipo</label>
        <select
          id="demanda-tipo"
          value={value.tipo ?? TipoDemanda.POST}
          onChange={(e) => set('tipo', Number(e.target.value))}
          className={inputClass}
        >
          {Object.entries(tipoLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-responsavel">Responsável</label>
        <select
          id="demanda-responsavel"
          required
          value={value.responsavelId ?? ''}
          onChange={(e) => set('responsavelId', e.target.value)}
          className={inputClass}
        >
          <option value="">Selecione...</option>
          {pessoasLista.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} — carga {p.cargaAtual || '—'}, {p.demandasAtivas ?? 0} demanda(s)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-link">Link (opcional)</label>
        <input
          id="demanda-link"
          type="url"
          value={value.link ?? ''}
          onChange={(e) => set('link', e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-empreendimento">Empreendimento (opcional)</label>
        <select
          id="demanda-empreendimento"
          value={value.empreendimentoId ?? ''}
          onChange={(e) => set('empreendimentoId', e.target.value)}
          className={inputClass}
        >
          <option value="">Nenhum</option>
          {empreendimentosLista.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="demanda-prazo">Prazo</label>
        <input
          id="demanda-prazo"
          type="date"
          required
          value={value.prazo ?? ''}
          onChange={(e) => set('prazo', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <span className={labelClass}>Impacto</span>
        <div className="flex flex-wrap gap-4 pt-1">
          {[ImpactoNegocio.VENDA, ImpactoNegocio.LEAD, ImpactoNegocio.INSTITUCIONAL].map((i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="impacto"
                value={i}
                checked={(value.impacto ?? ImpactoNegocio.LEAD) === i}
                onChange={() => set('impacto', i)}
                className="border-gray-300 text-primary-blue focus:ring-primary-blue"
              />
              <span className="text-sm text-gray-700">{impactoLabels[i]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          loading={submitting}
          loadingLabel="Salvando..."
          className="flex-1"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
