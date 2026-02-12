import { Link } from 'react-router-dom';

/**
 * Card de alerta: gradiente suave, ícone, mensagem, "Ver mais".
 */
export default function AlertaCard({ titulo, mensagem, link, linkLabel = 'Ver mais' }) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-700 text-lg" aria-hidden="true">⚠️</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 mb-1">{titulo}</h4>
          <p className="text-sm text-gray-700">{mensagem}</p>
        </div>
        {link && (
          <Link
            to={link}
            className="text-sm font-medium text-yellow-700 hover:text-yellow-800 whitespace-nowrap shrink-0"
          >
            {linkLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
