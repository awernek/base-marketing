import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TipoUsuario } from '../utils/enums';

// Modos da tela: 'login' | 'register' | 'solicitar' | 'definir'
function Login() {
  const { login, register, solicitarCodigo, definirSenha, loading, error, setError } = useAuth();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function switchMode(newMode) {
    setMode(newMode);
    setError(null);
    setSuccessMsg('');
    setSenha('');
    setConfirmarSenha('');
    setCodigo('');
  }

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, senha);
    } catch {
      // erro tratado no context
    }
  };

  // Registro Coordenador
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      await register(email, senha, TipoUsuario.COORDENADOR, null);
    } catch {
      // erro tratado no context
    }
  };

  // Solicitar código por email
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');
    try {
      await solicitarCodigo(email);
      setSuccessMsg('Se o email estiver cadastrado, o código foi enviado. Verifique sua caixa de entrada.');
      setMode('definir');
    } catch {
      // erro tratado no context
    }
  };

  // Definir senha com código
  const handleDefinirSenha = async (e) => {
    e.preventDefault();
    setError(null);
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      await definirSenha(email, codigo, senha);
      // saveSession é chamado no context, redireciona automaticamente
    } catch {
      // erro tratado no context
    }
  };

  // Títulos e subtítulos por modo
  const titles = {
    login: { title: 'Entrar', subtitle: 'Acesse sua conta' },
    register: { title: 'Criar conta', subtitle: 'Registro de Coordenador' },
    solicitar: { title: 'Ativar conta / Recuperar senha', subtitle: 'Informe o email cadastrado pelo coordenador' },
    definir: { title: 'Definir nova senha', subtitle: 'Digite o código recebido por email' },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Base Marketing</h1>
        <p className="text-lg font-medium text-gray-700 mb-1">{titles[mode].title}</p>
        <p className="text-gray-500 text-sm mb-6">{titles[mode].subtitle}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {successMsg}
          </div>
        )}

        {/* ─── LOGIN ─── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Aguarde...' : 'Entrar'}
            </button>

            <div className="flex flex-col gap-2 mt-4 text-center text-sm">
              <button type="button" onClick={() => switchMode('solicitar')} className="text-blue-600 hover:text-blue-800">
                Primeiro acesso ou esqueceu a senha?
              </button>
              <button type="button" onClick={() => switchMode('register')} className="text-gray-500 hover:text-gray-700">
                Criar conta de Coordenador
              </button>
            </div>
          </form>
        )}

        {/* ─── REGISTER COORDENADOR ─── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repita a senha"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Aguarde...' : 'Criar conta'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-600 hover:text-blue-800">
                Voltar ao login
              </button>
            </div>
          </form>
        )}

        {/* ─── SOLICITAR CÓDIGO ─── */}
        {mode === 'solicitar' && (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email cadastrado pelo coordenador"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar código por email'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-600 hover:text-blue-800">
                Voltar ao login
              </button>
            </div>
          </form>
        )}

        {/* ─── DEFINIR SENHA ─── */}
        {mode === 'definir' && (
          <form onSubmit={handleDefinirSenha} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código recebido por email</label>
              <input
                type="text"
                required
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repita a senha"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Ativando...' : 'Ativar conta'}
            </button>
            <div className="flex flex-col gap-2 mt-4 text-center text-sm">
              <button type="button" onClick={() => switchMode('solicitar')} className="text-blue-600 hover:text-blue-800">
                Reenviar código
              </button>
              <button type="button" onClick={() => switchMode('login')} className="text-gray-500 hover:text-gray-700">
                Voltar ao login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
