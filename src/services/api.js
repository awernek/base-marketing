const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let message = errorBody || `Erro ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed?.message) message = parsed.message;
    } catch {
      if (errorBody && errorBody.length < 200) message = errorBody;
    }
    const error = new Error(message);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  return response.json();
}

// ─── Auth ───────────────────────────────────────────────
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

  async solicitarCodigo(email) {
    const res = await fetch(`${BASE_URL}/api/auth/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const txt = await res.text();
      let message = txt || `Erro ${res.status}`;
      try {
        const parsed = JSON.parse(txt);
        if (parsed?.message) message = parsed.message;
      } catch {
        if (txt && txt.length < 200) message = txt;
      }
      throw new Error(message);
    }
    return res.json();
  },

  async definirSenha(email, codigo, senha) {
    const res = await fetch(`${BASE_URL}/api/auth/definir-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo, senha }),
    });
    if (!res.ok) {
      const txt = await res.text();
      let message = txt || `Erro ${res.status}`;
      try {
        const parsed = JSON.parse(txt);
        if (parsed?.message) message = parsed.message;
      } catch {
        if (txt && txt.length < 200) message = txt;
      }
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return res.json();
  },
};

// ─── Pessoas ────────────────────────────────────────────
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

  /** Envia convite para a pessoa virar Designer: cria usuário vinculado a esta Pessoa e envia código por email. */
  convidar(id) {
    return request(`/api/pessoas/${id}/convidar`, {
      method: 'POST',
    });
  },

  /** Define/redefine senha do Designer vinculado à pessoa (sem email). Requer backend: POST /api/pessoas/{id}/definir-senha */
  definirSenha(id, senha) {
    return request(`/api/pessoas/${id}/definir-senha`, {
      method: 'POST',
      body: JSON.stringify({ senha }),
    });
  },
};

// ─── Empreendimentos ────────────────────────────────────
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

// ─── Demandas ───────────────────────────────────────────
export const demandasApi = {
  listar(params = {}) {
    const sp = new URLSearchParams();
    if (params.ativas === true) sp.set('ativas', 'true');
    if (params.de) sp.set('de', params.de);
    if (params.ate) sp.set('ate', params.ate);
    if (params.empreendimentoId != null) sp.set('empreendimentoId', params.empreendimentoId);
    if (params.tipo != null) sp.set('tipo', params.tipo);
    if (params.prioridade != null && params.prioridade !== '') sp.set('prioridade', params.prioridade);
    if (params.responsavelId != null && params.responsavelId !== '') sp.set('responsavelId', params.responsavelId);
    if (params.de) sp.set('de', params.de);
    if (params.ate) sp.set('ate', params.ate);
    const q = sp.toString();
    return request(`/api/demandas${q ? `?${q}` : ''}`);
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

  // Comentários (Sprint 2 — nova API)
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

// ─── Check-ins ──────────────────────────────────────────
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

// ─── Dashboard ──────────────────────────────────────────
export const dashboardApi = {
  overview() {
    return request('/api/dashboard/overview');
  },
};

// ─── Relatórios ────────────────────────────────────────
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
