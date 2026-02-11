import { Link } from 'react-router-dom';
import { getStatusEmoji } from '../../utils/enums';

/**
 * Seção "Próximos prazos (7 dias)" no dashboard.
 */
export default function ProximosPrazos({ demandas = [], maxItems = 10 }) {
  if (demandas.length === 0) return null;
  const slice = demandas.slice(0, maxItems);
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">📅 Próximos prazos (7 dias)</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <ul className="space-y-2">
          {slice.map(d => (
            <li key={d.id} className="text-sm text-blue-900 flex items-center gap-2 flex-wrap">
              <span>{getStatusEmoji(d.status)}</span>
              <span className="font-medium">{d.titulo}</span>
              <span className="text-blue-700">
                prazo {new Date(d.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
              </span>
              <span>{d.responsavelNome || '—'}</span>
              <Link to="/demandas" className="text-blue-600 hover:underline text-xs">Ver demandas</Link>
            </li>
          ))}
        </ul>
        {demandas.length > maxItems && (
          <p className="text-xs text-blue-700 mt-2">+ {demandas.length - maxItems} mais</p>
        )}
      </div>
    </section>
  );
}
