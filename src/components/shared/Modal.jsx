export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-white rounded-xl ${maxWidth} w-full max-h-[90vh] overflow-hidden flex flex-col shadow-ds-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title != null && (
          <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
