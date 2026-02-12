import { getUserFromRequest, TipoUsuario } from './auth.js';
import { cors, unauthorized, notFound, methodNotAllowed, serverError } from './response.js';
import * as auth from './handlers/auth.js';
import * as pessoas from './handlers/pessoas.js';
import * as empreendimentos from './handlers/empreendimentos.js';
import * as demandas from './handlers/demandas.js';
import * as comentarios from './handlers/comentarios.js';
import * as checkins from './handlers/checkins.js';
import * as dashboard from './handlers/dashboard.js';
import * as relatorios from './handlers/relatorios.js';

/**
 * Simple path matcher – extracts params from patterns like
 * "/api/pessoas/:id/notas" → { id: "5" }
 */
function matchPath(pattern, pathname) {
  const pParts = pattern.split('/').filter(Boolean);
  const uParts = pathname.split('/').filter(Boolean);
  if (pParts.length !== uParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) {
      params[pParts[i].slice(1)] = decodeURIComponent(uParts[i]);
    } else if (pParts[i] !== uParts[i]) {
      return null;
    }
  }
  return params;
}

/*
 * Route table: [pattern, method, handler, requiresAuth]
 * If requiresAuth is false the handler receives (req, res) only.
 * Otherwise (req, res, params, user).
 */
const routes = [
  // ── Auth (public) ──────────────────────
  ['api/auth/login',           'POST', auth.login,          false],
  ['api/auth/register',        'POST', auth.register,       false],
  ['api/auth/solicitar-codigo','POST', auth.solicitarCodigo, false],
  ['api/auth/definir-senha',   'POST', auth.definirSenha,   false],

  // ── Pessoas ────────────────────────────
  ['api/pessoas',              'GET',  pessoas.listar,       true],
  ['api/pessoas',              'POST', pessoas.criar,        true],
  ['api/pessoas/lista',        'GET',  pessoas.listaEnxuta,  true],
  ['api/pessoas/:id',          'GET',  pessoas.obter,        true],
  ['api/pessoas/:id',          'PUT',  pessoas.atualizar,    true],
  ['api/pessoas/:id',          'DELETE',pessoas.desativar,   true],
  ['api/pessoas/:id/notas',    'PUT',  pessoas.atualizarNotas,true],
  ['api/pessoas/:id/convidar', 'POST', pessoas.convidar,     true],
  ['api/pessoas/:id/definir-senha','POST',pessoas.pessoaDefinirSenha,true],

  // ── Empreendimentos ────────────────────
  ['api/empreendimentos',      'GET',  empreendimentos.listar,   true],
  ['api/empreendimentos',      'POST', empreendimentos.criar,    true],
  ['api/empreendimentos/lista','GET',  empreendimentos.listaEnxuta,true],
  ['api/empreendimentos/:id',  'GET',  empreendimentos.obter,    true],
  ['api/empreendimentos/:id',  'PUT',  empreendimentos.atualizar,true],
  ['api/empreendimentos/:id',  'DELETE',empreendimentos.desativar,true],

  // ── Demandas ───────────────────────────
  ['api/demandas',             'GET',  demandas.listar,          true],
  ['api/demandas',             'POST', demandas.criar,           true],
  ['api/demandas/ativas',      'GET',  demandas.ativas,          true],
  ['api/demandas/proximos-prazos','GET',demandas.proximosPrazos, true],
  ['api/demandas/risco',       'GET',  demandas.risco,           true],
  ['api/demandas/:id',             'GET',  demandas.obter,           true],
  ['api/demandas/:id',             'PUT',  demandas.atualizar,       true],
  ['api/demandas/:id/priorizar',   'PUT',  demandas.priorizar,       true],
  ['api/demandas/:id/pegar',       'POST', demandas.pegar,           true],
  ['api/demandas/:id/status',      'PUT',  demandas.atualizarStatus, true],
  ['api/demandas/:id/etapa',       'PUT',  demandas.atualizarEtapa,  true],
  ['api/demandas/:id/concluir',    'PUT',  demandas.concluir,        true],
  ['api/demandas/:id/atualizacoes','GET',demandas.listarAtualizacoes,true],
  ['api/demandas/:id/atualizacoes','POST',demandas.criarAtualizacao,true],

  // ── Comentários (Sprint 2) ──────────────
  ['api/comentarios',              'GET',    comentarios.listar,   true],
  ['api/comentarios',              'POST',   comentarios.criar,    true],
  ['api/comentarios/:id',          'DELETE', comentarios.remover,  true],

  // ── Check-ins ──────────────────────────
  ['api/checkins',             'GET',  checkins.listar,      true],
  ['api/checkins',             'POST', checkins.criar,       true],
  ['api/checkins/semana-atual','GET',  checkins.semanaAtual,  true],
  ['api/checkins/pessoa/:pessoaId','GET',checkins.porPessoa,  true],

  // ── Dashboard ──────────────────────────
  ['api/dashboard/overview',   'GET',  dashboard.overview,   true],

  // ── Relatórios ─────────────────────────
  ['api/relatorios/demandas-concluidas','GET',relatorios.demandasConcluidas,true],
];

/**
 * Parse query string from URL
 */
function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const qs = url.slice(idx + 1);
  const params = {};
  for (const pair of qs.split('&')) {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  }
  return params;
}

export async function route(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') return cors(req, res);

  // Standard CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const url = req.url || '/';
  const pathname = url.split('?')[0].replace(/\/+$/, ''); // strip trailing slash
  const method = req.method;

  // Parse query string and attach to req
  req.query = parseQuery(url);

  // Find matching route – try more specific (longer) patterns first
  let matched = null;
  let matchedParams = null;

  for (const [pattern, rMethod, handler, requiresAuth] of routes) {
    if (rMethod !== method) continue;
    const params = matchPath(pattern, pathname);
    if (params !== null) {
      // Prefer exact match (no params) over parameterized, or longer pattern
      if (!matched || pattern.split('/').length > matched[0].split('/').length ||
          (!pattern.includes(':') && matched[0].includes(':'))) {
        matched = [pattern, rMethod, handler, requiresAuth];
        matchedParams = params;
      }
    }
  }

  if (!matched) {
    // Check if the path exists but method doesn't match
    const pathExists = routes.some(([p]) => matchPath(p, pathname) !== null);
    if (pathExists) return methodNotAllowed(res);
    return notFound(res, `Rota não encontrada: ${method} ${pathname}`);
  }

  const [, , handler, requiresAuth] = matched;

  try {
    if (!requiresAuth) {
      return await handler(req, res);
    }

    const user = getUserFromRequest(req);
    if (!user) return unauthorized(res);

    return await handler(req, res, matchedParams, user);
  } catch (err) {
    console.error(`[API ERROR] ${method} ${pathname}:`, err);
    return serverError(res, err);
  }
}
