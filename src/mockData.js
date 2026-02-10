// Dados mockados para desenvolvimento

export const mockPessoas = [
  {
    id: 1,
    nome: 'Ana Silva',
    email: 'ana@genesis.com.br',
    cargaAtual: 'media',
    demandasAtivas: 2,
    ultimoCheckIn: {
      carga: 'media',
      bloqueio: null,
      data: '2026-02-10'
    },
    notasCoordenacao: 'Muito boa em posts para redes sociais. Gosta de trabalhar com institucional.'
  },
  {
    id: 2,
    nome: 'Bruno Costa',
    email: 'bruno@genesis.com.br',
    cargaAtual: 'baixa',
    demandasAtivas: 1,
    ultimoCheckIn: {
      carga: 'baixa',
      bloqueio: null,
      data: '2026-02-10'
    },
    notasCoordenacao: 'Excelente em motion design. Pode pegar mais demandas.'
  },
  {
    id: 3,
    nome: 'Carol Mendes',
    email: 'carol@genesis.com.br',
    cargaAtual: 'alta',
    demandasAtivas: 4,
    ultimoCheckIn: {
      carga: 'alta',
      bloqueio: 'Cliente do Horizonte mudou briefing 2x, tá difícil fechar a campanha',
      data: '2026-02-10'
    },
    notasCoordenacao: 'Carol tá pegando muita demanda urgente. Conversar sexta sobre redistribuir carga. Ela é muito boa em campanhas de venda.'
  },
  {
    id: 4,
    nome: 'Diego Alves',
    email: 'diego@genesis.com.br',
    cargaAtual: 'baixa',
    demandasAtivas: 1,
    ultimoCheckIn: {
      carga: 'baixa',
      bloqueio: null,
      data: '2026-02-10'
    },
    notasCoordenacao: 'Novo no time, ainda pegando o ritmo.'
  },
  {
    id: 5,
    nome: 'Elisa Rocha',
    email: 'elisa@genesis.com.br',
    cargaAtual: 'media',
    demandasAtivas: 3,
    ultimoCheckIn: {
      carga: 'media',
      bloqueio: 'Preciso do feedback do comercial para fechar a landing do Parque Sul',
      data: '2026-02-10'
    },
    notasCoordenacao: 'Organizada e proativa. Boa em landings.'
  }
];

export const mockDemandas = [
  {
    id: 1,
    titulo: 'Campanha Lançamento Residencial Horizonte',
    tipo: 'campanha',
    responsavelId: 3,
    responsavel: 'Carol Mendes',
    prazo: '2026-02-12',
    impacto: 'venda',
    status: 'risco',
    concluida: false,
    criadaEm: '2026-02-03'
  },
  {
    id: 2,
    titulo: 'Posts redes — Empreendimento Parque Sul',
    tipo: 'post',
    responsavelId: 1,
    responsavel: 'Ana Silva',
    prazo: '2026-02-18',
    impacto: 'lead',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-05'
  },
  {
    id: 3,
    titulo: 'Landing page Parque Sul',
    tipo: 'landing',
    responsavelId: 5,
    responsavel: 'Elisa Rocha',
    prazo: '2026-02-15',
    impacto: 'lead',
    status: 'atencao',
    concluida: false,
    criadaEm: '2026-02-01'
  },
  {
    id: 4,
    titulo: 'Material institucional — Relatório ESG',
    tipo: 'institucional',
    responsavelId: 1,
    responsavel: 'Ana Silva',
    prazo: '2026-02-25',
    impacto: 'institucional',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-07'
  },
  {
    id: 5,
    titulo: 'Vídeo tour virtual — Residencial Altos da Serra',
    tipo: 'campanha',
    responsavelId: 2,
    responsavel: 'Bruno Costa',
    prazo: '2026-02-20',
    impacto: 'venda',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-04'
  },
  {
    id: 6,
    titulo: 'Stories Instagram — Obras em andamento',
    tipo: 'post',
    responsavelId: 3,
    responsavel: 'Carol Mendes',
    prazo: '2026-02-11',
    impacto: 'institucional',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-08'
  },
  {
    id: 7,
    titulo: 'E-mail marketing lançamento',
    tipo: 'campanha',
    responsavelId: 3,
    responsavel: 'Carol Mendes',
    prazo: '2026-02-13',
    impacto: 'lead',
    status: 'atencao',
    concluida: false,
    criadaEm: '2026-02-06'
  },
  {
    id: 8,
    titulo: 'Banner site — Black Friday imóveis',
    tipo: 'campanha',
    responsavelId: 3,
    responsavel: 'Carol Mendes',
    prazo: '2026-02-14',
    impacto: 'venda',
    status: 'atencao',
    concluida: false,
    criadaEm: '2026-02-09'
  },
  {
    id: 9,
    titulo: 'Apresentação comercial — Q1 2026',
    tipo: 'institucional',
    responsavelId: 5,
    responsavel: 'Elisa Rocha',
    prazo: '2026-02-28',
    impacto: 'institucional',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-02'
  },
  {
    id: 10,
    titulo: 'Peças gráficas stand — Feira Imobiliária',
    tipo: 'campanha',
    responsavelId: 5,
    responsavel: 'Elisa Rocha',
    prazo: '2026-02-22',
    impacto: 'lead',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-01'
  },
  {
    id: 11,
    titulo: 'Infográfico — Diferenciais construtivos',
    tipo: 'post',
    responsavelId: 4,
    responsavel: 'Diego Alves',
    prazo: '2026-02-24',
    impacto: 'institucional',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-10'
  },
  {
    id: 12,
    titulo: 'Carrossel LinkedIn — Cases de sucesso',
    tipo: 'post',
    responsavelId: 1,
    responsavel: 'Ana Silva',
    prazo: '2026-02-17',
    impacto: 'lead',
    status: 'ok',
    concluida: false,
    criadaEm: '2026-02-08'
  }
];

// Função auxiliar para obter cor do semáforo
export const getCargaColor = (carga) => {
  switch (carga) {
    case 'baixa': return 'text-green-600';
    case 'media': return 'text-yellow-600';
    case 'alta': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getCargaEmoji = (carga) => {
  switch (carga) {
    case 'baixa': return '🟢';
    case 'media': return '🟡';
    case 'alta': return '🔴';
    default: return '⚪';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'ok': return 'text-green-600';
    case 'atencao': return 'text-yellow-600';
    case 'risco': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getStatusEmoji = (status) => {
  switch (status) {
    case 'ok': return '🟢';
    case 'atencao': return '🟡';
    case 'risco': return '🔴';
    default: return '⚪';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'ok': return 'OK';
    case 'atencao': return 'Atenção';
    case 'risco': return 'Risco';
    default: return '';
  }
};

export const getTipoLabel = (tipo) => {
  const labels = {
    post: 'Post',
    campanha: 'Campanha',
    landing: 'Landing',
    institucional: 'Institucional',
    outro: 'Outro'
  };
  return labels[tipo] || tipo;
};

export const getImpactoLabel = (impacto) => {
  const labels = {
    venda: 'Venda',
    lead: 'Lead',
    institucional: 'Institucional'
  };
  return labels[impacto] || impacto;
};
