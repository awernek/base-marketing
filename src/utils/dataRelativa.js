/**
 * Retorna data em texto relativo: "há 2 horas", "ontem", "3 dias atrás", etc.
 */
export function dataRelativa(data) {
  if (!data) return '';
  const d = new Date(data);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH} ${diffH === 1 ? 'hora' : 'horas'}`;
  if (diffD === 1) return 'ontem';
  if (diffD < 7) return `há ${diffD} dias`;
  if (diffD < 30) return `há ${Math.floor(diffD / 7)} ${Math.floor(diffD / 7) === 1 ? 'semana' : 'semanas'}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}
