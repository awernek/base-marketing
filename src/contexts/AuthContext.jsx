import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { TipoUsuario } from '../utils/enums';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function saveSession(data) {
    const userData = {
      token: data.token,
      tipo: data.tipo,
      pessoaId: data.pessoaId,
      email: data.email,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  async function login(email, senha) {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, senha);
      saveSession(data);
      return data;
    } catch (err) {
      const msg = err?.message || (err.status === 401 ? 'Email ou senha inválidos' : 'Erro ao fazer login');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(email, senha, tipo, pessoaId = null) {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register(email, senha, tipo, pessoaId);
      saveSession(data);
      return data;
    } catch (err) {
      const msg = err?.message || (err.status === 400 ? 'Email já cadastrado' : 'Erro ao registrar');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function solicitarCodigo(email) {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.solicitarCodigo(email);
      return data;
    } catch (err) {
      setError(err?.message || 'Erro ao solicitar código. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function definirSenha(email, codigo, senha) {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.definirSenha(email, codigo, senha);
      saveSession(data);
      return data;
    } catch (err) {
      const msg = err?.message || (err.status === 400
        ? 'Código inválido, expirado ou tentativas excedidas.'
        : 'Erro ao definir senha. Tente novamente.');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const isCoordenador = user?.tipo === TipoUsuario.COORDENADOR;
  const isDesigner = user?.tipo === TipoUsuario.DESIGNER;
  const isAuthenticated = !!user?.token;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      solicitarCodigo,
      definirSenha,
      logout,
      isCoordenador,
      isDesigner,
      isAuthenticated,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
