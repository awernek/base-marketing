import { request } from './client.js';

export const empreendimentosApi = {
  listar(apenasAtivos = false) {
    const query = apenasAtivos ? '?apenasAtivos=true' : '';
    return request(`/api/empreendimentos${query}`);
  },

  listaEnxuta() {
    return request('/api/empreendimentos/lista');
  },

  obter(id) {
    return request(`/api/empreendimentos/${id}`);
  },

  criar(data) {
    return request('/api/empreendimentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  atualizar(id, data) {
    return request(`/api/empreendimentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  desativar(id) {
    return request(`/api/empreendimentos/${id}`, {
      method: 'DELETE',
    });
  },
};
