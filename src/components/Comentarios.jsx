import { useState, useEffect, useRef } from 'react';
import { demandasApi } from '../services/api';
import { dataRelativa } from '../utils/dataRelativa';

function iniciais(nome) {
  if (!nome || nome === 'Coordenador') return 'C';
  const parts = nome.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (nome[0] || '?').toUpperCase();
}

export default function Comentarios({ demandaId, onComentarioAdicionado }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!demandaId) return;
    setLoading(true);
    demandasApi
      .comentarios(demandaId)
      .then(data => setComentarios(Array.isArray(data) ? data : []))
      .catch(() => setComentarios([]))
      .finally(() => setLoading(false));
  }, [demandaId]);

  function handleSubmit(e) {
    e.preventDefault();
    const texto = novoComentario.trim();
    if (!texto || !demandaId) return;
    setEnviando(true);
    demandasApi
      .criarComentario({ demandaId, texto })
      .then(criado => {
        setComentarios(prev => [...prev, criado]);
        setNovoComentario('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        onComentarioAdicionado?.();
      })
      .catch(err => alert(err?.message || 'Erro ao enviar comentário.'))
      .finally(() => setEnviando(false));
  }

  function handleExcluir(id) {
    if (!window.confirm('Excluir este comentário?')) return;
    setExcluindo(id);
    demandasApi
      .excluirComentario(id)
      .then(() => {
        setComentarios(prev => prev.filter(c => c.id !== id));
        onComentarioAdicionado?.();
      })
      .catch(err => alert(err?.message || 'Erro ao excluir.'))
      .finally(() => setExcluindo(null));
  }

  if (loading) {
    return (
      <div className="py-4 text-sm text-gray-500">Carregando comentários...</div>
    );
  }

  return (
    <div className="comentarios">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Comentários</h3>

      <ul className="space-y-3 mb-4">
        {comentarios.length === 0 ? (
          <li className="text-sm text-gray-500">Nenhum comentário ainda.</li>
        ) : (
          comentarios.map(c => (
            <li key={c.id} className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs">
                {iniciais(c.usuario?.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{c.usuario?.nome ?? 'Coordenador'}</span>
                  <span className="text-gray-400 text-xs">{dataRelativa(c.createdAt)}</span>
                  {c.podeExcluir && (
                    <button
                      type="button"
                      onClick={() => handleExcluir(c.id)}
                      disabled={excluindo === c.id}
                      className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                    >
                      {excluindo === c.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mt-0.5 whitespace-pre-wrap break-words">{c.texto}</p>
                {c.anexoUrl && (
                  <a href={c.anexoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 inline-block">
                    Anexo
                  </a>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={novoComentario}
          onChange={e => {
            setNovoComentario(e.target.value);
            const el = e.target;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 120) + 'px';
          }}
          placeholder="Adicione um comentário..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={enviando || !novoComentario.trim()}
          className="self-end bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
