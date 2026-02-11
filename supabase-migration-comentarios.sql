-- Migração Sprint 2: tabela comentarios
-- Execute no SQL Editor do Supabase se o banco já existir (não reexecute o schema inteiro).

CREATE TABLE IF NOT EXISTS comentarios (
  id          SERIAL PRIMARY KEY,
  demanda_id  INT NOT NULL REFERENCES demandas (id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES usuarios (id),
  texto       TEXT NOT NULL,
  anexo_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comentarios_demanda ON comentarios (demanda_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created ON comentarios (created_at DESC);
