import { useState, useEffect } from 'react';
import { relatoriosApi, pessoasApi, empreendimentosApi } from '../services/api';
import { tipoLabels } from '../utils/enums';

function Relatorios() {
  const [resultado, setResultado] = useState({ total: 0, itens: [] });
  const [pessoasLista, setPessoasLista] = useState([]);
  const [empreendimentosLista, setEmpreendimentosLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    de: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })(),
    ate: new Date().toISOString().slice(0, 10),
    responsavelId: '',
    empreendimentoId: '',
  });

  useEffect(() => {
    pessoasApi.listaEnxuta().then(d => setPessoasLista(d || [])).catch(() => setPessoasLista([]));
    empreendimentosApi.listaEnxuta().then(d => setEmpreendimentosLista(d || [])).catch(() => setEmpreendimentosLista([]));
  }, []);

  async function buscar(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = {
        de: filtros.de ? new Date(filtros.de).toISOString() : undefined,
        ate: filtros.ate ? new Date(filtros.ate + 'T23:59:59').toISOString() : undefined,
      };
      if (filtros.responsavelId) params.responsavelId = Number(filtros.responsavelId);
      if (filtros.empreendimentoId) params.empreendimentoId = Number(filtros.empreendimentoId);
      const data = await relatoriosApi.demandasConcluidas(params);
      setResultado({ total: data?.total ?? 0, itens: data?.itens ?? [] });
    } catch (err) {
      console.error(err);
      setResultado({ total: 0, itens: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Relatório — Demandas concluídas</h1>

        <form onSubmit={buscar} className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
            <input
              type="date"
              value={filtros.de}
              onChange={e => setFiltros(prev => ({ ...prev, de: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
            <input
              type="date"
              value={filtros.ate}
              onChange={e => setFiltros(prev => ({ ...prev, ate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Responsável</label>
            <select
              value={filtros.responsavelId}
              onChange={e => setFiltros(prev => ({ ...prev, responsavelId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[160px]"
            >
              <option value="">Todos</option>
              {pessoasLista.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Empreendimento</label>
            <select
              value={filtros.empreendimentoId}
              onChange={e => setFiltros(prev => ({ ...prev, empreendimentoId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[160px]"
            >
              <option value="">Todos</option>
              {empreendimentosLista.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            Total: {resultado.total} demanda(s) concluída(s)
          </div>
          {resultado.itens.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum resultado no período.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {resultado.itens.map(d => (
                <li key={d.id} className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-gray-900">{d.titulo}</span>
                  <span className="text-gray-500">{tipoLabels[d.tipo] ?? ''}</span>
                  <span className="text-gray-600">{d.responsavelNome || '—'}</span>
                  <span className="text-gray-500">{d.empreendimentoNome ? `· ${d.empreendimentoNome}` : ''}</span>
                  <span className="text-gray-400">
                    concluída {d.atualizadaEm ? new Date(d.atualizadaEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default Relatorios;
