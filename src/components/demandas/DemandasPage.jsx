import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demandasApi } from '../../services/api';
import { useDemandas } from '../../hooks/useDemandas';
import { usePessoas } from '../../hooks/usePessoas';
import { useEmpreendimentosLista } from '../../hooks/useEmpreendimentosLista';
import Comentarios from '../Comentarios';
import KanbanBoard from '../KanbanBoard';
import Filtros from '../Filtros';
import Modal from '../shared/Modal';
import Loading from '../shared/Loading';
import DemandaForm from '../shared/DemandaForm';
import ConfirmDialog from '../shared/ConfirmDialog';
import { getInitialDemandaForm, demandaToForm, formToDemandaPayload } from '../../utils/formDemanda';
import DemandasList from './DemandasList';

export default function DemandasPage() {
  const { user, isCoordenador, isDesigner } = useAuth();
  const [searchParams] = useSearchParams();
  const filtroInicial = searchParams.get('filtro') || 'ativas';
  const empreendimentoFiltro = searchParams.get('empreendimentoId') || '';

  const [filtro, setFiltro] = useState(filtroInicial);
  const [filtroEmpreendimentoId, setFiltroEmpreendimentoId] = useState(empreendimentoFiltro);
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroResponsavelId, setFiltroResponsavelId] = useState('');
  const [filtroDe, setFiltroDe] = useState('');
  const [filtroAte, setFiltroAte] = useState('');
  const [vistaKanban, setVistaKanban] = useState(false);
  const [showNovaDemanda, setShowNovaDemanda] = useState(false);
  const [demandaEmEdicao, setDemandaEmEdicao] = useState(null);
  const [novaDemanda, setNovaDemanda] = useState(() => getInitialDemandaForm());
  const [editDemandaForm, setEditDemandaForm] = useState(() => getInitialDemandaForm());
  const [criandoDemanda, setCriandoDemanda] = useState(false);
  const [salvandoDemanda, setSalvandoDemanda] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);
  const [demandaComentarios, setDemandaComentarios] = useState(null);
  const [concluirDemanda, setConcluirDemanda] = useState(null);

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
  const { pessoas: pessoasLista, refetch: refetchPessoas } = usePessoas(isCoordenador);
  const { lista: empreendimentosLista } = useEmpreendimentosLista(true);

  useEffect(() => {
    setFiltro(filtroInicial);
    setFiltroEmpreendimentoId(empreendimentoFiltro);
  }, [filtroInicial, empreendimentoFiltro]);

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
    try {
      await demandasApi.atualizar(demandaEmEdicao.id, formToDemandaPayload(editDemandaForm));
      setDemandaEmEdicao(null);
      await refetchDemandas();
    } catch (err) {
      alert(err?.message || 'Erro ao editar demanda.');
    } finally {
      setSalvandoDemanda(false);
    }
  }

  async function handleCriarDemanda(e) {
    e?.preventDefault?.();
    setCriandoDemanda(true);
    try {
      await demandasApi.criar(formToDemandaPayload(novaDemanda));
      setShowNovaDemanda(false);
      setNovaDemanda(getInitialDemandaForm());
      await refetchDemandas();
      await refetchPessoas();
    } catch (err) {
      alert(err?.message || 'Erro ao criar demanda.');
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
      await refetchDemandas();
    } catch (err) {
      alert(err?.message || 'Erro ao concluir demanda.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
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
                  filtro === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                <button type="button" onClick={() => setVistaKanban(false)} className={`px-3 py-2 text-sm font-medium ${!vistaKanban ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Lista</button>
                <button type="button" onClick={() => setVistaKanban(true)} className={`px-3 py-2 text-sm font-medium ${vistaKanban ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Kanban</button>
              </div>
            )}
          </div>
        )}

        {isCoordenador && (
          <div className="mb-6">
            <button onClick={() => setShowNovaDemanda(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Nova demanda</button>
          </div>
        )}

        {filtro === 'ativas' && vistaKanban ? (
          <KanbanBoard demandas={demandas} setDemandas={setDemandas} onAbrirComentarios={demanda => setDemandaComentarios(demanda)} />
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
          />
        )}
      </main>

      <Modal open={!!demandaComentarios} onClose={() => setDemandaComentarios(null)} title={demandaComentarios ? `Comentários — ${demandaComentarios.titulo}` : ''}>
        {demandaComentarios && (
          <Comentarios demandaId={demandaComentarios.id} onComentarioAdicionado={refetchDemandas} />
        )}
      </Modal>

      <Modal open={showNovaDemanda} onClose={() => setShowNovaDemanda(false)} title="Nova Demanda">
        <DemandaForm value={novaDemanda} onChange={setNovaDemanda} onSubmit={handleCriarDemanda} onCancel={() => setShowNovaDemanda(false)} submitting={criandoDemanda} submitLabel="Criar" pessoasLista={pessoasLista} empreendimentosLista={empreendimentosLista} />
      </Modal>

      <Modal open={!!demandaEmEdicao} onClose={() => setDemandaEmEdicao(null)} title="Editar Demanda">
        <DemandaForm value={editDemandaForm} onChange={setEditDemandaForm} onSubmit={handleSalvarEditarDemanda} onCancel={() => setDemandaEmEdicao(null)} submitting={salvandoDemanda} submitLabel="Salvar" pessoasLista={pessoasLista} empreendimentosLista={empreendimentosLista} />
      </Modal>

      <ConfirmDialog open={!!concluirDemanda} onClose={() => setConcluirDemanda(null)} onConfirm={handleConfirmarConcluir} title="Concluir demanda" message="Marcar esta demanda como concluída?" confirmLabel="Concluir" cancelLabel="Cancelar" variant="danger" />
    </div>
  );
}
