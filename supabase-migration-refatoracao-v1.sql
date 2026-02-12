-- ============================================================
-- Migração Refatoração v1 (Sprint 1)
-- Novo fluxo: Aguardando Priorização, responsável opcional,
-- criado_por, prioridade/prazo opcionais.
-- Execute uma vez no SQL Editor do Supabase.
-- ============================================================

-- 1) Etapa "aguardando_priorizacao"
-- Nome do constraint pode variar; se falhar, verifique com:
--   SELECT conname FROM pg_constraint WHERE conrelid = 'demandas'::regclass AND contype = 'c';
ALTER TABLE demandas
  DROP CONSTRAINT IF EXISTS demandas_etapa_check;

ALTER TABLE demandas
  ADD CONSTRAINT demandas_etapa_check
  CHECK (etapa IN ('aguardando_priorizacao', 'a_fazer', 'em_andamento', 'em_revisao', 'concluido'));

ALTER TABLE demandas
  ALTER COLUMN etapa SET DEFAULT 'aguardando_priorizacao';

-- 2) Responsável opcional (demandas novas ou "disponíveis" podem não ter responsável)
ALTER TABLE demandas
  ALTER COLUMN responsavel_id DROP NOT NULL;

-- 3) Prazo opcional na criação (obrigatório apenas após priorização, se desejado)
ALTER TABLE demandas
  ALTER COLUMN prazo DROP NOT NULL;

-- 4) Prioridade opcional até o coordenador priorizar
ALTER TABLE demandas
  ALTER COLUMN prioridade DROP NOT NULL;

ALTER TABLE demandas
  ALTER COLUMN prioridade SET DEFAULT NULL;

-- 5) Criado por (auditoria; quem criou a demanda)
ALTER TABLE demandas
  ADD COLUMN IF NOT EXISTS criada_por_usuario_id UUID REFERENCES usuarios (id);

COMMENT ON COLUMN demandas.criada_por_usuario_id IS 'Usuário que criou a demanda (coordenador ou designer)';

-- Índice para filtros por criador (opcional)
CREATE INDEX IF NOT EXISTS idx_demandas_criada_por ON demandas (criada_por_usuario_id);

-- Tipos de demanda: mantemos 0-4 (SMALLINT). Os labels mudam no frontend (Sprint 3):
-- 0 Nova Peça, 1 Alteração, 2 Campanha, 3 Ajuste Interno, 4 Ideia
-- Nenhuma alteração de schema necessária para tipos.
