/**
 * Avatar circular com iniciais do usuário.
 * user: { nome?, email? } ou string (nome). size: 'sm' | 'md' (default).
 */
export default function Avatar({ user, size = 'md', className = '' }) {
  const name = typeof user === 'string' ? user : (user?.nome || user?.email || '?');
  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const s = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        rounded-full flex items-center justify-center font-semibold text-white
        bg-primary-blue shadow-ds-sm flex-shrink-0
        ${s} ${className}
      `.trim()}
      title={name}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function getInitials(name) {
  if (!name || name === '?') return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
