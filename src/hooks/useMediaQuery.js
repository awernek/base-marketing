import { useState, useEffect } from 'react';

/**
 * Retorna true quando o media query corresponde (ex.: (max-width: 767px) para mobile).
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e) => setMatches(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
