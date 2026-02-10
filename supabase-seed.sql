-- ============================================================
-- Seed de dados iniciais — Base Marketing
-- Execute DEPOIS do supabase-schema.sql
-- ============================================================

-- ─── Pessoas (equipe de design) ─────────────────────────
INSERT INTO pessoas (nome, email, notas_coordenacao) VALUES
  ('Ana Silva',    'ana@basemkt.com',    'Especialista em campanhas'),
  ('Bruno Costa',  'bruno@basemkt.com',  'Foco em landing pages'),
  ('Carla Souza',  'carla@basemkt.com',  NULL);

-- ─── Empreendimentos ───────────────────────────────────
INSERT INTO empreendimentos (nome) VALUES
  ('Reserva Park'),
  ('Villa Nova'),
  ('Horizonte Residencial');

-- ─── Usuário coordenador de teste ───────────────────────
-- Email: admin@basemkt.com  |  Senha: admin123
-- Hash bcrypt gerado com custo 10
INSERT INTO usuarios (email, senha_hash, tipo, pessoa_id) VALUES
  ('admin@basemkt.com',
   '$2b$10$BFj8y7lCbtFwzHODMHUIfe34cdytB0pvBQBElOQHpKDdPECT4u7ta',
   0,  -- Coordenador
   NULL);

-- ─── Demandas de exemplo ────────────────────────────────
INSERT INTO demandas (titulo, descricao, tipo, responsavel_id, prazo, impacto, status, prioridade, empreendimento_id) VALUES
  ('Post Instagram - Lançamento',
   'Post para feed sobre o lançamento do Reserva Park',
   0, 1, NOW() + INTERVAL '3 days', 0, 0, 0, 1),

  ('Campanha Google Ads',
   'Peças para campanha de leads Villa Nova',
   1, 2, NOW() + INTERVAL '7 days', 1, 1, 1, 2),

  ('Landing Page Horizonte',
   'LP de captura para o empreendimento Horizonte',
   2, 1, NOW() + INTERVAL '2 days', 0, 2, 0, 3);

-- ─── Check-in da semana (Ana) ───────────────────────────
INSERT INTO checkins (pessoa_id, carga, bloqueio) VALUES
  (1, 2, 'Muitas demandas acumuladas');
