import { useState, useEffect } from 'react';
import { empreendimentosApi } from '../services/api';

function Empreendimentos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNovo, setShowNovo] = useState(false);
  const [nomeNovo, setNomeNovo] = useState('');
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await empreendimentosApi.listar();
      setLista(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar empreendimentos:', err);
      setLista([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCriar(e) {
    e.preventDefault();
    if (!nomeNovo.trim()) return;
    setCriando(true);
    try {
      await empreendimentosApi.criar({ nome: nomeNovo.trim(), ativo: true });
      setShowNovo(false);
      setNomeNovo('');
      await load();
    } catch (err) {
      alert(err?.message || 'Erro ao criar.');
    } finally {
      setCriando(false);
    }
  }

  async function handleDesativar(emp) {
    if (!window.confirm(`Desativar "${emp.nome}"?`)) return;
    try {
      await empreendimentosApi.desativar(emp.id);
      await load();
    } catch (err) {
      alert(err?.message || 'Erro ao desativar.');
    }
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Empreendimentos</h1>
        <div className="mb-6">
          <button
            onClick={() => setShowNovo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Novo empreendimento
          </button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {lista.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum empreendimento cadastrado.</div>
          ) : (
            lista.map(emp => (
              <div key={emp.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{emp.nome}</span>
                  <span className={`ml-2 text-xs ${emp.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                    {emp.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {emp.ativo && (
                  <button
                    type="button"
                    onClick={() => handleDesativar(emp)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Desativar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {showNovo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowNovo(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Novo empreendimento</h2>
            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={nomeNovo}
                  onChange={e => setNomeNovo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Residencial Horizonte"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNovo(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={criando} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium">
                  {criando ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Empreendimentos;
