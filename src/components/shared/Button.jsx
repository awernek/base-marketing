/**
 * Botão do design system: primary, secondary, ghost, icon.
 * Usa cores primary-blue e estados do spec (hover, active, disabled).
 */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  loadingLabel = 'Salvando...',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary:
      'px-4 py-2 bg-primary-blue text-white shadow-ds-sm hover:bg-primary-blue-dark hover:shadow-ds-md',
    secondary:
      'px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
    ghost:
      'px-4 py-2 text-gray-600 hover:bg-gray-100',
    icon:
      'w-10 h-10 p-0 text-gray-600 hover:bg-gray-100 rounded-lg',
  };

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
