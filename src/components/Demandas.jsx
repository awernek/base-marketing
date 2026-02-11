import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { demandasApi, pessoasApi, empreendimentosApi } from '../services/api';
import Comentarios from './Comentarios';
import KanbanBoard from './KanbanBoard';
import Filtros from './Filtros';
import {
  getStatusEmoji,
  getPrioridadeEmoji,
  getPrioridadeBadgeClass,
  getStatusAutomaticoBadge,
  statusLabels,
  tipoLabels,
  impactoLabels,
  prioridadeLabels,
  StatusDemanda,
  TipoDemanda,
  ImpactoNegocio,
  PrioridadeDemanda,
} from '../utils/enums';

function Demandas() {
  const { user, isCoordenador, isDesigner } = useAuth();
  const [searchParams] = useSearchParams();
  const filtroInicial = searchParams.get('filtro') || 'ativas';
  const empreendimentoFiltro = searchParams.get('empreendimentoId') || '';

  const [demandas, setDemandas] = useState([]);
  const [pessoasLista, setPessoasLista] = useState([]);
  const [empreendimentosLista, setEmpreendimentosLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState(filtroInicial);
  const [filtroEmpreendimentoId, setFiltroEmpreendimentoId] = useState(empreendimentoFiltro);
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroResponsavelId, setFiltroResponsavelId] = useState('');
  const [filtroDe, setFiltroDe] = useState('');
  const [filtroAte, setFiltroAte] = useState('');
  const [vistaKanban, setVistaKanban] = useState(false);
  const [showNovaDemanda, setShowNovaDemanda] = useState(false);
  const [demandaEmEdicao, setDemandaEmEdicao] = useState(null);
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
  const [criandoDemanda, setCriandoDemanda] = useState(false);
  const [salvandoDemanda, setSalvandoDemanda] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);
  const [demandaComentarios, setDemandaComentarios] = useState(null);

  useEffect(() => {
    setFiltro(filtroInicial);
    setFiltroEmpreendimentoId(empreendimentoFiltro);
  }, [filtroInicial, empreendimentoFiltro]);

  useEffect(() => {
    loadData();
  }, [filtro, filtroEmpreendimentoId, filtroPrioridade, filtroResponsavelId, filtroDe, filtroAte, isCoordenador, isDesigner]);

  async function loadData() {
    setLoading(true);
    try {
      let data = [];
      if (isCoordenador) {
        if (filtro === 'risco') {
          data = await demandasApi.listarEmRisco().catch(() => []);
        } else if (filtro === 'concluidas') {
          const params = {};
          if (filtroEmpreendimentoId) params.empreendimentoId = Number(filtroEmpreendimentoId);
          if (filtroPrioridade !== '') params.prioridade = Number(filtroPrioridade);
          if (filtroResponsavelId) params.responsavelId = Number(filtroResponsavelId);
          if (filtroDe) params.de = filtroDe;
          if (filtroAte) params.ate = filtroAte;
          const todas = await demandasApi.listar(params).catch(() => []);
          data = (todas || []).filter(d => d.concluida);
        } else {
          const params = { ativas: true };
          if (filtroEmpreendimentoId) params.empreendimentoId = Number(filtroEmpreendimentoId);
          if (filtroPrioridade !== '') params.prioridade = Number(filtroPrioridade);
          if (filtroResponsavelId) params.responsavelId = Number(filtroResponsavelId);
          if (filtroDe) params.de = filtroDe;
          if (filtroAte) params.ate = filtroAte;
          data = await demandasApi.listar(params);
        }
      } else {
        const ativas = await demandasApi.listarAtivas();
        data = (ativas || []).filter(d => d.responsavelId === user?.pessoaId);
      }
      setDemandas(Array.isArray(data) ? data : []);
      if (isCoordenador) {
        const [pessoasCompletas, empLista] = await Promise.all([
          pessoasApi.listar().catch(() => []),
          empreendimentosApi.listaEnxuta().catch(() => []),
        ]);
        const pessoas = (pessoasCompletas || []).filter(p => p.ativo !== false);
        setPessoasLista(pessoas.sort((a, b) => (a.demandasAtivas ?? 0) - (b.demandasAtivas ?? 0)));
        setEmpreendimentosLista(empLista || []);
      } else {
        const empLista = await empreendimentosApi.listaEnxuta().catch(() => []);
        setEmpreendimentosLista(empLista || []);
      }
    } catch (err) {
      console.error('Erro ao carregar demandas:', err);
      setDemandas([]);
    } finally {
      setLoading(false);
    }
  }

  // Ordenação: prioridade (Alta primeiro), depois prazo
  const demandasOrdenadas = [...demandas].sort((a, b) => {
    const prioridadeOrder = { [PrioridadeDemanda.ALTA]: 0, [PrioridadeDemanda.MEDIA]: 1, [PrioridadeDemanda.BAIXA]: 2 };
    const pa = prioridadeOrder[a.prioridade] ?? 3, pb = prioridadeOrder[b.prioridade] ?? 3;
    if (pa !== pb) return pa - pb;
    return new Date(a.prazo) - new Date(b.prazo);
  });

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
      await demandasApi.atualizar(demandaEmEdicao.id, {
        titulo: editDemandaForm.titulo,
        descricao: editDemandaForm.descricao || null,
        tipo: Number(editDemandaForm.tipo),
        responsavelId: Number(editDemandaForm.responsavelId),
        prazo: new Date(editDemandaForm.prazo).toISOString(),
        impacto: Number(editDemandaForm.impacto),
        prioridade: Number(editDemandaForm.prioridade),
        empreendimentoId: editDemandaForm.empreendimentoId ? Number(editDemandaForm.empreendimentoId) : null,
        link: editDemandaForm.link?.trim() || null,
      });
      setDemandaEmEdicao(null);
      await loadData();
    } catch (err) {
      alert(err?.message || 'Erro ao editar demanda.');
    } finally {
      setSalvandoDemanda(false);
    }
  }

  async function handleCriarDemanda(e) {
    e.preventDefault();
    setCriandoDemanda(true);
    try {
      await demandasApi.criar({
        titulo: novaDemanda.titulo,
        descricao: novaDemanda.descricao || null,
        tipo: Number(novaDemanda.tipo),
        responsavelId: Number(novaDemanda.responsavelId),
        prazo: new Date(novaDemanda.prazo).toISOString(),
        impacto: Number(novaDemanda.impacto),
        prioridade: Number(novaDemanda.prioridade),
        empreendimentoId: novaDemanda.empreendimentoId ? Number(novaDemanda.empreendimentoId) : null,
        link: novaDemanda.link?.trim() || null,
      });
      setShowNovaDemanda(false);
      setNovaDemanda({ titulo: '', descricao: '', tipo: TipoDemanda.POST, responsavelId: '', prazo: '', impacto: ImpactoNegocio.LEAD, prioridade: PrioridadeDemanda.MEDIA, empreendimentoId: '', link: '' });
      await loadData();
    } catch (err) {
      alert(err?.message || 'Erro ao criar demanda.');
    } finally {
      setCriandoDemanda(false);
    }
  }

  function podeAlterarStatus(demanda) {
    return isCoordenador || (isDesigner && demanda.responsavelId === user?.pessoaId);
  }

  function handleAbrirComentarios(demanda) {
    setDemandaComentarios(demanda);
  }

  async function handleConcluirDemanda(demanda) {
    if (!window.confirm('Marcar esta demanda como concluída?')) return;
    try {
      await demandasApi.concluir(demanda.id);
      await loadData();
    } catch (err) {
      alert(err?.message || 'Erro ao concluir demanda.');
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {isDesigner ? 'Minhas demandas' : 'Demandas'}
        </h1>

        {isCoordenador && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            {['ativas', 'risco', 'concluidas'].map(f => (
              <Link
                key={f}
                to={`/demandas?filtro=${f}${filtroEmpreendimentoId ? `&empreendimentoId=${filtroEmpreendimentoId}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f === 'ativas' ? 'Ativas' : f === 'risco' ? 'Em risco' : 'Concluídas'}
              </Link>
            ))}
            {(filtro === 'ativas' || filtro === 'concluidas') && (
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
            {filtro === 'ativas' && (
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setVistaKanban(false)}
                  className={`px-3 py-2 text-sm font-medium ${!vistaKanban ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setVistaKanban(true)}
                  className={`px-3 py-2 text-sm font-medium ${vistaKanban ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Kanban
                </button>
              </div>
            )}
          </div>
        )}

        {isCoordenador && (
          <div className="mb-6">
            <button
              onClick={() => setShowNovaDemanda(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Nova demanda
            </button>
          </div>
        )}

        {filtro === 'ativas' && vistaKanban ? (
          <KanbanBoard
            demandas={demandas}
            setDemandas={setDemandas}
            onAbrirComentarios={handleAbrirComentarios}
          />
        ) : (
          <div className="space-y-3">
          {demandasOrdenadas.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              Nenhuma demanda nesta lista.
            </div>
          ) : (
            demandasOrdenadas.map(demanda => (
              <div key={demanda.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{demanda.titulo}</h3>
                    {demanda.descricao && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{demanda.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
                      <span>{getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}</span>
                      <span>{getStatusEmoji(demanda.status)} {statusLabels[demanda.status] ?? ''}</span>
                      {podeAlterarStatus(demanda) && filtro !== 'concluidas' && (
                        <select
                          value={demanda.status ?? ''}
                          onChange={(e) => handleAlterarStatus(demanda.id, Number(e.target.value))}
                          disabled={atualizandoStatus === demanda.id}
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value={StatusDemanda.OK}>OK</option>
                          <option value={StatusDemanda.ATENCAO}>Atenção</option>
                          <option value={StatusDemanda.RISCO}>Risco</option>
                        </select>
                      )}
                      <span>prazo {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      <span>{demanda.responsavelNome || '—'}</span>
                      {demanda.empreendimentoNome && <span className="text-gray-500">· {demanda.empreendimentoNome}</span>}
                      {demanda.link && (
                        <a href={demanda.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Link</a>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {getStatusAutomaticoBadge(demanda.statusAutomatico) && (
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusAutomaticoBadge(demanda.statusAutomatico).className}`}>
                          {getStatusAutomaticoBadge(demanda.statusAutomatico).label}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPrioridadeBadgeClass(demanda.prioridade)}`}>{getPrioridadeEmoji(demanda.prioridade)} {prioridadeLabels[demanda.prioridade] ?? ''}</span>
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">{tipoLabels[demanda.tipo] || ''}</span>
                      <span className="px-2 py-1 rounded-md bg-blue-100 text-xs text-blue-700">{impactoLabels[demanda.impacto] || ''}</span>
                      {isCoordenador && filtro !== 'concluidas' && (
                        <>
                          <button type="button" onClick={() => handleAbrirEditarDemanda(demanda)} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded px-2 py-1">Editar</button>
                          <button type="button" onClick={() => handleConcluirDemanda(demanda)} className="text-xs text-green-600 hover:text-green-800 border border-green-300 rounded px-2 py-1">✓ Concluir</button>
                        </>
                      )}
                      {podeAlterarStatus(demanda) && (
                        <button type="button" onClick={() => handleAbrirComentarios(demanda)} className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1">
                          💬 Comentários {demanda.comentariosCount > 0 && <span className="ml-1 font-medium">({demanda.comentariosCount})</span>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        )}
      </main>

      {/* Modal Comentários (Sprint 2) */}
      {demandaComentarios && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setDemandaComentarios(null)}>
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Comentários — {demandaComentarios.titulo}</h2>
              <button type="button" onClick={() => setDemandaComentarios(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <Comentarios
                demandaId={demandaComentarios.id}
                onComentarioAdicionado={loadData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Demanda */}
      {showNovaDemanda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowNovaDemanda(false)}>
          <div className="bg-white rounded-lg max-w-xl w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Nova Demanda</h2>
            <form onSubmit={handleCriarDemanda} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que é?</label>
                <input type="text" required value={novaDemanda.titulo} onChange={e => setNovaDemanda(prev => ({ ...prev, titulo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Título" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Briefing / descrição (opcional)</label>
                <textarea value={novaDemanda.descricao} onChange={e => setNovaDemanda(prev => ({ ...prev, descricao: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]" placeholder="Contexto, referências, instruções..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select value={novaDemanda.prioridade} onChange={e => setNovaDemanda(prev => ({ ...prev, prioridade: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {Object.entries(prioridadeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={novaDemanda.tipo} onChange={e => setNovaDemanda(prev => ({ ...prev, tipo: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {Object.entries(tipoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select required value={novaDemanda.responsavelId} onChange={e => setNovaDemanda(prev => ({ ...prev, responsavelId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Selecione...</option>
                  {pessoasLista.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — carga {p.cargaAtual || '—'}, {p.demandasAtivas ?? 0} demanda(s)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                <input type="url" value={novaDemanda.link} onChange={e => setNovaDemanda(prev => ({ ...prev, link: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empreendimento (opcional)</label>
                <select value={novaDemanda.empreendimentoId} onChange={e => setNovaDemanda(prev => ({ ...prev, empreendimentoId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Nenhum</option>
                  {empreendimentosLista.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                <input type="date" required value={novaDemanda.prazo} onChange={e => setNovaDemanda(prev => ({ ...prev, prazo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impacto</label>
                <div className="flex gap-4">
                  {[ImpactoNegocio.VENDA, ImpactoNegocio.LEAD, ImpactoNegocio.INSTITUCIONAL].map(i => (
                    <label key={i} className="flex items-center">
                      <input type="radio" name="impacto" value={i} checked={novaDemanda.impacto === i} onChange={e => setNovaDemanda(prev => ({ ...prev, impacto: Number(e.target.value) }))} className="mr-1" />
                      <span className="text-sm">{impactoLabels[i]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNovaDemanda(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium">Cancelar</button>
                <button type="submit" disabled={criandoDemanda} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium">{criandoDemanda ? 'Criando...' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Demanda */}
      {demandaEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setDemandaEmEdicao(null)}>
          <div className="bg-white rounded-lg max-w-xl w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Editar Demanda</h2>
            <form onSubmit={handleSalvarEditarDemanda} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que é?</label>
                <input type="text" required value={editDemandaForm.titulo} onChange={e => setEditDemandaForm(prev => ({ ...prev, titulo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Briefing / descrição (opcional)</label>
                <textarea value={editDemandaForm.descricao} onChange={e => setEditDemandaForm(prev => ({ ...prev, descricao: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]" placeholder="Contexto, referências..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select value={editDemandaForm.prioridade} onChange={e => setEditDemandaForm(prev => ({ ...prev, prioridade: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {Object.entries(prioridadeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={editDemandaForm.tipo} onChange={e => setEditDemandaForm(prev => ({ ...prev, tipo: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {Object.entries(tipoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select required value={editDemandaForm.responsavelId} onChange={e => setEditDemandaForm(prev => ({ ...prev, responsavelId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Selecione...</option>
                  {pessoasLista.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — carga {p.cargaAtual || '—'}, {p.demandasAtivas ?? 0} demanda(s)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                <input type="url" value={editDemandaForm.link} onChange={e => setEditDemandaForm(prev => ({ ...prev, link: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empreendimento (opcional)</label>
                <select value={editDemandaForm.empreendimentoId} onChange={e => setEditDemandaForm(prev => ({ ...prev, empreendimentoId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Nenhum</option>
                  {empreendimentosLista.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                <input type="date" required value={editDemandaForm.prazo} onChange={e => setEditDemandaForm(prev => ({ ...prev, prazo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impacto</label>
                <div className="flex gap-4">
                  {[ImpactoNegocio.VENDA, ImpactoNegocio.LEAD, ImpactoNegocio.INSTITUCIONAL].map(i => (
                    <label key={i} className="flex items-center">
                      <input type="radio" name="impactoEdit" value={i} checked={editDemandaForm.impacto === i} onChange={e => setEditDemandaForm(prev => ({ ...prev, impacto: Number(e.target.value) }))} className="mr-1" />
                      <span className="text-sm">{impactoLabels[i]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setDemandaEmEdicao(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium">Cancelar</button>
                <button type="submit" disabled={salvandoDemanda} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium">{salvandoDemanda ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Demandas;
