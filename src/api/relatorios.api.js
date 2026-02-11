import { request } from './client.js';

export const relatoriosApi = {
  demandasConcluidas(params = {}) {
    const sp = new URLSearchParams();
    if (params.de) sp.set('de', params.de);
    if (params.ate) sp.set('ate', params.ate);
    if (params.responsavelId != null) sp.set('responsavelId', params.responsavelId);
    if (params.empreendimentoId != null) sp.set('empreendimentoId', params.empreendimentoId);
    const q = sp.toString();
    return request(`/api/relatorios/demandas-concluidas${q ? `?${q}` : ''}`);
  },
};
