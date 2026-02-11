import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkinsApi, demandasApi, pessoasApi } from '../services/api';
import { useCheckinSemanaAtual } from '../hooks/useCheckinSemanaAtual';
import { CargaSemanal, cargaLabels, getCargaEmojiFromString, getStatusEmoji, statusLabels, tipoLabels } from '../utils/enums';

function CheckIn() {
  const { user, isCoordenador, isDesigner } = useAuth();

  const [carga, setCarga] = useState(CargaSemanal.MEDIA);
  const [bloqueio, setBloqueio] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [minhasDemandas, setMinhasDemandas] = useState([]);
  const [loadingDemandas, setLoadingDemandas] = useState(false);

  const { checkin: checkinSemanaAtual, loading: loadingCheckinSemana, refetch: refetchCheckinSemana } = useCheckinSemanaAtual(user, isDesigner);

  const [pessoas, setPessoas] = useState([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState('');
  const [loadingPessoas, setLoadingPessoas] = useState(false);

  useEffect(() => {
    if (checkinSemanaAtual) {
      setCarga(typeof checkinSemanaAtual.carga === 'number' ? checkinSemanaAtual.carga : CargaSemanal.MEDIA);
      setBloqueio(checkinSemanaAtual.bloqueio || '');
    }
  }, [checkinSemanaAtual]);

  useEffect(() => {
    if (isDesigner) loadMinhasDemandas();
    if (isCoordenador) loadPessoas();
  }, [isDesigner, isCoordenador]);

  async function loadMinhasDemandas() {
    setLoadingDemandas(true);
    try {
      const data = await demandasApi.listarAtivas();
      setMinhasDemandas(data);
    } catch (err) {
      console.error('Erro ao carregar demandas:', err);
    } finally {
      setLoadingDemandas(false);
    }
  }

  async function loadPessoas() {
    setLoadingPessoas(true);
    try {
      const data = await pessoasApi.listaEnxuta();
      setPessoas(data);
    } catch (err) {
      console.error('Erro ao carregar pessoas:', err);
    } finally {
      setLoadingPessoas(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação para coordenador
    if (isCoordenador && !pessoaSelecionada) {
      setError('Selecione uma pessoa para registrar o check-in.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const body = {
        carga,
        bloqueio: bloqueio || null,
      };
      // Coordenador deve enviar pessoaId; Designer não envia (backend deduz)
      if (isCoordenador) {
        body.pessoaId = Number(pessoaSelecionada);
      }
      await checkinsApi.criar(body);
      setSuccess(true);
      setBloqueio('');
      if (isCoordenador) {
        setPessoaSelecionada('');
      }
      if (isDesigner) refetchCheckinSemana();
    } catch (err) {
      setError(err?.message || 'Erro ao enviar check-in. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md max-w-lg w-full p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{isCoordenador ? 'Registrar Check-in' : 'Oi! Como tá sua semana?'}</h1>
        <p className="text-gray-600 mb-8">Check-in semanal</p>

        {isDesigner && checkinSemanaAtual && !loadingCheckinSemana && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Você já fez check-in esta semana (carga {typeof checkinSemanaAtual.carga === 'number' ? cargaLabels[checkinSemanaAtual.carga] : (checkinSemanaAtual.carga || '—')}
            {checkinSemanaAtual.bloqueio ? `, bloqueio: ${checkinSemanaAtual.bloqueio}` : ''}). Enviar novamente atualiza esse registro.
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Check-in enviado com sucesso!
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isCoordenador && (
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Selecione a pessoa
              </label>
              <select
                required
                value={pessoaSelecionada}
                onChange={(e) => setPessoaSelecionada(e.target.value)}
                disabled={loadingPessoas}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">
                  {loadingPessoas ? 'Carregando...' : 'Selecione uma pessoa'}
                </option>
                {pessoas.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-base font-medium text-gray-900 mb-4">
              Como {isCoordenador ? 'está' : 'você vê'} {isCoordenador ? 'a' : 'sua'} carga essa semana?
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-green-400 transition-colors"
                style={{ borderColor: carga === CargaSemanal.BAIXA ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="carga"
                  value={CargaSemanal.BAIXA}
                  checked={carga === CargaSemanal.BAIXA}
                  onChange={() => setCarga(CargaSemanal.BAIXA)}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">🟢</span>
                <div>
                  <div className="font-medium text-gray-900">Tranquila</div>
                  <div className="text-sm text-gray-600">Dá pra pegar mais coisa</div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors"
                style={{ borderColor: carga === CargaSemanal.MEDIA ? '#f59e0b' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="carga"
                  value={CargaSemanal.MEDIA}
                  checked={carga === CargaSemanal.MEDIA}
                  onChange={() => setCarga(CargaSemanal.MEDIA)}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">🟡</span>
                <div>
                  <div className="font-medium text-gray-900">Média</div>
                  <div className="text-sm text-gray-600">Dentro do esperado</div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-400 transition-colors"
                style={{ borderColor: carga === CargaSemanal.ALTA ? '#ef4444' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="carga"
                  value={CargaSemanal.ALTA}
                  checked={carga === CargaSemanal.ALTA}
                  onChange={() => setCarga(CargaSemanal.ALTA)}
                  className="mr-3"
                />
                <span className="text-2xl mr-3">🔴</span>
                <div>
                  <div className="font-medium text-gray-900">Pesada</div>
                  <div className="text-sm text-gray-600">Preciso de ajuda</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Tem algo te travando ou atrasando?
            </label>
            <textarea
              value={bloqueio}
              onChange={(e) => setBloqueio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Cliente mudou briefing, esperando feedback do comercial... (opcional)"
            />
            <p className="text-xs text-gray-500 mt-2">Opcional — só preencha se tiver algo importante</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Seus check-ins ajudam a coordenação a distribuir melhor as demandas
        </p>

        {/* Minhas demandas (designer) */}
        {isDesigner && minhasDemandas.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Minhas demandas ativas</h2>
            <div className="space-y-2">
              {minhasDemandas.map(d => (
                <div key={d.id} className="text-sm text-gray-600 flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span>{getStatusEmoji(d.status)}</span>
                  <span className="flex-1">{d.titulo}</span>
                  <span className="text-xs text-gray-400">
                    prazo {new Date(d.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;
