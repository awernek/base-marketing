import { useEffect } from 'react';

/**
 * Drawer lateral (painel que desliza da direita).
 * Uso: Quick View de demanda, detalhes sem modal central.
 * Fecha com tecla Esc.
 */
export default function Drawer({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 right-0 h-full ${width} w-full bg-white shadow-ds-xl z-50 flex flex-col animate-slide-in-right`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {title != null && (
          <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
            <h2 id="drawer-title" className="text-lg font-semibold text-gray-900 truncate pr-2">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
