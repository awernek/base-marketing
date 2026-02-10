import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pessoasApi, demandasApi, dashboardApi, checkinsApi, empreendimentosApi, authApi } from '../services/api';
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

  // Form nova demanda
  const [novaDemanda, setNovaDemanda] = useState({
    titulo: '',
    descricao: '',
    tipo: TipoDemanda.POST,
    responsavelId: '',
    prazo: '',
    impacto: ImpactoNegocio.LEAD,
    prioridade: PrioridadeDemanda.MEDIA,
    empreendimentoId: '',
    link: '',
  });
  const [criandoDemanda, setCriandoDemanda] = useState(false);

  // Form editar demanda (preenchido ao abrir modal)
  const [editDemandaForm, setEditDemandaForm] = useState({
    titulo: '',
    descricao: '',
    tipo: TipoDemanda.POST,
    responsavelId: '',
    prazo: '',
    impacto: ImpactoNegocio.LEAD,
    prioridade: PrioridadeDemanda.MEDIA,
    empreendimentoId: '',
    link: '',
  });
  const [salvandoDemanda, setSalvandoDemanda] = useState(false);
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
    e.preventDefault();
    setCriandoDemanda(true);
    try {
      const body = {
        titulo: novaDemanda.titulo,
        descricao: novaDemanda.descricao || null,
        tipo: Number(novaDemanda.tipo),
        responsavelId: Number(novaDemanda.responsavelId),
        prazo: new Date(novaDemanda.prazo).toISOString(),
        impacto: Number(novaDemanda.impacto),
        prioridade: Number(novaDemanda.prioridade),
        empreendimentoId: novaDemanda.empreendimentoId ? Number(novaDemanda.empreendimentoId) : null,
        link: novaDemanda.link?.trim() || null,
      };
      await demandasApi.criar(body);
      setShowNovaDemanda(false);
      setNovaDemanda({ titulo: '', descricao: '', tipo: TipoDemanda.POST, responsavelId: '', prazo: '', impacto: ImpactoNegocio.LEAD, prioridade: PrioridadeDemanda.MEDIA, empreendimentoId: '', link: '' });
      await loadData();
    } catch (err) {
      console.error('Erro ao criar demanda:', err);
      alert(err?.message || 'Erro ao criar demanda.');
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
    setEditDemandaForm({
      titulo: demanda.titulo,
      descricao: demanda.descricao ?? '',
      tipo: demanda.tipo,
      responsavelId: String(demanda.responsavelId || ''),
      prazo: demanda.prazo ? new Date(demanda.prazo).toISOString().slice(0, 10) : '',
      impacto: demanda.impacto ?? ImpactoNegocio.LEAD,
      prioridade: demanda.prioridade ?? PrioridadeDemanda.MEDIA,
      empreendimentoId: demanda.empreendimentoId ? String(demanda.empreendimentoId) : '',
      link: demanda.link ?? '',
    });
  }

  async function handleSalvarEditarDemanda(e) {
    e.preventDefault();
    if (!demandaEmEdicao) return;
    setSalvandoDemanda(true);
    try {
      const body = {
        titulo: editDemandaForm.titulo,
        descricao: editDemandaForm.descricao || null,
        tipo: Number(editDemandaForm.tipo),
        responsavelId: Number(editDemandaForm.responsavelId),
        prazo: new Date(editDemandaForm.prazo).toISOString(),
        impacto: Number(editDemandaForm.impacto),
        prioridade: Number(editDemandaForm.prioridade),
        empreendimentoId: editDemandaForm.empreendimentoId ? Number(editDemandaForm.empreendimentoId) : null,
        link: editDemandaForm.link?.trim() || null,
      };
      await demandasApi.atualizar(demandaEmEdicao.id, body);
      setDemandaEmEdicao(null);
      await loadData();
    } catch (err) {
      console.error('Erro ao editar demanda:', err);
      alert(err?.message || 'Erro ao editar demanda. Tente novamente.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Base — Visão Geral</h1>
            {overview && (
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{overview.totalPessoasAtivas} pessoas</span>
                <span>{overview.totalDemandasAtivas} demandas ativas</span>
                {overview.checkInsPendentes > 0 && (
                  <span className="text-yellow-600">{overview.checkInsPendentes} check-ins pendentes</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">🟢 Time</h2>
            <button
              onClick={() => setShowNovaPessoa(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Nova pessoa
            </button>
          </div>
          {pessoas.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">Nenhuma pessoa cadastrada ainda.</p>
              <button
                onClick={() => setShowNovaPessoa(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Cadastrar primeira pessoa →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {pessoas.map(pessoa => (
                <button
                  key={pessoa.id}
                  onClick={() => handleSelectPessoa(pessoa)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{pessoa.nome.split(' ')[0]}</span>
                    <span className="text-2xl">{getCargaEmojiFromString(pessoa.cargaAtual)}</span>
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{pessoa.cargaAtual || '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">{pessoa.demandasAtivas} demandas</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Próximos prazos (7 dias) */}
        {proximosPrazos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📅 Próximos prazos (7 dias)</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2">
                {proximosPrazos.slice(0, 10).map(d => (
                  <li key={d.id} className="text-sm text-blue-900 flex items-center gap-2 flex-wrap">
                    <span>{getStatusEmoji(d.status)}</span>
                    <span className="font-medium">{d.titulo}</span>
                    <span className="text-blue-700">prazo {new Date(d.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    <span>{d.responsavelNome || '—'}</span>
                    <Link to="/demandas" className="text-blue-600 hover:underline text-xs">Ver demandas</Link>
                  </li>
                ))}
              </ul>
              {proximosPrazos.length > 10 && (
                <p className="text-xs text-blue-700 mt-2">+ {proximosPrazos.length - 10} mais</p>
              )}
            </div>
          </section>
        )}

        {/* Alertas */}
        {(pessoasComCargaAlta.length > 0 || countDemandasEmRisco > 0) && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">⚠️ Alertas</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              {pessoasComCargaAlta.map(pessoa => (
                <div key={pessoa.id} className="text-sm text-yellow-900">
                  • <strong>{pessoa.nome}:</strong> {pessoa.demandasAtivas} demandas ativas + carga alta
                </div>
              ))}
              {countDemandasEmRisco > 0 && (
                <div className="text-sm text-yellow-900">
                  • {countDemandasEmRisco} {countDemandasEmRisco === 1 ? 'demanda' : 'demandas'} em risco
                  <Link to="/demandas?filtro=risco" className="ml-2 text-yellow-700 underline hover:text-yellow-900">Ver em risco</Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Demandas Ativas */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">📋 Demandas Ativas ({demandas.length})</h2>
            <button
              onClick={() => setShowNovaDemanda(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Nova demanda
            </button>
          </div>
          <div className="space-y-3">
            {demandasOrdenadas.map(demanda => (
              <div key={demanda.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{demanda.titulo}</h3>
                    {demanda.descricao && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{demanda.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
                      <span>{getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}</span>
                      <span>{getStatusEmoji(demanda.status)} {statusLabels[demanda.status] ?? ''}</span>
                      <select
                        value={demanda.status ?? ''}
                        onChange={(e) => handleAlterarStatus(demanda.id, Number(e.target.value))}
                        disabled={atualizandoStatus === demanda.id}
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        title="Alterar status"
                      >
                        <option value={StatusDemanda.OK}>OK</option>
                        <option value={StatusDemanda.ATENCAO}>Atenção</option>
                        <option value={StatusDemanda.RISCO}>Risco</option>
                      </select>
                      <span>•</span>
                      <span>prazo {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      <span>•</span>
                      <span>{demanda.responsavelNome || '—'}</span>
                      {demanda.empreendimentoNome && <span className="text-gray-500">· {demanda.empreendimentoNome}</span>}
                      {demanda.link && (
                        <a href={demanda.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Link</a>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap items-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                        {getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                        {tipoLabels[demanda.tipo] || ''}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-xs text-blue-700">
                        {impactoLabels[demanda.impacto] || ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAbrirEditarDemanda(demanda)}
                        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 rounded px-2 py-1"
                        title="Editar demanda"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConcluirDemanda(demanda)}
                        className="text-xs text-green-600 hover:text-green-800 border border-green-300 hover:border-green-500 rounded px-2 py-1"
                        title="Marcar como concluída"
                      >
                        ✓ Concluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      {/* Modal Nova Demanda */}
      {showNovaDemanda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowNovaDemanda(false)}>
          <div className="bg-white rounded-lg max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nova Demanda</h2>
            
            <form onSubmit={handleCriarDemanda} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">O que é?</label>
                <input
                  type="text"
                  required
                  value={novaDemanda.titulo}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Campanha de lançamento — Res. Horizonte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Briefing / descrição (opcional)</label>
                <textarea
                  value={novaDemanda.descricao}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contexto, referências, instruções..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <select
                  value={novaDemanda.prioridade}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, prioridade: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={PrioridadeDemanda.ALTA}>Alta</option>
                  <option value={PrioridadeDemanda.MEDIA}>Média</option>
                  <option value={PrioridadeDemanda.BAIXA}>Baixa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empreendimento (opcional)</label>
                <select
                  value={novaDemanda.empreendimentoId}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, empreendimentoId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Nenhum</option>
                  {empreendimentosLista.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={novaDemanda.tipo}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, tipo: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={TipoDemanda.POST}>Post</option>
                  <option value={TipoDemanda.CAMPANHA}>Campanha</option>
                  <option value={TipoDemanda.LANDING}>Landing</option>
                  <option value={TipoDemanda.INSTITUCIONAL}>Institucional</option>
                  <option value={TipoDemanda.OUTRO}>Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <select
                  required
                  value={novaDemanda.responsavelId}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, responsavelId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {pessoasLista.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — carga {p.cargaAtual || '—'}, {p.demandasAtivas ?? 0} demanda(s)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link (opcional)</label>
                <input
                  type="url"
                  value={novaDemanda.link}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prazo</label>
                <input
                  type="date"
                  required
                  value={novaDemanda.prazo}
                  onChange={(e) => setNovaDemanda(prev => ({ ...prev, prazo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Impacto no negócio</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="impacto"
                      value={ImpactoNegocio.VENDA}
                      checked={novaDemanda.impacto === ImpactoNegocio.VENDA}
                      onChange={(e) => setNovaDemanda(prev => ({ ...prev, impacto: Number(e.target.value) }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Venda direta</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="impacto"
                      value={ImpactoNegocio.LEAD}
                      checked={novaDemanda.impacto === ImpactoNegocio.LEAD}
                      onChange={(e) => setNovaDemanda(prev => ({ ...prev, impacto: Number(e.target.value) }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Lead</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="impacto"
                      value={ImpactoNegocio.INSTITUCIONAL}
                      checked={novaDemanda.impacto === ImpactoNegocio.INSTITUCIONAL}
                      onChange={(e) => setNovaDemanda(prev => ({ ...prev, impacto: Number(e.target.value) }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Institucional</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovaDemanda(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criandoDemanda}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {criandoDemanda ? 'Criando...' : 'Criar demanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Demanda */}
      {demandaEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setDemandaEmEdicao(null)}>
          <div className="bg-white rounded-lg max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Editar Demanda</h2>
              <button onClick={() => setDemandaEmEdicao(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSalvarEditarDemanda} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">O que é?</label>
                <input
                  type="text"
                  required
                  value={editDemandaForm.titulo}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Campanha de lançamento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Briefing / descrição (opcional)</label>
                <textarea
                  value={editDemandaForm.descricao}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contexto, referências..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <select
                  value={editDemandaForm.prioridade}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, prioridade: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={PrioridadeDemanda.ALTA}>Alta</option>
                  <option value={PrioridadeDemanda.MEDIA}>Média</option>
                  <option value={PrioridadeDemanda.BAIXA}>Baixa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empreendimento (opcional)</label>
                <select
                  value={editDemandaForm.empreendimentoId}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, empreendimentoId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Nenhum</option>
                  {empreendimentosLista.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={editDemandaForm.tipo}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, tipo: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={TipoDemanda.POST}>Post</option>
                  <option value={TipoDemanda.CAMPANHA}>Campanha</option>
                  <option value={TipoDemanda.LANDING}>Landing</option>
                  <option value={TipoDemanda.INSTITUCIONAL}>Institucional</option>
                  <option value={TipoDemanda.OUTRO}>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <select
                  required
                  value={editDemandaForm.responsavelId}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, responsavelId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {pessoasLista.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — carga {p.cargaAtual || '—'}, {p.demandasAtivas ?? 0} demanda(s)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link (opcional)</label>
                <input
                  type="url"
                  value={editDemandaForm.link}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prazo</label>
                <input
                  type="date"
                  required
                  value={editDemandaForm.prazo}
                  onChange={(e) => setEditDemandaForm(prev => ({ ...prev, prazo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Impacto no negócio</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="impactoEdit" value={ImpactoNegocio.VENDA} checked={editDemandaForm.impacto === ImpactoNegocio.VENDA} onChange={(e) => setEditDemandaForm(prev => ({ ...prev, impacto: Number(e.target.value) }))} className="mr-2" />
                    <span className="text-sm text-gray-700">Venda direta</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="impactoEdit" value={ImpactoNegocio.LEAD} checked={editDemandaForm.impacto === ImpactoNegocio.LEAD} onChange={(e) => setEditDemandaForm(prev => ({ ...prev, impacto: Number(e.target.value) }))} className="mr-2" />
                    <span className="text-sm text-gray-700">Lead</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="impactoEdit" value={ImpactoNegocio.INSTITUCIONAL} checked={editDemandaForm.impacto === ImpactoNegocio.INSTITUCIONAL} onChange={(e) => setEditDemandaForm(prev => ({ ...prev, impacto: Number(e.target.value) }))} className="mr-2" />
                    <span className="text-sm text-gray-700">Institucional</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setDemandaEmEdicao(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={salvandoDemanda} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  {salvandoDemanda ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
