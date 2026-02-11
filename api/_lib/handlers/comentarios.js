import { supabase } from '../supabase.js';
import { TipoUsuario } from '../auth.js';
import {
  json, created, noContent, badRequest, forbidden,
  notFound, serverError,
} from '../response.js';

function fmt(c, usuario = {}, podeExcluir = false) {
  return {
    id: c.id,
    demandaId: c.demanda_id,
    usuarioId: c.usuario_id,
    usuario: { nome: usuario.nome ?? 'Coordenador', email: usuario.email ?? '' },
    texto: c.texto,
    anexoUrl: c.anexo_url ?? null,
    createdAt: c.created_at,
    podeExcluir,
  };
}

/**
 * GET /api/comentarios?demanda_id=XXX
 * Lista comentários da demanda. Usuário deve ser coordenador ou responsável pela demanda.
 */
export async function listar(req, res, params, user) {
  const demandaId = parseInt(req.query.demanda_id, 10);
  if (isNaN(demandaId)) return badRequest(res, 'demanda_id é obrigatório.');

  const { data: demanda } = await supabase.from('demandas').select('responsavel_id').eq('id', demandaId).single();
  if (!demanda) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && demanda.responsavel_id !== user.pessoaId) {
    return forbidden(res);
  }

  const { data: rows, error } = await supabase
    .from('comentarios')
    .select('id, demanda_id, usuario_id, texto, anexo_url, created_at')
    .eq('demanda_id', demandaId)
    .order('created_at', { ascending: true });
  if (error) return serverError(res, error);

  const userIds = [...new Set((rows || []).map(r => r.usuario_id))];
  if (userIds.length === 0) return json(res, []);

  const { data: usuarios } = await supabase.from('usuarios').select('id, email, pessoa_id').in('id', userIds);
  const pessoaIds = [...new Set((usuarios || []).map(u => u.pessoa_id).filter(Boolean))];
  let pessoasMap = {};
  if (pessoaIds.length > 0) {
    const { data: pessoas } = await supabase.from('pessoas').select('id, nome').in('id', pessoaIds);
    pessoasMap = (pessoas || []).reduce((acc, p) => ({ ...acc, [p.id]: p.nome }), {});
  }
  const usuarioMap = (usuarios || []).reduce((acc, u) => ({
    ...acc,
    [u.id]: { email: u.email, nome: u.pessoa_id ? pessoasMap[u.pessoa_id] ?? null : null },
  }), {});

  const list = (rows || []).map(c => {
    const podeExcluir = c.usuario_id === user.userId || user.tipo === TipoUsuario.COORDENADOR;
    return fmt(c, usuarioMap[c.usuario_id], podeExcluir);
  });
  return json(res, list);
}

/**
 * POST /api/comentarios
 * Body: { demandaId, texto, anexoUrl? }
 */
export async function criar(req, res, params, user) {
  const b = req.body || {};
  const demandaId = parseInt(b.demandaId, 10);
  if (isNaN(demandaId)) return badRequest(res, 'demandaId é obrigatório.');
  if (!b.texto || typeof b.texto !== 'string' || !b.texto.trim()) return badRequest(res, 'Texto é obrigatório.');

  const { data: demanda } = await supabase.from('demandas').select('responsavel_id').eq('id', demandaId).single();
  if (!demanda) return notFound(res, 'Demanda não encontrada.');
  if (user.tipo === TipoUsuario.DESIGNER && demanda.responsavel_id !== user.pessoaId) {
    return forbidden(res);
  }

  const { data, error } = await supabase
    .from('comentarios')
    .insert({
      demanda_id: demandaId,
      usuario_id: user.userId,
      texto: b.texto.trim(),
      anexo_url: b.anexoUrl?.trim() || null,
    })
    .select('id, demanda_id, usuario_id, texto, anexo_url, created_at')
    .single();
  if (error) return serverError(res, error);

  const usuario = { nome: user.tipo === TipoUsuario.DESIGNER ? null : 'Coordenador', email: user.email ?? '' };
  if (user.pessoaId) {
    const { data: p } = await supabase.from('pessoas').select('nome').eq('id', user.pessoaId).single();
    if (p) usuario.nome = p.nome;
  }
  return created(res, fmt(data, usuario, true), `/api/comentarios/${data.id}`);
}

/**
 * DELETE /api/comentarios/:id
 * Apenas o autor do comentário ou coordenador.
 */
export async function remover(req, res, params, user) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return badRequest(res, 'ID inválido.');

  const { data: c, error: errFetch } = await supabase.from('comentarios').select('usuario_id').eq('id', id).single();
  if (errFetch || !c) return notFound(res, 'Comentário não encontrado.');
  if (user.tipo !== TipoUsuario.COORDENADOR && c.usuario_id !== user.userId) {
    return forbidden(res);
  }

  const { error } = await supabase.from('comentarios').delete().eq('id', id);
  if (error) return serverError(res, error);
  return noContent(res);
}
