import { request } from './client.js';

export const demandasApi = {
  listar(params = {}) {
    const sp = new URLSearchParams();
    if (params.ativas === true) sp.set('ativas', 'true');
    if (params.etapa != null && params.etapa !== '') sp.set('etapa', params.etapa);
    if (params.de) sp.set('de', params.de);
    if (params.ate) sp.set('ate', params.ate);
    if (params.empreendimentoId != null) sp.set('empreendimentoId', params.empreendimentoId);
    if (params.tipo != null) sp.set('tipo', params.tipo);
    if (params.prioridade != null && params.prioridade !== '') sp.set('prioridade', params.prioridade);
    if (params.responsavelId != null && params.responsavelId !== '') sp.set('responsavelId', params.responsavelId);
    const q = sp.toString();
    return request(`/api/demandas${q ? `?${q}` : ''}`);
  },

  priorizar(id, data) {
    return request(`/api/demandas/${id}/priorizar`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  pegar(id) {
    return request(`/api/demandas/${id}/pegar`, {
      method: 'POST',
    });
  },

  listarAtivas() {
    return request('/api/demandas/ativas');
  },

  listarEmRisco() {
    return request('/api/demandas/risco');
  },

  proximosPrazos(dias = 7) {
    return request(`/api/demandas/proximos-prazos?dias=${dias}`);
  },

  obter(id) {
    return request(`/api/demandas/${id}`);
  },

  criar(data) {
    return request('/api/demandas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  atualizar(id, data) {
    return request(`/api/demandas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  atualizarStatus(id, status) {
    return request(`/api/demandas/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  atualizarEtapa(id, etapa) {
    return request(`/api/demandas/${id}/etapa`, {
      method: 'PUT',
      body: JSON.stringify({ etapa }),
    });
  },

  concluir(id) {
    return request(`/api/demandas/${id}/concluir`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  },

  atualizacoes(demandaId) {
    return request(`/api/demandas/${demandaId}/atualizacoes`);
  },

  criarAtualizacao(demandaId, texto) {
    return request(`/api/demandas/${demandaId}/atualizacoes`, {
      method: 'POST',
      body: JSON.stringify({ texto }),
    });
  },

  comentarios(demandaId) {
    return request(`/api/comentarios?demanda_id=${demandaId}`);
  },

  criarComentario(data) {
    return request('/api/comentarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  excluirComentario(id) {
    return request(`/api/comentarios/${id}`, { method: 'DELETE' });
  },
};
