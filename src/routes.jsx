import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import Demandas from './components/Demandas';
import Calendario from './components/Calendario';
import Empreendimentos from './components/Empreendimentos';
import Relatorios from './components/Relatorios';
import CheckIn from './components/CheckIn';
import Login from './components/Login';

export function AppRoutes() {
  const { isAuthenticated, isCoordenador } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {isCoordenador && (
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        )}
        <Route path="/demandas" element={<ProtectedRoute><Demandas /></ProtectedRoute>} />
        <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
        {isCoordenador && (
          <Route path="/empreendimentos" element={<ProtectedRoute><Empreendimentos /></ProtectedRoute>} />
        )}
        {isCoordenador && (
          <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
        )}
        <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isCoordenador ? '/' : '/checkin'} replace />} />
      </Routes>
    </Layout>
  );
}
