import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
}) {
  if (!open) return null;
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
          className={`px-4 py-2 rounded-lg font-medium ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
