/**
 * Helpers para respostas HTTP padronizadas nas API routes.
 */

export function json(res, data, status = 200) {
  return res.status(status).json(data);
}

export function created(res, data, location) {
  if (location) res.setHeader('Location', location);
  return res.status(201).json(data);
}

export function noContent(res) {
  return res.status(204).end();
}

export function badRequest(res, message = 'Requisição inválida.') {
  return res.status(400).json({ message });
}

export function unauthorized(res, message = 'Não autenticado.') {
  return res.status(401).json({ message });
}

export function forbidden(res, message = 'Sem permissão.') {
  return res.status(403).json({ message });
}

export function notFound(res, message = 'Não encontrado.') {
  return res.status(404).json({ message });
}

export function methodNotAllowed(res) {
  return res.status(405).json({ message: 'Método não permitido.' });
}

export function serverError(res, err) {
  console.error('[API Error]', err);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

/**
 * Helper para permitir apenas certos métodos HTTP.
 * Retorna true se o método é permitido, false se enviou 405.
 */
export function allowMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    methodNotAllowed(res);
    return false;
  }
  return true;
}

/**
 * CORS headers para todas as rotas.
 */
export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // handled
  }
  return false; // continue
}
