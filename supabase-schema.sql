-- ============================================================
-- Base Marketing — Schema Supabase (PostgreSQL)
-- Execute este script no SQL Editor do Supabase Dashboard.
-- ============================================================

-- ─── Extensões ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ─── Tabela: usuarios ───────────────────────────────────
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,
  tipo        SMALLINT NOT NULL DEFAULT 0,
    -- 0 = Coordenador, 1 = Designer
  pessoa_id   INT NULL,
    -- Preenchido quando tipo = 1 (Designer), referencia pessoas.id
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: codigos_acesso (ativação por email) ────────
CREATE TABLE codigos_acesso (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  codigo      TEXT NOT NULL,
  tentativas  SMALLINT NOT NULL DEFAULT 0,
  usado       BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);
CREATE INDEX idx_codigos_email ON codigos_acesso (email, usado, expira_em);

-- ─── Tabela: pessoas ────────────────────────────────────
CREATE TABLE pessoas (
  id                 SERIAL PRIMARY KEY,
  nome               TEXT NOT NULL,
  email              TEXT,
  ativo              BOOLEAN NOT NULL DEFAULT TRUE,
  notas_coordenacao  TEXT,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK: usuarios.pessoa_id → pessoas.id
ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_pessoa
  FOREIGN KEY (pessoa_id) REFERENCES pessoas (id);

-- ─── Tabela: empreendimentos ────────────────────────────
CREATE TABLE empreendimentos (
  id     SERIAL PRIMARY KEY,
  nome   TEXT NOT NULL,
  ativo  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── Tabela: demandas ───────────────────────────────────
CREATE TABLE demandas (
  id                  SERIAL PRIMARY KEY,
  titulo              TEXT NOT NULL,
  descricao           TEXT,
  tipo                SMALLINT NOT NULL DEFAULT 0,
    -- 0 Post, 1 Campanha, 2 Landing, 3 Institucional, 4 Outro
  responsavel_id      INT NOT NULL REFERENCES pessoas (id),
  prazo               TIMESTAMPTZ NOT NULL,
  impacto             SMALLINT NOT NULL DEFAULT 0,
    -- 0 Venda, 1 Lead, 2 Institucional
  status              SMALLINT NOT NULL DEFAULT 0,
    -- 0 OK, 1 Atencao, 2 Risco
  etapa               TEXT NOT NULL DEFAULT 'a_fazer' CHECK (etapa IN ('a_fazer', 'em_andamento', 'em_revisao', 'concluido')),
    -- Kanban (Sprint 3)
  prioridade          SMALLINT NOT NULL DEFAULT 1,
    -- 0 Alta, 1 Media, 2 Baixa
  ordem               INT,
  link                TEXT,
  empreendimento_id   INT REFERENCES empreendimentos (id),
  concluida           BOOLEAN NOT NULL DEFAULT FALSE,
  criada_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizada_em       TIMESTAMPTZ
);
CREATE INDEX idx_demandas_responsavel ON demandas (responsavel_id);
CREATE INDEX idx_demandas_prazo       ON demandas (prazo);
CREATE INDEX idx_demandas_concluida   ON demandas (concluida);
CREATE INDEX idx_demandas_prioridade  ON demandas (prioridade);
CREATE INDEX idx_demandas_etapa       ON demandas (etapa);

-- ─── Tabela: atualizacoes_demanda ───────────────────────
CREATE TABLE atualizacoes_demanda (
  id          SERIAL PRIMARY KEY,
  demanda_id  INT NOT NULL REFERENCES demandas (id) ON DELETE CASCADE,
  pessoa_id   INT REFERENCES pessoas (id),
    -- null quando o autor é coordenador
  texto       TEXT NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_atualizacoes_demanda ON atualizacoes_demanda (demanda_id);

-- ─── Tabela: comentarios (Sprint 2) ──────────────────────
CREATE TABLE comentarios (
  id          SERIAL PRIMARY KEY,
  demanda_id  INT NOT NULL REFERENCES demandas (id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES usuarios (id),
  texto       TEXT NOT NULL,
  anexo_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comentarios_demanda ON comentarios (demanda_id);
CREATE INDEX idx_comentarios_created ON comentarios (created_at DESC);

-- ─── Tabela: checkins ───────────────────────────────────
CREATE TABLE checkins (
  id         SERIAL PRIMARY KEY,
  pessoa_id  INT NOT NULL REFERENCES pessoas (id),
  data       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  carga      SMALLINT NOT NULL DEFAULT 0,
    -- 0 Baixa, 1 Media, 2 Alta
  bloqueio   TEXT,
  UNIQUE (pessoa_id, data)
    -- Controle de 1 por semana será feito na aplicação
    -- (verifica se já existe check-in na mesma semana)
);
CREATE INDEX idx_checkins_pessoa ON checkins (pessoa_id);
CREATE INDEX idx_checkins_data   ON checkins (data);

-- ─── Trigger: atualizada_em automático em demandas ──────
CREATE OR REPLACE FUNCTION set_atualizada_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizada_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_demandas_atualizada_em
  BEFORE UPDATE ON demandas
  FOR EACH ROW
  EXECUTE FUNCTION set_atualizada_em();

-- ─── View auxiliar: carga atual por pessoa (semana) ─────
-- Retorna o check-in mais recente da semana (seg-dom) de cada pessoa.
CREATE OR REPLACE VIEW vw_carga_semana AS
SELECT DISTINCT ON (c.pessoa_id)
  c.pessoa_id,
  c.carga,
  c.bloqueio,
  c.data
FROM checkins c
WHERE c.data >= date_trunc('week', NOW())        -- segunda-feira
  AND c.data <  date_trunc('week', NOW()) + INTERVAL '7 days'
ORDER BY c.pessoa_id, c.data DESC;
