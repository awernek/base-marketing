import PrazoCard from './PrazoCard';

/**
 * Seção "Próximos Prazos (7 dias)" com cards compactos.
 */
export default function ProximosPrazos({ demandas = [], maxItems = 10 }) {
  if (demandas.length === 0) return null;
  const slice = demandas.slice(0, maxItems);

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl p-6 shadow-ds-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span aria-hidden="true">📅</span> Próximos Prazos
            <span className="text-xs font-normal text-gray-500">(7 dias)</span>
          </h2>
        </div>
        <div className="space-y-2">
          {slice.map((d) => (
            <PrazoCard key={d.id} demanda={d} />
          ))}
        </div>
        {demandas.length > maxItems && (
          <p className="text-xs text-gray-500 mt-3">+ {demandas.length - maxItems} mais</p>
        )}
      </div>
    </section>
  );
}
