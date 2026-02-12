import { Link } from 'react-router-dom';

/**
 * Card compacto de prazo: dias restantes, título, responsável, empreendimento.
 * Urgente (≤2 dias): fundo e borda vermelhos.
 */
export default function PrazoCard({ demanda }) {
  const prazoDate = new Date(demanda.prazo);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  prazoDate.setHours(0, 0, 0, 0);
  const diasRestantes = Math.ceil((prazoDate - hoje) / (1000 * 60 * 60 * 24));
  const urgente = diasRestantes <= 2;

  return (
    <Link
      to="/demandas"
      className={`
        flex items-center gap-3 p-3 rounded-lg border-l-4
        ${urgente ? 'bg-red-50 border-red-500 hover:bg-red-100' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}
        transition-colors
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0
          ${urgente ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}
        `}
      >
        {diasRestantes}d
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">{demanda.titulo}</h4>
        <p className="text-xs text-gray-600 truncate">
          {demanda.responsavelNome || '—'} • {demanda.empreendimentoNome || '—'}
        </p>
      </div>
      <span className="text-gray-400 shrink-0" aria-hidden="true">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
