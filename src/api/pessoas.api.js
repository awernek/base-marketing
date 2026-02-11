import { request } from './client.js';

export const pessoasApi = {
  listar() {
    return request('/api/pessoas');
  },

  listaEnxuta() {
    return request('/api/pessoas/lista');
  },

  obter(id) {
    return request(`/api/pessoas/${id}`);
  },

  criar(data) {
    return request('/api/pessoas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  atualizar(id, data) {
    return request(`/api/pessoas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  atualizarNotas(id, notas) {
    return request(`/api/pessoas/${id}/notas`, {
      method: 'PUT',
      body: JSON.stringify({ notas }),
    });
  },

  desativar(id) {
    return request(`/api/pessoas/${id}`, {
      method: 'DELETE',
    });
  },

  convidar(id) {
    return request(`/api/pessoas/${id}/convidar`, {
      method: 'POST',
    });
  },

  definirSenha(id, senha) {
    return request(`/api/pessoas/${id}/definir-senha`, {
      method: 'POST',
      body: JSON.stringify({ senha }),
    });
  },
};
