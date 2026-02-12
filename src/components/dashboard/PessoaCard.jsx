import Avatar from '../shared/Avatar';

const cargaConfig = {
  alta: { cor: 'bg-red-500', emoji: '🔴', porcentagem: 90 },
  media: { cor: 'bg-yellow-500', emoji: '🟡', porcentagem: 60 },
  média: { cor: 'bg-yellow-500', emoji: '🟡', porcentagem: 60 },
  baixa: { cor: 'bg-green-500', emoji: '🟢', porcentagem: 30 },
};

/**
 * Card do time: avatar, nome, demandas ativas, badge de carga e barra de progresso.
 */
export default function PessoaCard({ pessoa, onClick }) {
  const carga = (pessoa.cargaAtual || '').toLowerCase();
  const config = cargaConfig[carga] || { cor: 'bg-gray-400', emoji: '⚪', porcentagem: 50 };

  return (
    <button
      type="button"
      onClick={() => onClick?.(pessoa)}
      className="w-full bg-white rounded-xl p-4 shadow-ds-sm hover:shadow-ds-md transition-all border border-gray-200 text-left"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar user={pessoa.nome || pessoa.email} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{pessoa.nome || '—'}</h3>
          <p className="text-xs text-gray-500">{pessoa.demandasAtivas ?? 0} demandas ativas</p>
        </div>
        <span className="text-lg shrink-0" aria-hidden="true">{config.emoji}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 capitalize">{pessoa.cargaAtual || '—'}</span>
          <span className="text-gray-500 font-medium">{config.porcentagem}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${config.cor} rounded-full transition-all duration-500`}
            style={{ width: `${config.porcentagem}%` }}
          />
        </div>
      </div>
    </button>
  );
}
