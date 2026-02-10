import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, noContent, badRequest, unauthorized, forbidden,
  notFound, serverError, allowMethods,
} from '../../_lib/response.js';

// GET    /api/pessoas/:id   → detalhe
// PUT    /api/pessoas/:id   → atualizar
// DELETE /api/pessoas/:id   → desativar (soft)
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'PUT', 'DELETE'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  const { id } = req.query;
  const pessoaId = parseInt(id, 10);
  if (isNaN(pessoaId)) return badRequest(res, 'ID inválido.');

  try {
    if (req.method === 'GET') {
      const { data: pessoa, error } = await supabase
        .from('pessoas')
        .select('*')
        .eq('id', pessoaId)
        .single();

      if (error || !pessoa) return notFound(res, 'Pessoa não encontrada.');

      // Carga da semana
      const { data: carga } = await supabase
        .from('vw_carga_semana')
        .select('carga')
        .eq('pessoa_id', pessoaId)
        .single();

      // Demandas ativas
      const { count } = await supabase
        .from('demandas')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_id', pessoaId)
        .eq('concluida', false);

      const cargaLabels = { 0: 'Baixa', 1: 'Media', 2: 'Alta' };

      return json(res, {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        ativo: pessoa.ativo,
        notasCoordenacao: pessoa.notas_coordenacao,
        cargaAtual: carga ? cargaLabels[carga.carga] || '' : '',
        demandasAtivas: count || 0,
      });
    }

    if (req.method === 'PUT') {
      const { nome, email, notasCoordenacao, ativo } = req.body || {};

      const { error } = await supabase
        .from('pessoas')
        .update({
          nome,
          email: email || null,
          notas_coordenacao: notasCoordenacao ?? null,
          ativo: ativo ?? true,
        })
        .eq('id', pessoaId);

      if (error) return serverError(res, error);
      return noContent(res);
    }

    // DELETE — soft delete
    const { error } = await supabase
      .from('pessoas')
      .update({ ativo: false })
      .eq('id', pessoaId);

    if (error) return serverError(res, error);
    return noContent(res);
  } catch (err) {
    return serverError(res, err);
  }
}
