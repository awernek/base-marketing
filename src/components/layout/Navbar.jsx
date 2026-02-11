import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isCoordenador, logout, user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-900">Base Marketing</span>
        {isCoordenador && (
          <>
            <Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link to="/empreendimentos" className="text-gray-600 hover:text-blue-600">Empreendimentos</Link>
            <Link to="/relatorios" className="text-gray-600 hover:text-blue-600">Relatórios</Link>
          </>
        )}
        <Link to="/demandas" className="text-gray-600 hover:text-blue-600">Demandas</Link>
        <Link to="/calendario" className="text-gray-600 hover:text-blue-600">Calendário</Link>
        <Link to="/checkin" className="text-gray-600 hover:text-blue-600">Check-in</Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-500">
          {user?.email} · {isCoordenador ? 'Coordenador' : 'Designer'}
        </span>
        <button onClick={logout} className="text-red-600 hover:text-red-800 font-medium">Sair</button>
      </div>
    </nav>
  );
}
