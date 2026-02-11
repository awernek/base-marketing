import { request } from './client.js';

export const authApi = {
  login(email, senha) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  },

  register(email, senha, tipo, pessoaId = null) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, senha, tipo, pessoaId }),
    });
  },

  solicitarCodigo(email) {
    return request('/api/auth/solicitar-codigo', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  definirSenha(email, codigo, senha) {
    return request('/api/auth/definir-senha', {
      method: 'POST',
      body: JSON.stringify({ email, codigo, senha }),
    });
  },
};
