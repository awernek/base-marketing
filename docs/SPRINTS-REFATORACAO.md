# Plano de Sprints – Refatoração (Modelo e Fluxo)

Refatoração do MVP conforme proposta de redesign: **Aguardando Priorização**, priorização pelo coordenador, visão coordenador vs designer, “pegar” tarefa.

**Referência:** documento de redesign (modelo de dados, fluxo de status, permissões, visões).

---

## Visão geral

| Sprint | Nome | Objetivo principal | Estimativa |
|--------|------|--------------------|------------|
| 1 | Modelo de dados e migração | Nova etapa "aguardando_priorizacao", responsável opcional, criado_por, tipos | 2–3 h |
| 2 | API e regras de permissão | Endpoints, filtros por papel, priorizar, atribuir, "pegar" | 3–4 h |
| 3 | Frontend – Enums e contrato | Novos tipos de demanda, etapa aguardando, API client e hooks | 1–2 h |
| 4 | Frontend – Fluxo e Kanban (coordenador) | Coluna Aguardando, priorizar, atribuir, mover qualquer | 3–4 h |
| 5 | Frontend – Visão designer | Meu quadro, minhas + disponíveis, pegar tarefa, restrições | 2–3 h |
| 6 | Formulários, dashboard e polimento | Criar demanda (todos), tipos no form, métricas, testes | 2–3 h |

**Total estimado: 13–19 horas**

Ordem: 1 → 2 → 3 → 4 → 5 → 6 (backend antes de frontend; coordenador antes de designer).

---

# Sprint 1: Modelo de dados e migração

**Objetivo:** Ajustar o schema e o domínio para o novo fluxo (Aguardando Priorização, responsável opcional, criado_por, novos tipos).

## Entregas

- [x] **Etapa "aguardando_priorizacao":** Incluir no CHECK de `demandas.etapa`: `'aguardando_priorizacao'`. Valor default de `etapa` para novas demandas: `'aguardando_priorizacao'`.
- [x] **Responsável opcional:** Alterar `demandas.responsavel_id` para NULL permitido (e remover NOT NULL). Demandas novas ou “disponíveis” podem ter responsavel_id = NULL.
- [x] **Criado por:** Adicionar coluna `criada_por_usuario_id UUID REFERENCES usuarios(id)` (ou `criado_por`). Preencher em INSERT; usar para auditoria e, se quiser, filtros.
- [x] **Tipos de demanda (novos):** Definir enum/mapeamento: Nova Peça (0), Alteração (1), Campanha (2), Ajuste Interno (3), Ideia (4). Migração: alterar constraint ou tabela de tipos; migrar valores antigos (Post→Nova Peça, etc.) se necessário, ou manter compatibilidade com números atuais e só trocar labels no front.
- [x] **Prioridade opcional até priorizar:** Permitir `prioridade` NULL (ou manter default Média). Quando coordenador “priorizar”, preencher prioridade (e prazo se quiser).
- [x] **Prazo opcional na criação:** Manter `prazo` como opcional (NULL) na criação; obrigatório apenas após priorização (ou permitir NULL e exibir “Sem prazo”).
- [x] **Arquivo de migração:** Um script SQL (ex.: `supabase-migration-refatoracao-v1.sql`) aplicável no Supabase, com ALTER TABLE e comentários.

## Critérios de aceite

- Migração roda sem erro no Supabase.
- Novas demandas podem ser inseridas com etapa `aguardando_priorizacao`, responsavel_id NULL, prioridade/prazo opcionais.
- Nenhuma regra de negócio quebrada em leitura (handlers antigos podem continuar retornando etapa; ajustes de permissão na Sprint 2).

## Tempo estimado

2–3 horas

---

# Sprint 2: API e regras de permissão

**Objetivo:** Ajustar handlers de demandas para o novo fluxo e regras por papel (coordenador vs designer).

## Entregas

- [x] **Criar demanda (qualquer usuário):** POST /api/demandas permitido para coordenador e designer. Sempre inserir com `etapa = 'aguardando_priorizacao'`, `responsavel_id = NULL` (ou do body se coordenador quiser atribuir já). Campos obrigatórios: titulo, tipo. Opcionais: descricao, prazo, prioridade, responsavelId, empreendimentoId. Salvar `criada_por_usuario_id` = user.id.
- [x] **Listar demandas (coordenador):** GET /api/demandas retorna todas; filtro por etapa (incluindo `aguardando_priorizacao`), responsavelId, prioridade, etc. Ordenação coerente (ex.: aguardando primeiro, depois por prioridade/prazo).
- [x] **Listar demandas (designer):** GET /api/demandas retorna apenas: (1) demandas onde responsavel_id = user.pessoaId, e (2) demandas em etapa `a_fazer` com responsavel_id IS NULL (“disponíveis”). Não retornar backlog completo nem coluna aguardando_priorizacao.
- [x] **Priorizar (só coordenador):** Novo endpoint ou ação em PUT/PATCH: mudar etapa de `aguardando_priorizacao` → `a_fazer` e definir prioridade (obrigatório), responsavelId (opcional), prazo (opcional). Validar que a demanda está em aguardando_priorizacao.
- [x] **Atualizar etapa (mover no Kanban):** PUT /api/demandas/:id/etapa (ou campo no PUT geral). Regras: (1) Coordenador pode mover qualquer demanda entre a_fazer, em_andamento, em_revisao, concluido (e aguardando → a_fazer já é “priorizar”). (2) Designer só pode mover demandas onde responsavel_id = user.pessoaId, e apenas entre a_fazer, em_andamento, em_revisao, concluido (não pode tirar de aguardando_priorizacao).
- [x] **Atribuir responsável:** Coordenador pode PATCH/PUT responsavelId em qualquer demanda. Designer pode “se atribuir” apenas em demandas em `a_fazer` com responsavel_id NULL (ação “pegar”) — endpoint dedicado ou PUT com validação.
- [x] **Atualizar prioridade/prazo:** Apenas coordenador pode alterar prioridade e prazo (e tipo, se aplicável). Designer não pode alterar prioridade.
- [x] **Domínio (demandas.js):** Incluir `aguardando_priorizacao` em ETAPAS (ou constante separada); fmt() mapear etapa e criado_por; garantir que respostas da API estejam alinhadas ao contrato do frontend.

## Critérios de aceite

- Coordenador: criar, listar todas, priorizar, atribuir, mover qualquer demanda, editar prioridade/prazo.
- Designer: criar demanda (entra aguardando), listar “minhas + disponíveis”, pegar tarefa (atribuir a si), mover apenas as suas entre etapas; não priorizar nem ver aguardando_priorizacao.
- Endpoints documentados ou refletidos no api-contrato-frontend.md.

## Tempo estimado

3–4 horas

---

# Sprint 3: Frontend – Enums e contrato

**Objetivo:** Alinhar frontend ao novo modelo (tipos de demanda, etapa aguardando, uso da API).

## Entregas

- [x] **Enums – Tipos de demanda:** Atualizar `src/utils/enums.js`: labels e valores para Nova Peça, Alteração, Campanha, Ajuste Interno, Ideia (e manter compatibilidade com API se ainda usar números 0–4). Ajustar `tipoLabels` e formulários que listam tipo.
- [x] **Etapa “Aguardando Priorização”:** Incluir no frontend constante/lista de etapas (ex.: em `KanbanBoard` / domain); ordem: aguardando_priorizacao, a_fazer, em_andamento, em_revisao, concluido. Label: "Aguardando Priorização".
- [x] **API client (demandas):** Chamadas para: listar (query params: etapa, responsavelId, etc.), criar (sempre etapa aguardando no backend), priorizar (mudar para a_fazer + prioridade/responsável/prazo), atualizar etapa, atribuir responsável, “pegar” (atribuir a mim). Ajustar `src/api/demandas.api.js` e `src/services/api.js` se necessário.
- [x] **Hook useDemandas:** Suportar filtro por etapa e por “visão” (coordenador: todas; designer: minhas + disponíveis). Retorno já vem filtrado do backend; front só exibe.
- [x] **Contrato:** Atualizar `api-contrato-frontend.md` (ou doc equivalente) com novos endpoints e payloads.

## Critérios de aceite

- Tipos exibidos corretamente em listas e formulários.
- Chamadas de listagem/criação/priorizar/etapa/atribuir funcionando contra a API da Sprint 2.
- Nenhuma tela quebrada (pode ainda não exibir coluna Aguardando até Sprint 4).

## Tempo estimado

1–2 horas

---

# Sprint 4: Frontend – Fluxo e Kanban (coordenador)

**Objetivo:** Visão coordenador com coluna “Aguardando Priorização”, priorizar, atribuir e mover qualquer demanda.

## Entregas

- [x] **Coluna Aguardando Priorização:** No Kanban do coordenador, primeira coluna à esquerda: “Aguardando Priorização”. Só coordenador vê essa coluna. Cards podem ser arrastados para “A Fazer” (disparando priorização).
- [x] **Priorizar:** Ao arrastar de Aguardando → A Fazer, abrir modal (ou inline) para definir: prioridade (obrigatório), responsável (opcional), prazo (opcional). Confirmar → PATCH priorizar no backend e atualizar etapa para a_fazer.
- [x] **Priorizar em lote (opcional):** Na lista, ação “Priorizar” por demanda (abre mesmo modal). Ou múltipla seleção + “Priorizar selecionadas”. Pode ficar para depois se tempo curto.
- [x] **Atribuir responsável:** No card ou na lista, coordenador pode alterar responsável (dropdown ou modal). Chamar API de atualização de responsavelId.
- [x] **Mover qualquer demanda:** Coordenador pode arrastar qualquer card entre A Fazer, Em Andamento, Em Revisão, Concluído (e de Aguardando para A Fazer com priorizar). Chamar PUT etapa.
- [x] **Lista coordenador:** Abas/filtros: “Aguardando Priorização” | “Ativas” (a_fazer + em_andamento + em_revisao) | “Concluídas”. Filtros por responsável, prioridade, empreendimento, prazo. Botão “Nova demanda” e criar demanda (qualquer um pode criar; coordenador vê na lista como aguardando).
- [x] **Dashboard coordenador:** Métrica “Aguardando priorização” (contador). Manter métricas por status e por designer. Links para demandas.

## Critérios de aceite

- Coordenador vê coluna Aguardando e consegue priorizar (drag + modal) e atribuir.
- Lista e Kanban refletem dados da API; sem regressões em outras telas.

## Tempo estimado

3–4 horas

---

# Sprint 5: Frontend – Visão designer

**Objetivo:** Designer vê “Meu quadro” (Kanban) com minhas tarefas + disponíveis, pode “pegar” tarefa e mover só as suas.

## Entregas

- [x] **Meu quadro (designer):** Página Demandas para designer: foco em Kanban (pode ser default ou única vista). Colunas: A Fazer | Em Andamento | Em Revisão | Concluído. Sem coluna “Aguardando Priorização”.
- [x] **Conteúdo do quadro:** Exibir demandas onde responsavel_id = eu (minhas) + demandas em “A Fazer” com responsavel_id NULL (disponíveis). Backend já filtra; front só consome lista e agrupa por etapa.
- [x] **Pegar tarefa:** Em cards “disponíveis” (A Fazer, sem responsável), botão “Pegar” ou “Sou eu” que chama API de atribuição (responsavelId = meu pessoaId). Após sucesso, card passa a “minha” e designer pode movê-lo.
- [x] **Mover apenas minhas:** Designer só pode arrastar cards das demandas onde ele é responsável. Cards “disponíveis” (ainda sem responsável) não são arrastáveis até “pegar”. Validação no front (desabilitar drag) e no backend (403 se tentar mover de outrem).
- [x] **Criar demanda (designer):** Botão “Nova demanda” no designer; formulário igual ao do coordenador (título, descrição, tipo obrigatório, etc.). Ao salvar, demanda vai para Aguardando Priorização; designer não vê essa coluna, mas pode ver “Minhas demandas” e a nova não aparecerá no quadro até coordenador priorizar (ou pode mostrar toast “Demanda criada e aguardando priorização”).
- [x] **Lista designer (opcional):** Se houver lista para designer, mostrar apenas “Minhas” + “Disponíveis” (mesmo critério do Kanban). Sem filtro por outros designers e sem aba “Aguardando”.
- [x] **Não exibir prioridade editável:** Designer vê prioridade (read-only) no card; não há campo para alterar prioridade.

## Critérios de aceite

- Designer vê apenas minhas + disponíveis no Kanban; consegue pegar tarefa e mover suas demandas entre etapas.
- Designer pode criar demanda; não vê backlog completo nem coluna Aguardando.

## Tempo estimado

2–3 horas

---

# Sprint 6: Formulários, dashboard e polimento

**Objetivo:** Formulário de demanda com novos tipos, métricas no dashboard, e ajustes finais.

## Entregas

- [ ] **Formulário de demanda:** Tipo obrigatório com opções: Nova Peça, Alteração, Campanha, Ajuste Interno, Ideia. Criar demanda: título e tipo obrigatórios; descrição, prazo, empreendimento, responsável (só coordenador, opcional) opcionais. Coordenador pode pré-atribuir e definir prazo/prioridade; designer só preenche o básico (demanda vai aguardar priorização).
- [ ] **Dashboard:** Métricas atualizadas: total por etapa (incluindo “Aguardando priorização”), por designer (em andamento + em revisão), atrasadas. Coordenador vê tudo; designer vê só resumo das suas (se houver widget).
- [ ] **Permissões na UI:** Esconder/mostrar botões e colunas por papel (coordenador vs designer) de forma consistente; evitar 403 por cliques indevidos.
- [ ] **Testes manuais:** Fluxo completo: criar como designer → coordenador prioriza → designer pega e move até concluído. Criar como coordenador → priorizar → atribuir a designer → designer move.
- [ ] **Documentação:** Atualizar README ou docs com novo fluxo (opcional); manter SPRINTS-REFATORACAO.md com checkboxes preenchidas ao concluir.

## Critérios de aceite

- Formulário com tipos corretos; criação por ambos os papéis; dashboard com métricas úteis.
- Nenhuma regressão crítica; fluxo coordenador e designer validados.

## Tempo estimado

2–3 horas

---

# Como executar

1. **Ordem:** Sprint 1 → 2 → 3 → 4 → 5 → 6.
2. **Ao iniciar uma sprint:** Marcar tarefas; ter backend (1–2) estável antes de depender do front (3–6).
3. **Ao terminar:** Testar fluxos de coordenador e designer; commit com mensagem tipo `refactor(demandas): Sprint N - descrição`.
4. **Contrato:** Manter API e frontend alinhados; documentar quebras em api-contrato-frontend.md.

---

# Riscos e cuidados

- **Migração:** Fazer backup ou testar migração em ambiente de dev antes de produção.
- **Compatibilidade:** Demandas antigas com responsavel_id NOT NULL: migração deve alterar coluna para NULL e manter dados; etapa antiga “a_fazer” pode permanecer, e demandas já concluídas permanecem concluído.
- **Designer não vê demanda criada:** Comportamento esperado até coordenador priorizar; deixar claro na UI (“Demanda criada e aguardando priorização”).

---

*Referência de regras e modelo: documento de redesign (Product Designer + Software Architect).*
