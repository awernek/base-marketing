import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Demandas from './components/Demandas';
import Calendario from './components/Calendario';
import Empreendimentos from './components/Empreendimentos';
import Relatorios from './components/Relatorios';
import CheckIn from './components/CheckIn';
import Login from './components/Login';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, isCoordenador, isDesigner, logout, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {/* Navbar */}
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

      <Routes>
        {isCoordenador && (
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        )}
        <Route path="/demandas" element={
          <ProtectedRoute><Demandas /></ProtectedRoute>
        } />
        <Route path="/calendario" element={
          <ProtectedRoute><Calendario /></ProtectedRoute>
        } />
        {isCoordenador && (
          <Route path="/empreendimentos" element={
            <ProtectedRoute><Empreendimentos /></ProtectedRoute>
          } />
        )}
        {isCoordenador && (
          <Route path="/relatorios" element={
            <ProtectedRoute><Relatorios /></ProtectedRoute>
          } />
        )}
        <Route path="/checkin" element={
          <ProtectedRoute><CheckIn /></ProtectedRoute>
        } />
        {/* Redireciona designer para check-in e coordenador para dashboard */}
        <Route path="*" element={
          <Navigate to={isCoordenador ? '/' : '/checkin'} replace />
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
