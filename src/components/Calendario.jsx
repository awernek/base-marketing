import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { demandasApi } from '../services/api';
import {
  getStatusEmoji,
  getPrioridadeEmoji,
  statusLabels,
  tipoLabels,
  prioridadeLabels,
  StatusDemanda,
  PrioridadeDemanda,
} from '../utils/enums';

function getSemanaInicio(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const seg = new Date(date);
  seg.setDate(diff);
  seg.setHours(0, 0, 0, 0);
  return seg.toISOString().slice(0, 10);
}

function Calendario() {
  const { user, isCoordenador, isDesigner } = useAuth();
  const [demandas, setDemandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesAno, setMesAno] = useState(() => {
    const now = new Date();
    return { ano: now.getFullYear(), mes: now.getMonth() + 1 };
  });

  useEffect(() => {
    loadDemandas();
  }, [mesAno]);

  async function loadDemandas() {
    setLoading(true);
    try {
      const inicio = new Date(mesAno.ano, mesAno.mes - 1, 1);
      const fim = new Date(mesAno.ano, mesAno.mes, 0, 23, 59, 59);
      const de = inicio.toISOString();
      const ate = fim.toISOString();
      let data = await demandasApi.listar({ ativas: true, de, ate });
      if (isDesigner && user?.pessoaId) {
        data = (data || []).filter(d => d.responsavelId === user.pessoaId);
      }
      setDemandas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar demandas:', err);
      setDemandas([]);
    } finally {
      setLoading(false);
    }
  }

  const porSemana = demandas.reduce((acc, d) => {
    const key = getSemanaInicio(d.prazo);
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const semanasOrdenadas = Object.keys(porSemana).sort();
  const nomeMes = new Date(mesAno.ano, mesAno.mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  function mudarMes(delta) {
    setMesAno(prev => {
      let { ano, mes } = prev;
      mes += delta;
      if (mes > 12) { mes = 1; ano += 1; }
      if (mes < 1) { mes = 12; ano -= 1; }
      return { ano, mes };
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Calendário / Linha do tempo</h1>

        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            ← Anterior
          </button>
          <span className="text-lg font-medium text-gray-900 capitalize">{nomeMes}</span>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Próximo →
          </button>
        </div>

        {semanasOrdenadas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            Nenhuma demanda com prazo neste mês.
          </div>
        ) : (
          <div className="space-y-6">
            {semanasOrdenadas.map(semanaKey => {
              const seg = new Date(semanaKey + 'T12:00:00');
              const dom = new Date(seg);
              dom.setDate(dom.getDate() + 6);
              const labelSemana = `${seg.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${dom.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}`;
              const itens = porSemana[semanaKey].sort((a, b) => new Date(a.prazo) - new Date(b.prazo));
              return (
                <section key={semanaKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <h2 className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                    Semana de {labelSemana}
                  </h2>
                  <ul className="divide-y divide-gray-100">
                    {itens.map(d => (
                      <li key={d.id} className="px-4 py-3 hover:bg-gray-50 flex flex-wrap items-center gap-2">
                        <span>{getStatusEmoji(d.status)}</span>
                        <span>{getPrioridadeEmoji(d.prioridade)}</span>
                        <span className="font-medium text-gray-900">{d.titulo}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(d.prazo).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-sm text-gray-600">{d.responsavelNome || '—'}</span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">{tipoLabels[d.tipo] || ''}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Calendario;
