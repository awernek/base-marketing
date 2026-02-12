import { PrioridadeDemanda } from '../utils/enums';
import Button from './shared/Button';

const inputBase =
  'min-w-[180px] px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 ' +
  'hover:border-gray-400 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all';

/**
 * Filtros para lista e Kanban de demandas.
 * Empreendimento, Responsável, Prioridade, Prazo (de/até), Limpar.
 * Estilos alinhados ao design system (focus ring primary-blue).
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
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <select
        value={empreendimentoId}
        onChange={(e) => onChange?.('empreendimentoId', e.target.value)}
        className={inputBase}
        title="Empreendimento"
        aria-label="Filtrar por empreendimento"
      >
        <option value="">🏢 Empreendimento</option>
        {empreendimentos.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.nome}
          </option>
        ))}
      </select>

      {showResponsavel && (
        <select
          value={responsavelId}
          onChange={(e) => onChange?.('responsavelId', e.target.value)}
          className={inputBase}
          title="Responsável"
          aria-label="Filtrar por responsável"
        >
          <option value="">👤 Responsável</option>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      )}

      <select
        value={prioridade}
        onChange={(e) => onChange?.('prioridade', e.target.value)}
        className={inputBase}
        title="Prioridade"
        aria-label="Filtrar por prioridade"
      >
        <option value="">🎯 Prioridade</option>
        <option value={PrioridadeDemanda.ALTA}>🔴 Alta</option>
        <option value={PrioridadeDemanda.MEDIA}>🟡 Média</option>
        <option value={PrioridadeDemanda.BAIXA}>🟢 Baixa</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="whitespace-nowrap" aria-hidden="true">📅</span>
        <span className="sr-only">Prazo de</span>
        <input
          type="date"
          value={de}
          onChange={(e) => onChange?.('de', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
          aria-label="Prazo inicial"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="whitespace-nowrap">até</span>
        <input
          type="date"
          value={ate}
          onChange={(e) => onChange?.('ate', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
          aria-label="Prazo final"
        />
      </label>

      {hasFiltro && (
        <Button variant="ghost" onClick={onLimpar} type="button">
          🔄 Limpar
        </Button>
      )}
    </div>
  );
}
