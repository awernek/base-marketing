import { useState, useEffect, useRef } from 'react';
import { demandasApi } from '../services/api';
import { dataRelativa } from '../utils/dataRelativa';
import Avatar from './shared/Avatar';
import Button from './shared/Button';

const TEXTAREA_MIN = 80;
const TEXTAREA_MAX = 200;
const HIGHLIGHT_DURATION_MS = 3000;

function ComentarioItem({ comentario, onExcluir, excluindo, isNew }) {
  const nome = comentario.usuario?.nome ?? 'Coordenador';

  return (
    <div
      className={`
        flex gap-3 p-4 rounded-lg transition-colors duration-300
        ${isNew ? 'bg-primary-blue-light/50' : 'hover:bg-gray-50'}
      `}
    >
      <Avatar user={nome} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">{nome}</span>
          <span className="text-xs text-gray-500">· {dataRelativa(comentario.createdAt)}</span>
          {comentario.podeExcluir && (
            <button
              type="button"
              onClick={() => onExcluir(comentario.id)}
              disabled={excluindo === comentario.id}
              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {excluindo === comentario.id ? 'Excluindo...' : 'Excluir'}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {comentario.texto}
        </p>
        {comentario.anexoUrl && (
          <a
            href={comentario.anexoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-blue hover:underline mt-1 inline-block"
          >
            Anexo
          </a>
        )}
      </div>
    </div>
  );
}

export default function Comentarios({ demandaId, onComentarioAdicionado }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [novoComentarioId, setNovoComentarioId] = useState(null);
  const textareaRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!demandaId) return;
    setLoading(true);
    demandasApi
      .comentarios(demandaId)
      .then((data) => setComentarios(Array.isArray(data) ? data : []))
      .catch(() => setComentarios([]))
      .finally(() => setLoading(false));
  }, [demandaId]);

  useEffect(() => {
    if (novoComentarioId) {
      const t = setTimeout(() => setNovoComentarioId(null), HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [novoComentarioId]);

  useEffect(() => {
    if (listRef.current && comentarios.length > 0) {
      listRef.current.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [comentarios.length]);

  function handleSubmit(e) {
    e.preventDefault();
    const texto = novoComentario.trim();
    if (!texto || !demandaId) return;
    setEnviando(true);
    demandasApi
      .criarComentario({ demandaId, texto })
      .then((criado) => {
        setComentarios((prev) => [...prev, criado]);
        setNovoComentarioId(criado.id);
        setNovoComentario('');
        if (textareaRef.current) {
          textareaRef.current.style.height = '';
        }
        onComentarioAdicionado?.();
        setTimeout(() => {
          listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      })
      .catch((err) => alert(err?.message || 'Erro ao enviar comentário.'))
      .finally(() => setEnviando(false));
  }

  function handleExcluir(id) {
    if (!window.confirm('Excluir este comentário?')) return;
    setExcluindo(id);
    demandasApi
      .excluirComentario(id)
      .then(() => {
        setComentarios((prev) => prev.filter((c) => c.id !== id));
        onComentarioAdicionado?.();
      })
      .catch((err) => alert(err?.message || 'Erro ao excluir.'))
      .finally(() => setExcluindo(null));
  }

  function handleTextareaChange(e) {
    setNovoComentario(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(Math.max(el.scrollHeight, TEXTAREA_MIN), TEXTAREA_MAX) + 'px';
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Carregando comentários...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div ref={listRef} className="space-y-1 mb-6 max-h-[50vh] overflow-y-auto pr-2">
        {comentarios.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">Nenhum comentário ainda. Seja o primeiro a comentar.</p>
        ) : (
          comentarios.map((c) => (
            <ComentarioItem
              key={c.id}
              comentario={c}
              onExcluir={handleExcluir}
              excluindo={excluindo}
              isNew={c.id === novoComentarioId}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <textarea
          ref={textareaRef}
          value={novoComentario}
          onChange={handleTextareaChange}
          placeholder="Adicione um comentário..."
          rows={2}
          style={{ minHeight: TEXTAREA_MIN }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
          aria-label="Novo comentário"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={enviando || !novoComentario.trim()}
            loading={enviando}
            loadingLabel="Enviando..."
          >
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
