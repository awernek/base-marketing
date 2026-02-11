import { Link } from 'react-router-dom';

/**
 * Bloco de alerta: X demandas em risco com link para /demandas?filtro=risco.
 */
export default function DemandasRisco({ count }) {
  if (count == null || count <= 0) return null;
  return (
    <div className="text-sm text-yellow-900">
      • {count} {count === 1 ? 'demanda' : 'demandas'} em risco
      <Link to="/demandas?filtro=risco" className="ml-2 text-yellow-700 underline hover:text-yellow-900">
        Ver em risco
      </Link>
    </div>
  );
}
