import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pessoasApi, demandasApi, dashboardApi, checkinsApi, empreendimentosApi, authApi } from '../services/api';
import Modal from './shared/Modal';
import DemandaForm from './shared/DemandaForm';
import ProximosPrazos from './dashboard/ProximosPrazos';
import MetricCard from './dashboard/MetricCard';
import PessoaCard from './dashboard/PessoaCard';
import AlertaCard from './dashboard/AlertaCard';
import DemandaCompactCard from './dashboard/DemandaCompactCard';
import Button from './shared/Button';
import { DashboardSkeleton } from './shared/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { getInitialDemandaForm, demandaToForm, formToDemandaPayload } from '../utils/formDemanda';
import {
  getCargaEmojiFromString,
  getStatusEmoji,
  getPrioridadeEmoji,
  statusLabels,
  tipoLabels,
  impactoLabels,
  prioridadeLabels,
  cargaLabels,
  StatusDemanda,
  TipoDemanda,
  ImpactoNegocio,
  PrioridadeDemanda,
  CargaSemanal,
} from '../utils/enums';

function Dashboard() {
  const { addToast } = useToast();
  const [pessoas, setPessoas] = useState([]);
  const [pessoasLista, setPessoasLista] = useState([]);
  const [empreendimentosLista, setEmpreendimentosLista] = useState([]);
  const [demandas, setDemandas] = useState([]);
  const [demandasEmRisco, setDemandasEmRisco] = useState([]);
  const [proximosPrazos, setProximosPrazos] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedPessoa, setSelectedPessoa] = useState(null);
  const [showNovaDemanda, setShowNovaDemanda] = useState(false);
  const [demandaEmEdicao, setDemandaEmEdicao] = useState(null);
  const [showNovaPessoa, setShowNovaPessoa] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Perfil pessoa sendo editado (nome, email, notas)
  const [nomeEdit, setNomeEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [notasEdit, setNotasEdit] = useState('');
  const [salvandoPessoa, setSalvandoPessoa] = useState(false);

  // Histórico de check-ins da pessoa selecionada
  const [checkinsPessoa, setCheckinsPessoa] = useState([]);
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  // Envio de convite para acesso (designer vinculado à coordenação)
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [mensagemConvite, setMensagemConvite] = useState(null);

  // Definir senha sem email (alternativa quando não há serviço de email)
  const [senhaAcesso, setSenhaAcesso] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [mensagemSenha, setMensagemSenha] = useState(null);

  const [novaDemanda, setNovaDemanda] = useState(() => getInitialDemandaForm());
  const [criandoDemanda, setCriandoDemanda] = useState(false);
  const [erroCriarDemanda, setErroCriarDemanda] = useState(null);
  const [editDemandaForm, setEditDemandaForm] = useState(() => getInitialDemandaForm());
  const [salvandoDemanda, setSalvandoDemanda] = useState(false);
  const [erroEditarDemanda, setErroEditarDemanda] = useState(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);

  // Form nova pessoa
  const [novaPessoa, setNovaPessoa] = useState({
    nome: '',
    email: '',
    notasCoordenacao: '',
  });
  const [criandoPessoa, setCriandoPessoa] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Atualização automática (polling) para o coordenador ver novos check-ins sem F5
  const POLLING_INTERVAL_MS = 30 * 1000; // 30 segundos
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const overviewData = await dashboardApi.overview();
        setOverview(overviewData);
        if (selectedPessoa?.id) {
          const data = await checkinsApi.porPessoa(selectedPessoa.id);
          setCheckinsPessoa(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignora erros silenciosamente no polling
      }
    }, POLLING_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [selectedPessoa?.id]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [pessoasData, demandasData, overviewData, empLista, riscoData, proximosData] = await Promise.all([
        pessoasApi.listar(),
        demandasApi.listarAtivas(),
        dashboardApi.overview(),
        empreendimentosApi.listaEnxuta().catch(() => []),
        demandasApi.listarEmRisco().catch(() => []),
        demandasApi.proximosPrazos(7).catch(() => []),
      ]);
      setPessoas(pessoasData);
      setDemandas(demandasData);
      setOverview(overviewData);
      const pessoasOrdenadas = (pessoasData || []).filter(p => p.ativo !== false).sort((a, b) => (a.demandasAtivas ?? 0) - (b.demandasAtivas ?? 0));
      setPessoasLista(pessoasOrdenadas);
      setEmpreendimentosLista(empLista || []);
      setDemandasEmRisco(Array.isArray(riscoData) ? riscoData : []);
      setProximosPrazos(Array.isArray(proximosData) ? proximosData : []);
    } catch (err) {
      setError('Erro ao carregar dados. Verifique a conexão com o servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Ordenar demandas por prioridade depois status (risco primeiro)
  const demandasOrdenadas = [...demandas].sort((a, b) => {
    const prioridadeOrder = { [PrioridadeDemanda.ALTA]: 0, [PrioridadeDemanda.MEDIA]: 1, [PrioridadeDemanda.BAIXA]: 2 };
    const statusOrder = { [StatusDemanda.RISCO]: 0, [StatusDemanda.ATENCAO]: 1, [StatusDemanda.OK]: 2 };
    const pa = prioridadeOrder[a.prioridade] ?? 3, pb = prioridadeOrder[b.prioridade] ?? 3;
    if (pa !== pb) return pa - pb;
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  const pessoasComCargaAlta = pessoas.filter(p => (p.cargaAtual || '').toLowerCase() === 'alta');
  const countDemandasEmRisco = demandasEmRisco.length;

  function handleSelectPessoa(pessoa) {
    setSelectedPessoa(pessoa);
    setNomeEdit(pessoa.nome || '');
    setEmailEdit(pessoa.email || '');
    setNotasEdit(pessoa.notasCoordenacao || '');
    setMensagemConvite(null);
    setSenhaAcesso('');
    setConfirmarSenha('');
    setMensagemSenha(null);
  }

  async function handleEnviarConvite() {
    if (!selectedPessoa?.id) return;
    const email = (emailEdit || selectedPessoa.email || '').trim();
    if (!email) {
      setMensagemConvite({ tipo: 'erro', texto: 'Cadastre um email antes de enviar o convite.' });
      return;
    }
    setEnviandoConvite(true);
    setMensagemConvite(null);
    try {
      const res = await pessoasApi.convidar(selectedPessoa.id);
      const msg = res?.message || `Convite enviado para ${email}. O designer receberá um código por email e poderá definir a senha na tela de login (Primeiro acesso?).`;
      setMensagemConvite({ tipo: 'sucesso', texto: msg });
    } catch (err) {
      const msg = err?.message || err?.body?.message;
      if (msg && (msg.includes('já possui acesso') || msg.includes('já possui'))) {
        setMensagemConvite({ tipo: 'info', texto: 'Esta pessoa já possui acesso ao sistema.' });
      } else {
        setMensagemConvite({ tipo: 'erro', texto: msg || 'Erro ao enviar convite. Tente novamente.' });
      }
    } finally {
      setEnviandoConvite(false);
    }
  }

  async function handleDefinirSenha(e) {
    e?.preventDefault();
    if (!selectedPessoa?.id) return;
    const email = (emailEdit || selectedPessoa.email || '').trim();
    if (!email) {
      setMensagemSenha({ tipo: 'erro', texto: 'Cadastre e salve o email desta pessoa antes.' });
      return;
    }
    const senha = (senhaAcesso || '').trim();
    if (senha.length < 4) {
      setMensagemSenha({ tipo: 'erro', texto: 'A senha deve ter no mínimo 4 caracteres.' });
      return;
    }
    if (senha !== (confirmarSenha || '').trim()) {
      setMensagemSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' });
      return;
    }
    setSalvandoSenha(true);
    setMensagemSenha(null);
    try {
      try {
        await pessoasApi.definirSenha(selectedPessoa.id, senha);
        setMensagemSenha({ tipo: 'sucesso', texto: 'Senha definida com sucesso. O designer pode entrar com o email e esta senha.' });
        setSenhaAcesso('');
        setConfirmarSenha('');
      } catch (errDefinir) {
        if (errDefinir?.status === 404) {
          try {
            await authApi.register(email, senha, 1, selectedPessoa.id);
            setMensagemSenha({ tipo: 'sucesso', texto: 'Acesso criado. O designer pode entrar com o email e a senha definida.' });
            setSenhaAcesso('');
            setConfirmarSenha('');
          } catch (errRegister) {
            const msg = errRegister?.message || '';
            if (msg.includes('já cadastrado') || msg.includes('já existe')) {
              setMensagemSenha({ tipo: 'erro', texto: 'Esta pessoa já tem usuário. Para redefinir a senha sem email, o backend precisa implementar POST /api/pessoas/{id}/definir-senha (apenas coordenador).' });
            } else {
              setMensagemSenha({ tipo: 'erro', texto: msg || 'Erro ao criar acesso.' });
            }
          }
        } else {
          setMensagemSenha({ tipo: 'erro', texto: errDefinir?.message || 'Erro ao definir senha.' });
        }
      }
    } finally {
      setSalvandoSenha(false);
    }
  }

  useEffect(() => {
    if (!selectedPessoa?.id) {
      setCheckinsPessoa([]);
      return;
    }
    setLoadingCheckins(true);
    checkinsApi.porPessoa(selectedPessoa.id)
      .then((data) => setCheckinsPessoa(Array.isArray(data) ? data : []))
      .catch(() => setCheckinsPessoa([]))
      .finally(() => setLoadingCheckins(false));
  }, [selectedPessoa?.id]);

  async function handleSalvarPessoa() {
    if (!selectedPessoa) return;
    setSalvandoPessoa(true);
    try {
      const payload = {
        nome: nomeEdit.trim(),
        email: emailEdit.trim(),
        notasCoordenacao: notasEdit || null,
      };
      await pessoasApi.atualizar(selectedPessoa.id, payload);
      setPessoas(prev => prev.map(p =>
        p.id === selectedPessoa.id ? { ...p, nome: payload.nome, email: payload.email, notasCoordenacao: payload.notasCoordenacao } : p
      ));
      setSelectedPessoa(prev => ({ ...prev, ...payload }));
      setPessoasLista(prev => prev.map(p => p.id === selectedPessoa.id ? { ...p, nome: payload.nome, email: payload.email } : p));
    } catch (err) {
      console.error('Erro ao salvar pessoa:', err);
      alert(err?.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoPessoa(false);
    }
  }

  async function handleCriarDemanda(e) {
    e?.preventDefault?.();
    setCriandoDemanda(true);
    setErroCriarDemanda(null);
    try {
      await demandasApi.criar(formToDemandaPayload(novaDemanda));
      setShowNovaDemanda(false);
      setNovaDemanda(getInitialDemandaForm());
      setErroCriarDemanda(null);
      addToast('success', 'Demanda criada com sucesso.');
      await loadData();
    } catch (err) {
      console.error('Erro ao criar demanda:', err);
      setErroCriarDemanda(err?.message || 'Erro ao criar demanda.');
    } finally {
      setCriandoDemanda(false);
    }
  }

  async function handleAlterarStatus(demandaId, status) {
    setAtualizandoStatus(demandaId);
    try {
      await demandasApi.atualizarStatus(demandaId, status);
      setDemandas(prev => prev.map(d => d.id === demandaId ? { ...d, status } : d));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert(err?.message || 'Erro ao alterar status. Tente novamente.');
    } finally {
      setAtualizandoStatus(null);
    }
  }

  function handleAbrirEditarDemanda(demanda) {
    setDemandaEmEdicao(demanda);
    setEditDemandaForm(demandaToForm(demanda));
  }

  async function handleSalvarEditarDemanda(e) {
    e?.preventDefault?.();
    if (!demandaEmEdicao) return;
    setSalvandoDemanda(true);
    setErroEditarDemanda(null);
    try {
      await demandasApi.atualizar(demandaEmEdicao.id, formToDemandaPayload(editDemandaForm));
      setDemandaEmEdicao(null);
      setErroEditarDemanda(null);
      addToast('success', 'Demanda atualizada com sucesso.');
      await loadData();
    } catch (err) {
      console.error('Erro ao editar demanda:', err);
      setErroEditarDemanda(err?.message || 'Erro ao editar demanda. Tente novamente.');
    } finally {
      setSalvandoDemanda(false);
    }
  }

  async function handleConcluirDemanda(demanda) {
    if (!window.confirm('Marcar esta demanda como concluída?')) return;
    try {
      await demandasApi.concluir(demanda.id);
      await loadData();
    } catch (err) {
      console.error('Erro ao concluir demanda:', err);
      alert(err?.message || 'Erro ao concluir demanda. Tente novamente.');
    }
  }

  async function handleDesativarPessoa() {
    if (!selectedPessoa) return;
    if (!window.confirm('Tem certeza? A pessoa deixará de aparecer nas listas e não poderá fazer login como designer.')) return;
    try {
      await pessoasApi.desativar(selectedPessoa.id);
      setSelectedPessoa(null);
      await loadData();
    } catch (err) {
      console.error('Erro ao desativar pessoa:', err);
      alert(err?.message || 'Erro ao desativar pessoa. Tente novamente.');
    }
  }

  async function handleCriarPessoa(e) {
    e.preventDefault();
    setCriandoPessoa(true);
    try {
      const body = {
        nome: novaPessoa.nome,
        email: novaPessoa.email,
        notasCoordenacao: novaPessoa.notasCoordenacao || null,
      };
      await pessoasApi.criar(body);
      setShowNovaPessoa(false);
      setNovaPessoa({ nome: '', email: '', notasCoordenacao: '' });
      await loadData();
    } catch (err) {
      console.error('Erro ao criar pessoa:', err);
      alert(err?.message || 'Erro ao criar pessoa.');
    } finally {
      setCriandoPessoa(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadData} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Tentar novamente</button>
        </div>
      </div>
    );
  }

  const totalPessoas = overview?.totalPessoasAtivas ?? overview?.totalPessoas ?? 0;
  const totalDemandasAtivas = overview?.totalDemandasAtivas ?? overview?.demandasAtivas ?? demandas.length;
  const totalConcluidas = overview?.demandasConcluidas ?? 0;
  const totalEmRisco = overview?.emRisco ?? countDemandasEmRisco;
  const totalAguardandoPriorizacao = overview?.demandasAguardandoPriorizacao ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do time e demandas</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link to="/demandas?filtro=aguardando">
            <MetricCard
              icon="⏳"
              titulo="Aguardando priorização"
              valor={totalAguardandoPriorizacao}
              mudanca={totalAguardandoPriorizacao > 0 ? 'priorizar' : 'nenhuma'}
              tipo={totalAguardandoPriorizacao > 0 ? 'negativo' : 'neutro'}
            />
          </Link>
          <MetricCard
            icon="📋"
            titulo="Demandas Ativas"
            valor={totalDemandasAtivas}
            mudanca="ativas"
            tipo="neutro"
          />
          <MetricCard
            icon="⚠️"
            titulo="Em Risco"
            valor={totalEmRisco}
            mudanca={totalEmRisco > 0 ? 'requer atenção' : 'nenhuma'}
            tipo={totalEmRisco > 0 ? 'negativo' : 'neutro'}
          />
          <MetricCard
            icon="✅"
            titulo="Concluídas"
            valor={totalConcluidas}
            mudanca="total"
            tipo="neutro"
          />
          <MetricCard
            icon="👥"
            titulo="Time Ativo"
            valor={totalPessoas}
            mudanca="pessoas"
            tipo="neutro"
          />
        </div>

        {/* Time */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span aria-hidden="true">🟢</span> Time
            </h2>
            <Button variant="primary" onClick={() => setShowNovaPessoa(true)}>
              + Nova pessoa
            </Button>
          </div>
          {pessoas.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-ds-sm">
              <p className="text-gray-500 mb-4">Nenhuma pessoa cadastrada ainda.</p>
              <Button variant="ghost" onClick={() => setShowNovaPessoa(true)}>
                Cadastrar primeira pessoa →
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pessoasLista.map((pessoa) => (
                <PessoaCard key={pessoa.id} pessoa={pessoa} onClick={handleSelectPessoa} />
              ))}
            </div>
          )}
        </section>

        <ProximosPrazos demandas={proximosPrazos} maxItems={10} />

        {/* Alertas */}
        {(pessoasComCargaAlta.length > 0 || countDemandasEmRisco > 0) && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <span aria-hidden="true">⚠️</span> Alertas
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                {pessoasComCargaAlta.length + (countDemandasEmRisco > 0 ? 1 : 0)}
              </span>
            </h2>
            <div className="space-y-3">
              {pessoasComCargaAlta.map((pessoa) => (
                <AlertaCard
                  key={pessoa.id}
                  titulo={pessoa.nome}
                  mensagem={`${pessoa.demandasAtivas} demandas ativas + carga alta`}
                  link="/demandas"
                  linkLabel="Ver demandas"
                />
              ))}
              {countDemandasEmRisco > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-700 text-lg" aria-hidden="true">⚠️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">Demandas em risco</h4>
                      <p className="text-sm text-gray-700">
                        {countDemandasEmRisco} {countDemandasEmRisco === 1 ? 'demanda' : 'demandas'} em risco
                      </p>
                    </div>
                    <Link
                      to="/demandas?filtro=risco"
                      className="text-sm font-medium text-yellow-700 hover:text-yellow-800 whitespace-nowrap shrink-0"
                    >
                      Ver em risco →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Demandas Ativas (grid compacto) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span aria-hidden="true">📋</span> Demandas Ativas
              <span className="px-2 py-0.5 bg-primary-blue-light text-primary-blue rounded-full text-xs font-semibold">
                {demandas.length}
              </span>
            </h2>
            <div className="flex gap-2">
              <Link to="/demandas" className="text-sm font-medium text-primary-blue hover:text-primary-blue-dark">
                Ver todas →
              </Link>
              <Button variant="primary" onClick={() => setShowNovaDemanda(true)}>
                + Nova demanda
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demandasOrdenadas.slice(0, 6).map((demanda) => (
              <DemandaCompactCard key={demanda.id} demanda={demanda} />
            ))}
          </div>
          {demandasOrdenadas.length > 6 && (
            <p className="text-sm text-gray-500 mt-3">
              Mostrando 6 de {demandasOrdenadas.length}. <Link to="/demandas" className="text-primary-blue hover:underline">Ver todas</Link>
            </p>
          )}
        </section>
      </main>

      {/* Modal Perfil Pessoa */}
      {selectedPessoa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPessoa(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Perfil da pessoa</h2>
              <button onClick={() => setSelectedPessoa(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={nomeEdit}
                  onChange={(e) => setNomeEdit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={emailEdit}
                  onChange={(e) => setEmailEdit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Carga atual</div>
                <div className="text-lg">
                  {getCargaEmojiFromString(selectedPessoa.cargaAtual)} <span className="capitalize font-medium">{selectedPessoa.cargaAtual || '—'}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Demandas ativas</div>
                <div className="text-lg font-medium">{selectedPessoa.demandasAtivas}</div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500 mb-2">📝 Notas privadas (só você vê)</div>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={notasEdit}
                  onChange={(e) => setNotasEdit(e.target.value)}
                  placeholder="Adicione observações sobre esta pessoa..."
                />
                <button
                  onClick={handleSalvarPessoa}
                  disabled={salvandoPessoa}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {salvandoPessoa ? 'Salvando...' : 'Salvar'}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500 mb-2">🔐 Acesso do designer</div>
                <p className="text-sm text-gray-700 mb-2">
                  Para o designer ficar <strong>sob sua coordenação</strong>, use o botão abaixo. O sistema criará o usuário vinculado a esta pessoa e enviará um código por email. Se o designer já tiver acessado por &quot;Primeiro acesso?&quot; sem convite, ele pode ter ficado sem vínculo; nesse caso, envie o convite agora (a pessoa já com acesso receberá novo código).
                </p>
                {(emailEdit || selectedPessoa.email) ? (
                  <>
                    <button
                      type="button"
                      onClick={handleEnviarConvite}
                      disabled={enviandoConvite}
                      className="mb-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {enviandoConvite ? 'Enviando...' : 'Enviar convite para acesso'}
                    </button>
                    {mensagemConvite && (
                      <p className={`text-sm mt-2 ${mensagemConvite.tipo === 'erro' ? 'text-red-600' : mensagemConvite.tipo === 'sucesso' ? 'text-green-700' : 'text-blue-700'}`}>
                        {mensagemConvite.texto}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-amber-700">Cadastre e salve o email desta pessoa para poder enviar o convite.</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  O designer usa na tela de login o link <strong>Primeiro acesso?</strong> com o email <strong>{emailEdit || selectedPessoa.email || '—'}</strong> e o código recebido.
                </p>
                <Link to="/login" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline inline-block mt-1">
                  Abrir tela de login →
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500 mb-2">🔑 Definir senha (sem envio de email)</div>
                <p className="text-sm text-gray-700 mb-3">
                  Se você não tem serviço de email configurado, defina aqui a senha de acesso. O designer entra com o email da pessoa e esta senha.
                </p>
                {(emailEdit || selectedPessoa.email) ? (
                  <form onSubmit={handleDefinirSenha} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nova senha</label>
                      <input
                        type="password"
                        value={senhaAcesso}
                        onChange={(e) => setSenhaAcesso(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mín. 4 caracteres"
                        minLength={4}
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar senha</label>
                      <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Repita a senha"
                        autoComplete="new-password"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={salvandoSenha || !senhaAcesso || !confirmarSenha}
                      className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {salvandoSenha ? 'Salvando...' : 'Definir senha de acesso'}
                    </button>
                    {mensagemSenha && (
                      <p className={`text-sm ${mensagemSenha.tipo === 'erro' ? 'text-red-600' : 'text-green-700'}`}>
                        {mensagemSenha.texto}
                      </p>
                    )}
                  </form>
                ) : (
                  <p className="text-sm text-amber-700">Cadastre e salve o email desta pessoa para definir a senha.</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleDesativarPessoa}
                  className="text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Desativar pessoa
                </button>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Histórico de check-ins</div>
                {loadingCheckins ? (
                  <p className="text-sm text-gray-500">Carregando...</p>
                ) : checkinsPessoa.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum check-in registrado.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {checkinsPessoa
                      .sort((a, b) => new Date(b.semanaInicio || b.criadoEm || 0) - new Date(a.semanaInicio || a.criadoEm || 0))
                      .slice(0, 20)
                      .map((c, idx) => (
                        <div key={c.id || idx} className="text-sm text-gray-600 flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span>{getCargaEmojiFromString(typeof c.carga === 'number' ? cargaLabels[c.carga] : c.carga)}</span>
                          <span>{c.semanaInicio ? new Date(c.semanaInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : (c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : '—')}</span>
                          <span className="text-gray-500">· carga {typeof c.carga === 'number' ? (cargaLabels[c.carga] || c.carga) : (c.carga || '—')}</span>
                          {c.bloqueio && <span className="text-amber-700 truncate" title={c.bloqueio}>· {c.bloqueio}</span>}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Histórico de demandas</div>
                <div className="space-y-2">
                  {demandas
                    .filter(d => d.responsavelId === selectedPessoa.id)
                    .slice(0, 5)
                    .map(d => (
                      <div key={d.id} className="text-sm text-gray-600 flex items-center gap-2">
                        <span>{getStatusEmoji(d.status)}</span>
                        <span>{d.titulo}</span>
                        <span className="text-gray-400">({d.concluida ? 'concluída' : 'em andamento'})</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Pessoa */}
      {showNovaPessoa && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          onClick={() => setShowNovaPessoa(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-xl w-full p-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Nova Pessoa</h2>
              <button 
                onClick={() => setShowNovaPessoa(false)} 
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCriarPessoa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                <input
                  type="text"
                  required
                  value={novaPessoa.nome}
                  onChange={(e) => setNovaPessoa(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ana Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={novaPessoa.email}
                  onChange={(e) => setNovaPessoa(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ana@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas privadas (opcional)</label>
                <textarea
                  value={novaPessoa.notasCoordenacao}
                  onChange={(e) => setNovaPessoa(prev => ({ ...prev, notasCoordenacao: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                  placeholder="Observações sobre esta pessoa..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovaPessoa(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criandoPessoa}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {criandoPessoa ? 'Criando...' : 'Criar pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal open={showNovaDemanda} onClose={() => { setShowNovaDemanda(false); setErroCriarDemanda(null); }} title="Nova Demanda">
        <DemandaForm
          value={novaDemanda}
          onChange={setNovaDemanda}
          onSubmit={handleCriarDemanda}
          onCancel={() => { setShowNovaDemanda(false); setErroCriarDemanda(null); }}
          submitting={criandoDemanda}
          submitLabel="Criar demanda"
          pessoasLista={pessoasLista}
          empreendimentosLista={empreendimentosLista}
          error={erroCriarDemanda}
          onDismissError={() => setErroCriarDemanda(null)}
        />
      </Modal>

      <Modal open={!!demandaEmEdicao} onClose={() => { setDemandaEmEdicao(null); setErroEditarDemanda(null); }} title="Editar Demanda">
        <DemandaForm
          value={editDemandaForm}
          onChange={setEditDemandaForm}
          onSubmit={handleSalvarEditarDemanda}
          onCancel={() => { setDemandaEmEdicao(null); setErroEditarDemanda(null); }}
          submitting={salvandoDemanda}
          submitLabel="Salvar"
          pessoasLista={pessoasLista}
          empreendimentosLista={empreendimentosLista}
          error={erroEditarDemanda}
          onDismissError={() => setErroEditarDemanda(null)}
        />
      </Modal>

    </div>
  );
}

export default Dashboard;
