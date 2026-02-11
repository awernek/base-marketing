-- Migração Sprint 3: coluna etapa (Kanban)
-- Execute uma vez no SQL Editor do Supabase.

ALTER TABLE demandas
  ADD COLUMN etapa TEXT NOT NULL DEFAULT 'a_fazer';

ALTER TABLE demandas
  ADD CONSTRAINT demandas_etapa_check
  CHECK (etapa IN ('a_fazer', 'em_andamento', 'em_revisao', 'concluido'));

UPDATE demandas SET etapa = 'concluido' WHERE concluida = true;

CREATE INDEX IF NOT EXISTS idx_demandas_etapa ON demandas (etapa);
