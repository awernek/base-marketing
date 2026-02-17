import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demandasApi } from '../../services/api';
import { useDemandas } from '../../hooks/useDemandas';
import { useDemandasRealtime } from '../../hooks/useDemandasRealtime';
import { usePessoas } from '../../hooks/usePessoas';
import { useEmpreendimentosLista } from '../../hooks/useEmpreendimentosLista';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Comentarios from '../Comentarios';
import KanbanBoard from '../KanbanBoard';
import Filtros from '../Filtros';
import Modal from '../shared/Modal';
import { DemandasListSkeleton } from '../shared/Skeleton';
import { useToast } from '../../contexts/ToastContext';
import DemandaForm from '../shared/DemandaForm';
import ConfirmDialog from '../shared/ConfirmDialog';
import { getInitialDemandaForm, demandaToForm, formToDemandaPayload } from '../../utils/formDemanda';
import DemandasList from './DemandasList';
import DemandaQuickView from './DemandaQuickView';
import Drawer from '../shared/Drawer';
import { PrioridadeDemanda, prioridadeLabels, formatDemandaId } from '../../utils/enums';

const STORAGE_KEY_VIEW = 'demandas-vista';

function getVistaInicial() {
  try {
    return localStorage.getItem(STORAGE_KEY_VIEW) === 'kanban';
  } catch {
    return false;
  }
}

function salvarVista(kanban) {
  try {
    localStorage.setItem(STORAGE_KEY_VIEW, kanban ? 'kanban' : 'lista');
  } catch (_) {}
}

export default function DemandasPage() {
  const { user, isCoordenador, isDesigner } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const { id: idFromRoute } = useParams();
  const navigate = useNavigate();
  const filtroInicial = searchParams.get('filtro') || 'ativas';
  const empreendimentoFiltro = searchParams.get('empreendimentoId') || '';

  const [filtro, setFiltro] = useState(filtroInicial);
  const [buscaPorId, setBuscaPorId] = useState('');
  const [filtroEmpreendimentoId, setFiltroEmpreendimentoId] = useState(empreendimentoFiltro);
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroResponsavelId, setFiltroResponsavelId] = useState('');
  const [filtroDe, setFiltroDe] = useState('');
  const [filtroAte, setFiltroAte] = useState('');
  const [vistaKanban, setVistaKanban] = useState(getVistaInicial);
  const [showNovaDemanda, setShowNovaDemanda] = useState(false);
  const [demandaEmEdicao, setDemandaEmEdicao] = useState(null);
  const [novaDemanda, setNovaDemanda] = useState(() => getInitialDemandaForm());
  const [editDemandaForm, setEditDemandaForm] = useState(() => getInitialDemandaForm());
  const [criandoDemanda, setCriandoDemanda] = useState(false);
  const [salvandoDemanda, setSalvandoDemanda] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);
  const [demandaComentarios, setDemandaComentarios] = useState(null);
  const [concluirDemanda, setConcluirDemanda] = useState(null);
  const [showFiltrosMobile, setShowFiltrosMobile] = useState(false);
  const [priorizarDemanda, setPriorizarDemanda] = useState(null);
  const [demandaParaAtribuir, setDemandaParaAtribuir] = useState(null);
  const [priorizarForm, setPriorizarForm] = useState({ prioridade: PrioridadeDemanda.MEDIA, responsavelId: '', prazo: '' });
  const [salvandoPriorizar, setSalvandoPriorizar] = useState(false);
  const [atribuirResponsavelId, setAtribuirResponsavelId] = useState('');
  const [salvandoAtribuir, setSalvandoAtribuir] = useState(false);
  const [erroCriar, setErroCriar] = useState(null);
  const [erroEditar, setErroEditar] = useState(null);
  const [quickViewDemanda, setQuickViewDemanda] = useState(null);

  const isMobile = useIsMobile();

  const { demandas, setDemandas, loading, refetch: refetchDemandas } = useDemandas({
    filtro,
    empreendimentoId: filtroEmpreendimentoId,
    prioridade: filtroPrioridade,
    responsavelId: filtroResponsavelId,
    de: filtroDe,
    ate: filtroAte,
    isCoordenador,
    user,
  });

  const handleCloseDrawer = useCallback(() => {
    if (idFromRoute) navigate('/demandas', { replace: true });
    setQuickViewDemanda(null);
    setShowNovaDemanda(false);
    setErroCriar(null);
  }, [idFromRoute, navigate]);

  useEffect(() => {
    if (!idFromRoute) return;
    const numId = parseInt(idFromRoute, 10);
    if (isNaN(numId)) return;
    const found = demandas.find((d) => d.id === numId);
    if (found) setQuickViewDemanda(found);
    else {
      demandasApi
        .obter(numId)
        .then((d) => setQuickViewDemanda(d))
        .catch(() => addToast('error', 'Demanda não encontrada.'));
    }
  }, [idFromRoute, demandas, addToast]);

  function handleBuscaPorId(e) {
    e?.preventDefault?.();
    const raw = buscaPorId.trim().replace(/^#/, '');
    if (!raw) return;
    const numId = parseInt(raw, 10);
    if (isNaN(numId)) {
      addToast('error', 'Informe um número de ID válido (ex.: 42 ou #42).');
      return;
    }
    const found = demandas.find((d) => d.id === numId);
    if (found) {
      setQuickViewDemanda(found);
      setBuscaPorId('');
    } else {
      demandasApi
        .obter(numId)
        .then((d) => {
          setQuickViewDemanda(d);
          setBuscaPorId('');
        })
        .catch(() => addToast('error', 'Demanda não encontrada.'));
    }
  }

  const refetchRef = useRef(refetchDemandas);
  refetchRef.current = refetchDemandas;
  const refreshDemandas = useCallback((opts) => {
    return refetchRef.current?.(opts);
  }, []);

  const { pessoas: pessoasLista, refetch: refetchPessoas } = usePessoas(true);
  const { lista: empreendimentosLista } = useEmpreendimentosLista(true);

  // Realtime: sincroniza automaticamente quando outro usuário move/edita demandas
  useDemandasRealtime({
    refetch: refreshDemandas,
    enabled: filtro === 'ativas' || filtro === 'aguardando',
  });

  useEffect(() => {
    setFiltro(filtroInicial);
    setFiltroEmpreendimentoId(empreendimentoFiltro);
  }, [filtroInicial, empreendimentoFiltro]);

  // Designer não vê aba Aguardando: redirecionar para ativas
  useEffect(() => {
    if (isDesigner && filtro === 'aguardando') setFiltro('ativas');
  }, [isDesigner, filtro]);

  async function handleAlterarStatus(demandaId, status) {
    setAtualizandoStatus(demandaId);
    try {
      await demandasApi.atualizarStatus(demandaId, status);
      setDemandas(prev => prev.map(d => d.id === demandaId ? { ...d, status } : d));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert(err?.message || 'Erro ao alterar status.');
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
    setErroEditar(null);
    try {
      await demandasApi.atualizar(demandaEmEdicao.id, formToDemandaPayload(editDemandaForm));
      setDemandaEmEdicao(null);
      setErroEditar(null);
      addToast('success', 'Demanda atualizada com sucesso.');
      await refreshDemandas({ silent: true });
    } catch (err) {
      setErroEditar(err?.message || 'Erro ao editar demanda.');
    } finally {
      setSalvandoDemanda(false);
    }
  }

  async function handleCriarDemanda(e) {
    e?.preventDefault?.();
    setCriandoDemanda(true);
    setErroCriar(null);
    try {
      await demandasApi.criar(formToDemandaPayload(novaDemanda));
      setShowNovaDemanda(false);
      setNovaDemanda(getInitialDemandaForm());
      setErroCriar(null);
      addToast('success', isDesigner ? 'Demanda criada e aguardando priorização.' : 'Demanda criada com sucesso.');
      await refreshDemandas({ silent: true });
      await refetchPessoas();
    } catch (err) {
      setErroCriar(err?.message || 'Erro ao criar demanda.');
    } finally {
      setCriandoDemanda(false);
    }
  }

  function podeAlterarStatus(demanda) {
    return isCoordenador || (isDesigner && demanda.responsavelId === user?.pessoaId);
  }

  async function handleConfirmarConcluir() {
    if (!concluirDemanda) return;
    try {
      await demandasApi.concluir(concluirDemanda.id);
      setConcluirDemanda(null);
      await refreshDemandas({ silent: true });
    } catch (err) {
      alert(err?.message || 'Erro ao concluir demanda.');
    }
  }

  function handleAbrirPriorizar(demanda) {
    setPriorizarDemanda(demanda);
    setPriorizarForm({
      prioridade: demanda.prioridade != null ? demanda.prioridade : PrioridadeDemanda.MEDIA,
      responsavelId: demanda.responsavelId != null ? String(demanda.responsavelId) : '',
      prazo: demanda.prazo ? new Date(demanda.prazo).toISOString().slice(0, 10) : '',
    });
  }

  async function handleConfirmarPriorizar(e) {
    e?.preventDefault?.();
    if (!priorizarDemanda) return;
    setSalvandoPriorizar(true);
    try {
      await demandasApi.priorizar(priorizarDemanda.id, {
        prioridade: Number(priorizarForm.prioridade),
        responsavelId: priorizarForm.responsavelId ? Number(priorizarForm.responsavelId) : null,
        prazo: priorizarForm.prazo ? new Date(priorizarForm.prazo).toISOString() : null,
      });
      setPriorizarDemanda(null);
      addToast('success', 'Demanda priorizada.');
      await refreshDemandas({ silent: true });
      await refetchPessoas();
    } catch (err) {
      alert(err?.message || 'Erro ao priorizar.');
    } finally {
      setSalvandoPriorizar(false);
    }
  }

  function handleAbrirAtribuir(demanda) {
    setDemandaParaAtribuir(demanda);
    setAtribuirResponsavelId(demanda.responsavelId != null ? String(demanda.responsavelId) : '');
  }

  async function handleConfirmarAtribuir(e) {
    e?.preventDefault?.();
    if (!demandaParaAtribuir) return;
    setSalvandoAtribuir(true);
    try {
      const payload = {
        titulo: demandaParaAtribuir.titulo,
        descricao: demandaParaAtribuir.descricao ?? null,
        tipo: demandaParaAtribuir.tipo,
        responsavelId: atribuirResponsavelId ? Number(atribuirResponsavelId) : null,
        prazo: demandaParaAtribuir.prazo ?? null,
        impacto: demandaParaAtribuir.impacto,
        status: demandaParaAtribuir.status,
        prioridade: demandaParaAtribuir.prioridade ?? null,
        ordem: demandaParaAtribuir.ordem ?? null,
        link: demandaParaAtribuir.link ?? null,
        empreendimentoId: demandaParaAtribuir.empreendimentoId ?? null,
      };
      await demandasApi.atualizar(demandaParaAtribuir.id, payload);
      setDemandaParaAtribuir(null);
      addToast('success', 'Responsável atualizado.');
      await refreshDemandas({ silent: true });
    } catch (err) {
      alert(err?.message || 'Erro ao atribuir.');
    } finally {
      setSalvandoAtribuir(false);
    }
  }

  async function handlePegarDemanda(demanda) {
    if (!demanda?.id) return;
    try {
      await demandasApi.pegar(demanda.id);
      addToast('success', 'Demanda atribuída a você.');
      await refreshDemandas({ silent: true });
    } catch (err) {
      alert(err?.message || 'Erro ao pegar demanda.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DemandasListSkeleton count={5} />
        </main>
      </div>
    );
  }

  const isKanbanView = filtro === 'ativas' && vistaKanban;

  return (
    <div className={isKanbanView ? 'h-screen flex flex-col bg-gray-50' : 'min-h-screen bg-gray-50'}>
      <main className={isKanbanView ? 'flex flex-col flex-1 min-h-0 w-full px-4 sm:px-6 lg:px-8' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {/* Header: título + abas + filtros + ações */}
        <div className={isKanbanView ? 'shrink-0 bg-white border-b border-gray-200 py-4' : ''}>
          <div className={!isKanbanView ? '' : 'w-full'}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {isDesigner ? 'Minhas demandas' : 'Demandas'}
                </h1>
                {filtro === 'concluidas' && (
                  <p className="mt-1 text-sm text-gray-500">
                    {isDesigner ? 'Suas demandas finalizadas.' : 'Todas as demandas finalizadas.'}
                  </p>
                )}
                <form onSubmit={handleBuscaPorId} className="mt-2 flex gap-2 max-w-xs">
                  <input
                    type="text"
                    value={buscaPorId}
                    onChange={(e) => setBuscaPorId(e.target.value)}
                    placeholder="Buscar por ID (#42)"
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    aria-label="Buscar demanda por ID"
                  />
                  <button type="submit" className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Buscar
                  </button>
                </form>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {isCoordenador ? (
                  <>
                    {['aguardando', 'ativas', 'risco', 'concluidas'].map(f => (
                      <Link
                        key={f}
                        to={`/demandas?filtro=${f}${filtroEmpreendimentoId ? `&empreendimentoId=${filtroEmpreendimentoId}` : ''}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filtro === f ? 'bg-primary-blue text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {f === 'aguardando' ? 'Aguardando' : f === 'ativas' ? 'Ativas' : f === 'risco' ? 'Em risco' : 'Concluídas'}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    {['ativas', 'concluidas'].map(f => (
                      <Link
                        key={f}
                        to={`/demandas?filtro=${f}${filtroEmpreendimentoId ? `&empreendimentoId=${filtroEmpreendimentoId}` : ''}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filtro === f ? 'bg-primary-blue text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {f === 'ativas' ? 'Ativas' : 'Concluídas'}
                      </Link>
                    ))}
                  </>
                )}
                {(filtro === 'ativas' || (isCoordenador && filtro === 'aguardando')) && (
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button type="button" onClick={() => { setVistaKanban(false); salvarVista(false); }} className={`px-3 py-2 text-sm font-medium ${!vistaKanban ? 'bg-primary-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Lista</button>
                    <button type="button" onClick={() => { setVistaKanban(true); salvarVista(true); }} className={`px-3 py-2 text-sm font-medium ${vistaKanban ? 'bg-primary-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Kanban</button>
                  </div>
                )}
                <button onClick={() => setShowNovaDemanda(true)} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-4 py-2 rounded-lg text-sm font-medium">+ Nova demanda</button>
              </div>
            </div>

            {(filtro === 'ativas' || filtro === 'aguardando' || filtro === 'concluidas') && (
              <div className="flex flex-wrap gap-2 items-center">
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setShowFiltrosMobile(true)}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
                    aria-label="Abrir filtros"
                  >
                    Filtros
                  </button>
                ) : (
                  <Filtros
                    empreendimentos={empreendimentosLista}
                    pessoas={pessoasLista}
                    showResponsavel={isCoordenador}
                    values={{
                      empreendimentoId: filtroEmpreendimentoId,
                      responsavelId: filtroResponsavelId,
                      prioridade: filtroPrioridade,
                      de: filtroDe,
                      ate: filtroAte,
                    }}
                    onChange={(campo, valor) => {
                      if (campo === 'empreendimentoId') setFiltroEmpreendimentoId(valor);
                      if (campo === 'responsavelId') setFiltroResponsavelId(valor);
                      if (campo === 'prioridade') setFiltroPrioridade(valor);
                      if (campo === 'de') setFiltroDe(valor);
                      if (campo === 'ate') setFiltroAte(valor);
                    }}
                    onLimpar={() => {
                      setFiltroEmpreendimentoId('');
                      setFiltroPrioridade('');
                      setFiltroResponsavelId('');
                      setFiltroDe('');
                      setFiltroAte('');
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo: Kanban (flex-1) ou Lista */}
        <div className={isKanbanView ? 'flex-1 min-h-0 py-4' : ''}>
          {isKanbanView ? (
            <KanbanBoard
              demandas={demandas}
              setDemandas={setDemandas}
              onAbrirComentarios={demanda => setDemandaComentarios(demanda)}
              isCoordenador={isCoordenador}
              onPriorizarDemanda={isCoordenador ? handleAbrirPriorizar : null}
              pessoasLista={pessoasLista}
              onAtribuirResponsavel={isCoordenador ? handleAbrirAtribuir : null}
              isDesigner={isDesigner}
              userPessoaId={user?.pessoaId}
              onPegarDemanda={isDesigner ? handlePegarDemanda : null}
              onEditarDemanda={handleAbrirEditarDemanda}
              onRefetchDemandas={refreshDemandas}
              onAbrirQuickView={setQuickViewDemanda}
            />
          ) : (
            <DemandasList
              demandas={demandas}
              isCoordenador={isCoordenador}
              filtro={filtro}
              atualizandoStatus={atualizandoStatus}
              podeAlterarStatus={podeAlterarStatus}
              onAlterarStatus={handleAlterarStatus}
              onEditar={handleAbrirEditarDemanda}
              onConcluir={setConcluirDemanda}
              onComentarios={demanda => setDemandaComentarios(demanda)}
              onPriorizar={isCoordenador ? handleAbrirPriorizar : undefined}
              onAbrirQuickView={setQuickViewDemanda}
              emptyActionLabel={isCoordenador || isDesigner ? '+ Nova demanda' : undefined}
              onEmptyAction={isCoordenador || isDesigner ? () => setShowNovaDemanda(true) : undefined}
            />
          )}
        </div>
      </main>

      <Modal open={!!demandaComentarios} onClose={() => setDemandaComentarios(null)} title={demandaComentarios ? `Comentários — ${demandaComentarios.titulo}` : ''} maxWidth="max-w-[600px]">
        {demandaComentarios && (
          <Comentarios demandaId={demandaComentarios.id} onComentarioAdicionado={() => refreshDemandas({ silent: true })} />
        )}
      </Modal>

      <Modal open={!!demandaEmEdicao} onClose={() => { setDemandaEmEdicao(null); setErroEditar(null); }} title="Editar Demanda">
        <DemandaForm value={editDemandaForm} onChange={setEditDemandaForm} onSubmit={handleSalvarEditarDemanda} onCancel={() => { setDemandaEmEdicao(null); setErroEditar(null); }} submitting={salvandoDemanda} submitLabel="Salvar" pessoasLista={pessoasLista} empreendimentosLista={empreendimentosLista} error={erroEditar} onDismissError={() => setErroEditar(null)} />
      </Modal>

      <ConfirmDialog open={!!concluirDemanda} onClose={() => setConcluirDemanda(null)} onConfirm={handleConfirmarConcluir} title="Concluir demanda" message="Marcar esta demanda como concluída?" confirmLabel="Concluir" cancelLabel="Cancelar" variant="danger" />

      <Drawer
        open={!!quickViewDemanda || showNovaDemanda}
        onClose={handleCloseDrawer}
        title={quickViewDemanda ? `${formatDemandaId(quickViewDemanda.id)} ${quickViewDemanda.titulo}` : showNovaDemanda ? 'Nova Demanda' : ''}
        width="max-w-[50vw]"
      >
        {quickViewDemanda ? (
          <DemandaQuickView
            demanda={quickViewDemanda}
            onClose={handleCloseDrawer}
            onEditar={handleAbrirEditarDemanda}
            podeEditar={isCoordenador || (isDesigner && Number(quickViewDemanda.responsavelId) === Number(user?.pessoaId))}
            onComentarioAdicionado={() => refreshDemandas({ silent: true })}
          />
        ) : showNovaDemanda ? (
          <div className="p-4">
            <DemandaForm
              value={novaDemanda}
              onChange={setNovaDemanda}
              onSubmit={handleCriarDemanda}
              onCancel={handleCloseDrawer}
              submitting={criandoDemanda}
              submitLabel="Criar"
              pessoasLista={pessoasLista}
              empreendimentosLista={empreendimentosLista}
              error={erroCriar}
              onDismissError={() => setErroCriar(null)}
              simplified
            />
          </div>
        ) : null}
      </Drawer>

      {/* Modal Priorizar (arrastar de Aguardando → A Fazer) */}
      <Modal open={!!priorizarDemanda} onClose={() => setPriorizarDemanda(null)} title="Priorizar demanda" maxWidth="max-w-md">
        {priorizarDemanda && (
          <form onSubmit={handleConfirmarPriorizar} className="space-y-4">
            <p className="text-sm text-gray-600">{priorizarDemanda.titulo}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade *</label>
              <select
                value={priorizarForm.prioridade}
                onChange={(e) => setPriorizarForm(f => ({ ...f, prioridade: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                required
              >
                {Object.entries(prioridadeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select
                value={priorizarForm.responsavelId}
                onChange={(e) => setPriorizarForm(f => ({ ...f, responsavelId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">— Nenhum —</option>
                {(pessoasLista || []).map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input
                type="date"
                value={priorizarForm.prazo}
                onChange={(e) => setPriorizarForm(f => ({ ...f, prazo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPriorizarDemanda(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancelar</button>
              <button type="submit" disabled={salvandoPriorizar} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Priorizar</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Atribuir responsável */}
      <Modal open={!!demandaParaAtribuir} onClose={() => setDemandaParaAtribuir(null)} title="Atribuir responsável" maxWidth="max-w-md">
        {demandaParaAtribuir && (
          <form onSubmit={handleConfirmarAtribuir} className="space-y-4">
            <p className="text-sm text-gray-600">{demandaParaAtribuir.titulo}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select
                value={atribuirResponsavelId}
                onChange={(e) => setAtribuirResponsavelId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">— Nenhum —</option>
                {(pessoasLista || []).map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDemandaParaAtribuir(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancelar</button>
              <button type="submit" disabled={salvandoAtribuir} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Atribuir</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal de Filtros no mobile */}
      <Modal open={showFiltrosMobile} onClose={() => setShowFiltrosMobile(false)} title="Filtros" maxWidth="max-w-md">
        <div className="space-y-4">
          <Filtros
            empreendimentos={empreendimentosLista}
            pessoas={pessoasLista}
            showResponsavel={isCoordenador}
            values={{
              empreendimentoId: filtroEmpreendimentoId,
              responsavelId: filtroResponsavelId,
              prioridade: filtroPrioridade,
              de: filtroDe,
              ate: filtroAte,
            }}
            onChange={(campo, valor) => {
              if (campo === 'empreendimentoId') setFiltroEmpreendimentoId(valor);
              if (campo === 'responsavelId') setFiltroResponsavelId(valor);
              if (campo === 'prioridade') setFiltroPrioridade(valor);
              if (campo === 'de') setFiltroDe(valor);
              if (campo === 'ate') setFiltroAte(valor);
            }}
            onLimpar={() => {
              setFiltroEmpreendimentoId('');
              setFiltroPrioridade('');
              setFiltroResponsavelId('');
              setFiltroDe('');
              setFiltroAte('');
            }}
          />
          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => setShowFiltrosMobile(false)} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2">Aplicar</button>
          </div>
        </div>
      </Modal>

      {/* FAB Nova demanda (mobile) */}
      {isMobile && isCoordenador && (
        <button
          type="button"
          onClick={() => setShowNovaDemanda(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-blue hover:bg-primary-blue-dark text-white shadow-ds-md flex items-center justify-center z-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
          aria-label="Nova demanda"
        >
          <span className="text-2xl leading-none" aria-hidden="true">+</span>
        </button>
      )}
    </div>
  );
}
