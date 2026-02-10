import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET é obrigatória.');

/**
 * Gera um JWT com payload { userId, email, tipo, pessoaId }.
 * Expira em 7 dias.
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifica e decodifica o token JWT.
 * Retorna o payload ou null se inválido/expirado.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware: extrai e valida o Bearer token do header Authorization.
 * Retorna o payload do usuário ou null.
 */
export function getUserFromRequest(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Constantes de tipo de usuário (espelho do enum do frontend).
 */
export const TipoUsuario = { COORDENADOR: 0, DESIGNER: 1 };
