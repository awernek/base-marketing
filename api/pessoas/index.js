import { supabase } from '../../_lib/supabase.js';
import { getUserFromRequest, TipoUsuario } from '../../_lib/auth.js';
import {
  cors, json, created, badRequest, unauthorized, forbidden,
  serverError, allowMethods,
} from '../../_lib/response.js';

// GET /api/pessoas        → listar
// POST /api/pessoas       → criar
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);
  if (user.tipo !== TipoUsuario.COORDENADOR) return forbidden(res);

  try {
    if (req.method === 'GET') {
      // Buscar pessoas com carga da semana e demandas ativas
      const { data: pessoas, error } = await supabase
        .from('pessoas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) return serverError(res, error);

      // Buscar carga da semana atual
      const { data: cargas } = await supabase
        .from('vw_carga_semana')
        .select('*');
      const cargaMap = new Map((cargas || []).map(c => [c.pessoa_id, c]));

      // Contar demandas ativas por responsável
      const { data: demandas } = await supabase
        .from('demandas')
        .select('responsavel_id')
        .eq('concluida', false);

      const demandasCount = {};
      (demandas || []).forEach(d => {
        demandasCount[d.responsavel_id] = (demandasCount[d.responsavel_id] || 0) + 1;
      });

      const cargaLabels = { 0: 'Baixa', 1: 'Media', 2: 'Alta' };

      const resultado = pessoas.map(p => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        ativo: p.ativo,
        notasCoordenacao: p.notas_coordenacao,
        cargaAtual: cargaMap.has(p.id) ? cargaLabels[cargaMap.get(p.id).carga] || '' : '',
        demandasAtivas: demandasCount[p.id] || 0,
      }));

      return json(res, resultado);
    }

    // POST — criar pessoa
    const { nome, email, notasCoordenacao } = req.body || {};
    if (!nome) return badRequest(res, 'Nome é obrigatório.');

    const { data: pessoa, error } = await supabase
      .from('pessoas')
      .insert({
        nome,
        email: email || null,
        notas_coordenacao: notasCoordenacao || null,
      })
      .select()
      .single();

    if (error) return serverError(res, error);

    return created(res, {
      id: pessoa.id,
      nome: pessoa.nome,
      email: pessoa.email,
      ativo: pessoa.ativo,
      notasCoordenacao: pessoa.notas_coordenacao,
      cargaAtual: '',
      demandasAtivas: 0,
    }, `/api/pessoas/${pessoa.id}`);
  } catch (err) {
    return serverError(res, err);
  }
}
