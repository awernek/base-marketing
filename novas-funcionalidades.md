# 🎯 Base Marketing — Novas Funcionalidades (Organizado em Sprints)

# CONTEXTO DO PROJETO

Você está trabalhando no **Base Marketing**, um sistema de coordenação de times de design/marketing para a Genesis Empreendimentos Imobiliários.

## Stack Atual
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3 + React Router DOM 6
- **Backend:** Vercel Serverless Functions (Node.js) na pasta `api/`
- **Banco:** Supabase (PostgreSQL)
- **Auth:** JWT (localStorage + server-side)
- **Deploy:** Vercel (via GitHub)

## Estrutura Existente
```
├── api/                          # Serverless functions
│   ├── [...path].js              # Handler principal
│   └── _lib/
│       ├── handlers/             # Auth, pessoas, demandas, checkins, etc.
│       ├── supabase.js
│       ├── auth.js
│       └── router.js
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Demandas.jsx
│   │   ├── Calendario.jsx
│   │   ├── Empreendimentos.jsx
│   │   ├── Relatorios.jsx
│   │   └── CheckIn.jsx
│   ├── services/
│   │   └── api.js                # Cliente HTTP
│   └── contexts/
│       └── AuthContext.jsx
└── supabase-schema.sql           # Schema do banco
```

## Tabelas Principais (Supabase)
- `usuarios` (id, email, senha_hash, tipo, pessoa_id)
- `pessoas` (id, nome, email, notas_coordenacao, ativo)
- `empreendimentos` (id, nome, descricao, ativo)
- `demandas` (id, titulo, tipo, responsavel_id, empreendimento_id, prazo, impacto, status, concluida)
- `checkins` (id, pessoa_id, data, carga, bloqueio)

---

# OBJETIVO GERAL

Implementar 3 features principais para aproximar o sistema do **Runrun.it**, organizadas em sprints:

| Sprint | Feature                    | Prioridade |
|--------|----------------------------|------------|
| 1      | Priorização Visual         | 🎯 Base    |
| 2      | Comentários nas Demandas   | 🎯 Alta    |
| 3      | Kanban Board               | 🎯 Alta    |
| 4      | Extras (se der tempo)      | Opcional   |

---

# SPRINT 1 — PRIORIZAÇÃO VISUAL

**Objetivo:** Permitir marcar demandas como Alta/Média/Baixa prioridade e ordenar/filtrar por isso.  
**Duração sugerida:** 1 sprint (base para Kanban e filtros).

## Escopo

- Migração do banco (coluna `prioridade`)
- API atualizada para criar/editar prioridade
- Formulário de demanda com seletor de prioridade
- Badge de prioridade nos cards (lista e depois Kanban)
- Ordenação padrão (alta → média → baixa, depois por prazo)
- Filtro por prioridade

## Tarefas

### 1.1 Migração do banco
```sql
ALTER TABLE demandas 
ADD COLUMN prioridade TEXT DEFAULT 'media' 
CHECK (prioridade IN ('alta', 'media', 'baixa'));

CREATE INDEX idx_demandas_prioridade ON demandas(prioridade);
```

### 1.2 API
- Atualizar `PUT /api/demandas/:id` para aceitar `prioridade: 'alta' | 'media' | 'baixa'`
- No GET de demandas, retornar `prioridade` e ordenar por prioridade (alta primeiro), depois por prazo

### 1.3 Frontend
- **Formulário criar/editar demanda:** grupo "Prioridade" com 3 botões (🔴 Alta, 🟡 Média, 🟢 Baixa), estilos por estado ativo (ex.: `bg-red-100 border-red-500` para alta)
- **Cards:** badge de prioridade usando função tipo `getPrioridadeBadge(prioridade)` com emoji + cor (alta=red, media=yellow, baixa=green)
- **Filtro:** `<select>` "Todas as prioridades" / Alta / Média / Baixa

### 1.4 Ordenação
- Ordenar lista: `prioridadeOrder = { alta: 0, media: 1, baixa: 2 }`, depois por `prazo`

## Arquivos

- **Modificar:** `supabase-schema.sql`, `api/_lib/handlers/demandas.js`, `src/components/Demandas.jsx`, `src/services/api.js`

## Critérios de aceitação Sprint 1

- [ ] Consigo criar demanda com prioridade alta/média/baixa
- [ ] Badge de prioridade aparece no card da demanda
- [ ] Demandas são ordenadas por prioridade (alta primeiro), depois por prazo
- [ ] Filtro de prioridade funciona
- [ ] Coordenadora pode mudar prioridade de uma demanda existente

---

# SPRINT 2 — COMENTÁRIOS NAS DEMANDAS

**Objetivo:** Permitir conversas dentro de cada demanda (feedback, aprovações, contexto).  
**Duração sugerida:** 1 sprint.

## Escopo

- Nova tabela `comentarios` no Supabase
- Handler API: GET (por demanda), POST, DELETE (próprios ou coordenador)
- Componente `Comentarios.jsx` com lista + formulário
- Integração em Demandas (modal/drawer ou rota `/demandas/:id`)
- Contador de comentários no card da demanda

## Tarefas

### 2.1 Migração do banco
```sql
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  texto TEXT NOT NULL,
  anexo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id),
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_comentarios_demanda ON comentarios(demanda_id);
CREATE INDEX idx_comentarios_created ON comentarios(created_at DESC);
```

### 2.2 API
- **Criar:** `api/_lib/handlers/comentarios.js`
  - `GET /api/comentarios?demanda_id=XXX` → lista com `usuario: { nome, email }`, `texto`, `anexo_url`, `created_at`
  - `POST /api/comentarios` → body: `{ demanda_id, texto, anexo_url? }` → retorna comentário com dados do usuário
  - `DELETE /api/comentarios/:id` → só próprio comentário ou coordenador
- Registrar rotas em `api/_lib/router.js`

### 2.3 Componente `Comentarios.jsx`
- Estado: `comentarios`, `novoComentario`
- Carregar comentários por `demandaId`, ordenar por data (antigo → recente)
- Lista: avatar/iniciais, nome, data relativa ("há 2 horas", "ontem"), texto, anexo se houver
- Form: textarea com auto-resize, botão "Enviar" desabilitado se vazio
- Após enviar, atualizar lista sem reload

### 2.4 Integração
- Em `Demandas.jsx`: ao clicar em uma demanda, abrir modal/drawer com detalhes + `<Comentarios demandaId={id} />` ou rota `/demandas/:id`
- No card da demanda: ícone de comentários + contador (se tiver)

### 2.5 Design
- Data relativa; avatar ou iniciais; textarea com auto-resize

## Arquivos

- **Criar:** `src/components/Comentarios.jsx`, `api/_lib/handlers/comentarios.js`
- **Modificar:** `supabase-schema.sql`, `api/_lib/router.js`, `src/components/Demandas.jsx`, `src/services/api.js`

## Critérios de aceitação Sprint 2

- [ ] Consigo adicionar comentário em qualquer demanda
- [ ] Comentários aparecem em tempo real (sem reload)
- [ ] Vejo nome do autor e data de cada comentário
- [ ] Designer vê comentários da coordenadora e vice-versa
- [ ] Contador de comentários aparece no card da demanda

---

# SPRINT 3 — KANBAN BOARD

**Objetivo:** A coordenadora visualiza e move demandas entre colunas de status com drag and drop.  
**Duração sugerida:** 1 sprint (mais complexo).

## Escopo

- Colunas: Backlog (a_fazer), Em Andamento (em_andamento), Revisão (em_revisao), Concluído (concluido)
- Drag and drop com `@dnd-kit/core` e `@dnd-kit/sortable`
- Atualização de status no banco ao soltar
- Visual por prioridade (cores), contador por coluna, filtros (empreendimento, responsável, prioridade)
- Responsivo: desktop = 4 colunas; mobile = lista empilhada

## Tarefas

### 3.1 Dependências e índice
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```
```sql
CREATE INDEX IF NOT EXISTS idx_demandas_status ON demandas(status);
CREATE INDEX IF NOT EXISTS idx_demandas_responsavel ON demandas(responsavel_id);
```

### 3.2 API
- Usar endpoint existente: `PUT /api/demandas/:id/status` com body `{ status: 'em_andamento' }` (ou outro status)

### 3.3 Componentes
- **KanbanBoard:** container com DndContext, agrupa demandas por status
- **KanbanColumn:** uma coluna por status, título + contador + droppable
- **DemandaCard (adaptar):** título, empreendimento (badge), responsável (avatar/iniciais), prazo (alerta se próximo/atrasado), prioridade (🔴/🟡/🟢), ícone comentários + contador
- Ao soltar: chamar API de status e atualizar estado local

### 3.4 Estrutura sugerida
```jsx
<KanbanBoard>
  <KanbanColumn titulo="Backlog" status="a_fazer">
    <DemandaCard demanda={...} />
  </KanbanColumn>
  <KanbanColumn titulo="Em Andamento" status="em_andamento">...</KanbanColumn>
  <KanbanColumn titulo="Revisão" status="em_revisao">...</KanbanColumn>
  <KanbanColumn titulo="Concluído" status="concluido">...</KanbanColumn>
</KanbanBoard>
```

### 3.5 Filtros e responsividade
- Filtros: empreendimento, responsável, prioridade (reutilizar lógica da priorização)
- Mobile: colunas empilhadas ou lista por status

## Arquivos

- **Criar:** `src/components/KanbanBoard.jsx`, `src/components/KanbanColumn.jsx`
- **Modificar:** `src/components/Demandas.jsx` (integrar vista Kanban + cards), `supabase-schema.sql` (índices)

## Critérios de aceitação Sprint 3

- [ ] Consigo arrastar uma demanda de "Backlog" para "Em Andamento"
- [ ] O status é atualizado no banco automaticamente
- [ ] A demanda aparece na nova coluna sem recarregar a página
- [ ] Funciona em telas grandes (4 colunas lado a lado)
- [ ] Funciona em mobile (colunas empilhadas ou lista)
- [ ] Filtros funcionam (ex.: só demandas do empreendimento X)

---

# SPRINT 4 — EXTRAS (SE DER TEMPO)

**Objetivo:** Melhorar UX com status automático por prazo e filtros avançados.

## 4.1 Status workflow automático

- No handler de demandas, calcular `status_automatico`: atrasado (prazo &lt; hoje), urgente (≤ 2 dias), atenção (≤ 7 dias), normal
- Incluir no GET; no frontend exibir badges "⚠️ Atrasado", "🔥 Urgente" conforme o valor

## 4.2 Filtros avançados

- Componente `Filtros.jsx`: selects Empreendimento, Responsável, Prioridade, optional DateRangePicker para Prazo, botão Limpar
- Reutilizar em Kanban e em lista de demandas

## Arquivos

- **Criar:** `src/components/Filtros.jsx`
- **Modificar:** `api/_lib/handlers/demandas.js` (status_automatico), componentes que exibem demandas (badges)

---

# INSTRUÇÕES GERAIS

## Ordem de execução

1. **Sprint 1** — Priorização (base para cards e filtros)
2. **Sprint 2** — Comentários (funcionalidade isolada)
3. **Sprint 3** — Kanban (depende de prioridade e comentários no card)
4. **Sprint 4** — Extras quando as anteriores estiverem estáveis

## Boas práticas

- **Commits atômicos:** um commit por feature ou sub-task
- **Testes manuais:** validar cada sprint antes de seguir
- **Responsividade:** garantir uso em mobile
- **Loading/erro:** spinners/skeletons e mensagens amigáveis
- **Acessibilidade:** dnd-kit já ajuda com teclado

## Checklist final (após Sprints 1–3)

- [ ] Priorização: criar, editar, filtrar, ordenar
- [ ] Comentários: adicionar, listar, deletar
- [ ] Kanban: arrastar, soltar, atualizar status
- [ ] Responsivo: uso em mobile
- [ ] Performance: muitas demandas sem travar
- [ ] UX: feedback ao arrastar, loading e error states

---

# CRITÉRIOS DE SUCESSO

A implementação está completa quando:

1. ✅ A Tati abre o Kanban e vê todas as demandas por status
2. ✅ Ela arrasta uma demanda de "Backlog" para "Em Andamento" e o status atualiza
3. ✅ Ela adiciona um comentário ("Cliente aprovou, pode publicar") em uma demanda
4. ✅ O designer vê o comentário e pode responder
5. ✅ Ela marca uma demanda como "🔴 Alta" e ela sobe na ordem
6. ✅ No mobile, fluxos principais funcionam sem quebrar

---

# NOTAS IMPORTANTES

- **Não quebrar** Dashboard, Check-ins, Calendário, etc.
- **Manter** padrão do projeto (Tailwind, estrutura de componentes)
- **TypeScript** só se o projeto já usar; senão manter JavaScript
- **Testar** com perfis Coordenador e Designer para validar permissões

Boa sorte! 🚀
