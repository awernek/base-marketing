/**
 * Card de métrica para o topo do Dashboard (Demandas Ativas, Atrasadas, Concluídas, Time).
 */
export default function MetricCard({ icon, titulo, valor, mudanca, tipo = 'neutro' }) {
  const tipoConfig = {
    positivo: { cor: 'text-green-600', icon: '↑' },
    negativo: { cor: 'text-red-600', icon: '↓' },
    neutro: { cor: 'text-gray-600', icon: '•' },
  };
  const config = tipoConfig[tipo] || tipoConfig.neutro;

  return (
    <div className="bg-white rounded-xl p-6 shadow-ds-sm border border-gray-200 hover:shadow-ds-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl" aria-hidden="true">{icon}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{titulo}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{valor}</p>
      {mudanca && (
        <div className={`flex items-center gap-1 text-sm ${config.cor}`}>
          <span className="font-medium">{config.icon}</span>
          <span>{mudanca}</span>
        </div>
      )}
    </div>
  );
}
