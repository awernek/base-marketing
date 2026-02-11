import { PrioridadeDemanda } from '../utils/enums';

/**
 * Filtros avançados para lista e Kanban de demandas (Sprint 4).
 * Empreendimento, Responsável, Prioridade, Prazo (de/até), Limpar.
 */
export default function Filtros({
  empreendimentos = [],
  pessoas = [],
  values = {},
  onChange,
  onLimpar,
  showResponsavel = true,
  className = '',
}) {
  const { empreendimentoId = '', responsavelId = '', prioridade = '', de = '', ate = '' } = values;
  const hasFiltro = empreendimentoId || responsavelId || prioridade !== '' || de || ate;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <select
        value={empreendimentoId}
        onChange={e => onChange?.('empreendimentoId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
        title="Empreendimento"
      >
        <option value="">Todos os empreendimentos</option>
        {empreendimentos.map(emp => (
          <option key={emp.id} value={emp.id}>{emp.nome}</option>
        ))}
      </select>

      {showResponsavel && (
        <select
          value={responsavelId}
          onChange={e => onChange?.('responsavelId', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
          title="Responsável"
        >
          <option value="">Todos os responsáveis</option>
          {pessoas.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      )}

      <select
        value={prioridade}
        onChange={e => onChange?.('prioridade', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[120px]"
        title="Prioridade"
      >
        <option value="">Todas as prioridades</option>
        <option value={PrioridadeDemanda.ALTA}>🔴 Alta</option>
        <option value={PrioridadeDemanda.MEDIA}>🟡 Média</option>
        <option value={PrioridadeDemanda.BAIXA}>🟢 Baixa</option>
      </select>

      <label className="flex items-center gap-1 text-sm text-gray-600">
        <span className="whitespace-nowrap">Prazo de</span>
        <input
          type="date"
          value={de}
          onChange={e => onChange?.('de', e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex items-center gap-1 text-sm text-gray-600">
        <span className="whitespace-nowrap">até</span>
        <input
          type="date"
          value={ate}
          onChange={e => onChange?.('ate', e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
        />
      </label>

      {hasFiltro && (
        <button
          type="button"
          onClick={onLimpar}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
