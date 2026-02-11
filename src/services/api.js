/**
 * Barrel: reexporta todos os módulos de API.
 * Importe daqui para manter compatibilidade; internamente a lógica está em src/api/*.api.js
 */
export { authApi } from '../api/auth.api.js';
export { pessoasApi } from '../api/pessoas.api.js';
export { empreendimentosApi } from '../api/empreendimentos.api.js';
export { demandasApi } from '../api/demandas.api.js';
export { checkinsApi } from '../api/checkins.api.js';
export { dashboardApi } from '../api/dashboard.api.js';
export { relatoriosApi } from '../api/relatorios.api.js';
