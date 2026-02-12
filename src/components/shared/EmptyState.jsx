/**
 * Estado vazio reutilizável: ícone + título + descrição + CTA opcional.
 */
export default function EmptyState({
  icon = '📭',
  title = 'Nada por aqui',
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center py-12 px-4 text-center
        ${className}
      `.trim()}
    >
      <div className="text-5xl mb-4" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-primary-blue text-white font-medium rounded-lg hover:bg-primary-blue-dark transition-colors shadow-ds-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
