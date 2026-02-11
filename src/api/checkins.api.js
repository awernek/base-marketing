import { request } from './client.js';

export const checkinsApi = {
  listar(semanaAtual = false) {
    const query = semanaAtual ? '?semanaAtual=true' : '';
    return request(`/api/checkins${query}`);
  },

  semanaAtual() {
    return request('/api/checkins/semana-atual');
  },

  porPessoa(pessoaId) {
    return request(`/api/checkins/pessoa/${pessoaId}`);
  },

  criar(data) {
    return request('/api/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
