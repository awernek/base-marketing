# Sprints de Arquitetura — Clean Code e SOLID

Documento de planejamento para evoluir o **Base Marketing (frontend + API)** em direção a uma arquitetura mais **Clean Code** e **SOLID**, facilitando expansão, manutenção e escalabilidade.

---

## 1. Análise do estado atual

### 1.1 Pontos positivos

- **API**: Rotas organizadas por recurso (`handlers/`), uso de `response.js` e `auth.js` centralizados.
- **Frontend**: Presença de `contexts/`, `services/api.js`, `utils/enums.js` — alguma separação de responsabilidades.
- **Stack**: React + Vite + Tailwind, adequado para crescimento.

### 1.2 Problemas identificados (anti-padrões e violações)

| Problema | Onde | Princípio afetado | Impacto |
|----------|------|-------------------|--------|
| **Componentes “Deus”** | `Dashboard.jsx` (~1180 linhas), `Demandas.jsx` (~560 linhas) | SRP | Difícil manutenção, testes e reuso |
| **Lógica de negócio e UI misturadas** | Dashboard, Demandas | SRP | Regras espalhadas, difícil alterar comportamento |
| **Estado e formulários duplicados** | “Nova demanda” / “Editar demanda” em Dashboard e Demandas | DRY, SRP | Bugs ao alterar em um lugar e esquecer o outro |
| **API em arquivo único** | `services/api.js` com todos os módulos | SRP, OCP | Arquivo grande; novo recurso = editar o mesmo arquivo |
| **Tratamento de erro inconsistente** | `authApi.solicitarCodigo` / `definirSenha` não usam `request()` | DRY | Comportamento diferente (ex.: 401, mensagem) |
| **Navbar e rotas no App** | `App.jsx` com navbar e tabela de rotas inline | SRP | App inchado; troca de layout exige mexer no núcleo |
| **Componentes dependem da API concreta** | Uso direto de `demandasApi`, `pessoasApi` nos componentes | DIP | Trocar origem de dados (ex.: cache, mock) exige mudar vários arquivos |
| **Falta de camada de domínio** | Regras (ex.: status automático por prazo) no handler ou no front | SRP | Lógica duplicada ou acoplada ao HTTP |
| **Poucos hooks reutilizáveis** | `loadData()` e estados repetidos em vários componentes | DRY, SRP | Mesmo padrão de loading/erro em vários lugares |

### 1.3 Objetivos das sprints

1. **SRP (Single Responsibility)**: Um módulo/componente com uma razão clara para mudar.
2. **OCP (Open/Closed)**: Estender (novas telas, filtros, recursos) sem reescrever código estável.
3. **DIP (Dependency Inversion)**: Depender de abstrações (ex.: “repositório de demandas”) e não do `api.js` direto.
4. **Clean Code**: Nomes claros, funções pequenas, menos duplicação, testes mais fáceis.

---

## 2. Visão da arquitetura alvo (resumida)

```
Frontend (src/)
├── api/                    # Cliente HTTP (pode ser trocado)
│   ├── client.js           # request(), getToken(), tratamento 401/erro
│   ├── auth.api.js
│   ├── pessoas.api.js
│   ├── empreendimentos.api.js
│   ├── demandas.api.js
│   ├── checkins.api.js
│   ├── dashboard.api.js
│   └── relatorios.api.js
├── domain/                 # (opcional) Regras puras, sem React/HTTP
│   └── demandas/           # ex.: statusAutomatico, validações
├── hooks/                  # Lógica reutilizável (lista, formulário, auth)
│   ├── useDemandas.js
│   ├── usePessoas.js
│   ├── useCheckinSemana.js
│   └── ...
├── components/
│   ├── layout/             # Layout, Navbar, ProtectedRoute
│   ├── demandas/           # DemandasPage, DemandasList, DemandasFilters, DemandaForm, DemandaCard, ...
│   ├── dashboard/          # DashboardPage, OverviewCards, PessoasSection, DemandasRisco, ...
│   ├── pessoas/            # PessoaModal, PessoaForm, ...
│   └── shared/             # Button, Modal, Loading, ErrorBanner, ConfirmDialog
├── contexts/               # Auth e, se necessário, outros
├── pages/                  # Páginas = composição de componentes + hooks
│   ├── DemandasPage.jsx
│   ├── DashboardPage.jsx
│   └── ...
├── routes.jsx             # Só definição de rotas
└── utils/
```

**API (api/)**  
- Manter handlers por recurso.  
- Extrair lógica repetida (ex.: formatação de demanda, status automático) para módulos `_lib/domain/` ou `_lib/formatters/` para reuso e testes.

---

## 3. Sprints

Cada sprint é **incremental**: ao final, o sistema continua funcionando e já fica mais fácil evoluir na próxima.

---

### Sprint 1 — Fundação: API client e layout (1–2 semanas)

**Objetivo:** Unificar cliente HTTP, extrair Layout/Navbar e rotas. Base para as próximas refatorações.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 1.1 | Criar `src/api/client.js` com `request()`, `getToken()`, tratamento de 401 e erro (parse de `message`) | Único lugar que fala com `fetch` e localStorage para token |
| 1.2 | Refatorar `authApi` para usar `request()` em `solicitarCodigo` e `definirSenha` | Consistência e DRY no tratamento de erro |
| 1.3 | Quebrar `services/api.js` em módulos em `src/api/*.api.js` (auth, pessoas, empreendimentos, demandas, checkins, dashboard, relatorios), cada um importando `client` | SRP; um arquivo por recurso |
| 1.4 | Manter `services/api.js` como barrel que reexporta todos os `*Api` (para não quebrar imports de uma vez) | Compatibilidade durante a migração |
| 1.5 | Extrair `Layout.jsx` (navbar + slot para filhos) e `Navbar.jsx` do `App.jsx` | SRP no layout |
| 1.6 | Extrair definição de rotas para `src/routes.jsx` (ou `routes/index.jsx`) e importar em `App.jsx` | App só compõe Provider + Router + Routes |
| 1.7 | Extrair `ProtectedRoute` para `components/layout/ProtectedRoute.jsx` | Reuso e testes |

**Critérios de conclusão**

- [ ] Nenhum `fetch` ou `localStorage` de token fora de `api/client.js`.
- [ ] Todas as chamadas de API passam por `client.request()` (incluindo auth).
- [ ] App.jsx enxuto: Provider, Router, Layout + Routes.
- [ ] Rotas em arquivo dedicado; navbar em componente de layout.
- [ ] Build e fluxo de login/demandas/dashboard seguem funcionando.

**Entregável:** Código mais organizado sem mudar comportamento visível.

---

### Sprint 2 — Componentes compartilhados e extração de formulários (1–2 semanas)

**Objetivo:** Reduzir duplicação de UI e de estado de formulário (ex.: demanda), preparando quebra do Dashboard e Demandas.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 2.1 | Criar `components/shared/Modal.jsx`, `Loading.jsx`, `ErrorBanner.jsx`, `ConfirmDialog.jsx` (reutilizáveis) | UI comum em um só lugar |
| 2.2 | Extrair formulário de demanda (campos: título, tipo, responsável, prazo, impacto, prioridade, empreendimento, link) para `DemandaForm.jsx`; controlado (value/onChange) ou com callback `onSubmit(payload)` | DRY entre Dashboard e Demandas |
| 2.3 | Definir um único “estado inicial” do form de demanda (ex.: em `utils/formDemanda.js` ou dentro de `DemandaForm`) e usar em “nova” e “editar” | Uma fonte de verdade para valores default |
| 2.4 | Substituir blocos duplicados de “nova demanda” / “editar demanda” em Dashboard e Demandas pelo `DemandaForm` + `Modal` | Menos linhas e um único lugar para alterar campos |
| 2.5 | (Opcional) Extrair `PessoaForm.jsx` para nome, email, notas (e depois ativo) | Preparar modal de pessoa reutilizável |

**Critérios de conclusão**

- [ ] Modal, Loading, ErrorBanner e ConfirmDialog existem e são usados em pelo menos um fluxo (ex.: demanda).
- [ ] DemandaForm é usado tanto na “nova demanda” quanto na “editar demanda” (Dashboard e Demandas).
- [ ] Não há dois “estados iniciais” diferentes para o mesmo form de demanda.
- [ ] Testes manuais: criar e editar demanda a partir do Dashboard e da página Demandas.

**Entregável:** Menos duplicação e base para extrair páginas nas sprints seguintes.

---

### Sprint 3 — Hooks de dados (demandas, pessoas, check-in) (1 semana)

**Objetivo:** Centralizar loading, erro e dados em hooks; componentes passam a depender dos hooks em vez de chamar API + useState manualmente.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 3.1 | Criar `hooks/useDemandas.js`: parâmetros (filtro, empreendimentoId, prioridade, responsavelId, de, ate, isCoordenador, user), retorna `{ demandas, loading, error, refetch }`; internamente chama `demandasApi.listar` ou `listarAtivas`/`listarEmRisco` conforme o caso | SRP: um hook “lista de demandas” |
| 3.2 | Criar `hooks/usePessoas.js`: `{ pessoas, loading, error, refetch }` para lista de pessoas (coordenador) | Reuso no Dashboard e onde mais for necessário |
| 3.3 | Criar `hooks/useEmpreendimentosLista.js`: `{ lista, loading, error, refetch }` para lista enxuta (filtros, selects) | Evitar repetir `empreendimentosApi.listaEnxuta()` em vários componentes |
| 3.4 | Criar `hooks/useCheckinSemanaAtual.js`: recebe `pessoaId` ou usa `user.pessoaId`, retorna `{ checkin, loading, error, refetch }` para a semana atual | Usar na tela de Check-in e no histórico da pessoa |
| 3.5 | (Opcional) `hooks/useOverview.js` para o dashboard overview | Encapsular chamada ao dashboard API |

**Critérios de conclusão**

- [ ] Demandas na página Demandas e no Dashboard (onde fizer sentido) usam `useDemandas` ou equivalente.
- [ ] Lista de pessoas no Dashboard usa `usePessoas`.
- [ ] Lista de empreendimentos (filtros/selects) usa `useEmpreendimentosLista`.
- [ ] Tela de Check-in usa `useCheckinSemanaAtual` para indicar “já fez check-in esta semana”.
- [ ] Componentes não têm mais múltiplos `useState` + `useEffect` repetidos para a mesma lista.

**Entregável:** Camada de “dados” reutilizável; menos acoplamento componente ↔ API direta.

---

### Sprint 4 — Quebra do Demandas em página + componentes (1–2 semanas)

**Objetivo:** Aplicar SRP na página de Demandas: uma página que orquestra, componentes menores por responsabilidade.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 4.1 | Criar pasta `components/demandas/` e mover/extrair: `DemandasPage.jsx` (orquestrador), `DemandasList.jsx` (lista em tabela/cards), `DemandasFilters.jsx` (já existe Filtros.jsx — renomear ou integrar), `DemandaCard.jsx` (card de uma demanda com ações) | Cada arquivo com uma responsabilidade clara |
| 4.2 | Manter `KanbanBoard` e `KanbanColumn` em `components/demandas/` ou em `components/shared/` conforme uso | Organização por feature ou compartilhado |
| 4.3 | `DemandasPage`: usa `useDemandas`, `usePessoas` (se coordenador), `useEmpreendimentosLista`; controla filtro ativas/risco/concluídas e vista lista vs kanban; renderiza Filters + List ou Kanban; modais “nova”/“editar” usam `DemandaForm` + `Modal` | Página só orquestra estado de UI e hooks |
| 4.4 | Mover `Comentarios.jsx` para `components/demandas/Comentarios.jsx` (ou manter em shared se for usado em outro contexto) | Consistência de estrutura |
| 4.5 | Atualizar `routes` para apontar para `DemandasPage`; remover ou depreciar o `Demandas.jsx` antigo após migração | Rota única para demandas |

**Critérios de conclusão**

- [ ] Página de demandas é `DemandasPage` composta por componentes em `components/demandas/`.
- [ ] Nenhum componente de demandas com mais de ~200–250 linhas.
- [ ] Filtros, lista, kanban, criar/editar e comentários funcionando como antes.
- [ ] Build e testes manuais OK.

**Entregável:** Página Demandas alinhada a SRP e mais fácil de estender (ex.: novos filtros, nova vista).

---

### Sprint 5 — Quebra do Dashboard em página + componentes (2–3 semanas)

**Objetivo:** Reduzir o “componente Deus” Dashboard para uma página que compõe blocos menores.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 5.1 | Criar pasta `components/dashboard/`: `DashboardPage.jsx`, `OverviewCards.jsx`, `DemandasRisco.jsx`, `ProximosPrazos.jsx`, `PessoasSection.jsx` (lista de pessoas + seleção), `PessoaModal.jsx` (perfil: dados, notas, histórico check-ins, convite, definir senha) | Dividir por bloco visual/funcional |
| 5.2 | Extrair seção “Demandas em risco” para `DemandasRisco.jsx`; usar `demandasApi.listarEmRisco()` ou hook equivalente | Alinhar com backend e SRP |
| 5.3 | Extrair “Próximos prazos” para `ProximosPrazos.jsx`; usar API ou hook de demandas com filtro de prazo | Reuso de dados, componente focado |
| 5.4 | `PessoaModal`: usar `PessoaForm` (nome, email, notas), histórico de check-ins (hook por pessoa), botões convite/definir senha/desativar com `ConfirmDialog` onde couber | Um modal de pessoa, um lugar para regras de exibição |
| 5.5 | Nova demanda no Dashboard: reutilizar `DemandaForm` + `Modal`; editar demanda idem | Mesmo padrão da Sprint 2 |
| 5.6 | `DashboardPage`: usa hooks (overview, demandas risco, prazos, pessoas, empreendimentos); compõe OverviewCards + DemandasRisco + ProximosPrazos + PessoasSection; controla qual pessoa está no modal e qual demanda em edição | Página só orquestra |
| 5.7 | Atualizar rotas para `DashboardPage`; remover `Dashboard.jsx` antigo após migração | Rota única para dashboard |

**Critérios de conclusão**

- [ ] Dashboard é `DashboardPage` + componentes em `components/dashboard/`.
- [ ] Nenhum arquivo do dashboard com mais de ~250–300 linhas.
- [ ] Overview, risco, prazos, pessoas, modal de pessoa (editar, notas, convite, definir senha, desativar), criar/editar demanda funcionando.
- [ ] Demandas em risco usam endpoint ou hook dedicado.

**Entregável:** Dashboard modular, fácil de ajustar um bloco sem mexer nos outros.

---

### Sprint 6 — API (backend): domínio e formatação (1 semana)

**Objetivo:** Extrair lógica de domínio e formatação dos handlers para facilitar reuso e testes (SOLID no backend).

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 6.1 | Criar `api/_lib/domain/demandas.js` (ou `formatters/demandas.js`): mover `statusAutomatico(prazo, concluida)` e `fmt(d, comentariosCount)` (e constantes como ETAPAS) | Lógica pura fora do handler |
| 6.2 | Handlers de demandas importam e usam `statusAutomatico` e `fmt` do domínio | Handler só orquestra request/response e Supabase |
| 6.3 | (Opcional) Se outros handlers tiverem formatação semelhante (ex.: pessoas, check-ins), extrair para `_lib/domain/` ou `_lib/formatters/` | Consistência e DRY na API |
| 6.4 | Documentar em README ou em `api/README.md` que regras de negócio ficam em `_lib/domain/` | Manutenção futura |

**Critérios de conclusão**

- [ ] Nenhuma lógica de “status automático” ou formatação de demanda dentro do handler; tudo vindo de módulo de domínio/formatter.
- [ ] Testes manuais das rotas de demandas (listar, criar, atualizar status, concluir) inalterados.
- [ ] (Opcional) Teste unitário de `statusAutomatico` e `fmt` sem levantar servidor.

**Entregável:** API mais fácil de testar e evoluir (ex.: mudar regra de prazo em um só lugar).

---

### Sprint 7 — Abstração de repositórios (opcional, 1 semana)

**Objetivo:** Introduzir camada de “repositório” no frontend para inverter dependência (DIP): componentes/hooks dependem de interface, não do `api.js` direto.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 7.1 | Definir “contratos” (objetos com métodos) para demandas e pessoas, ex.: `DemandasRepository` (`listar(params)`, `obter(id)`, `criar(data)`, `atualizar(id, data)`, etc.) | Abstração em vez de implementação concreta |
| 7.2 | Implementar `DemandasRepositoryApi` que delega para `demandasApi` (atual) | Implementação real |
| 7.3 | Injetar repositório no hook `useDemandas` (parâmetro ou Context); por padrão usar `DemandasRepositoryApi` | Hooks dependem do contrato |
| 7.4 | (Opcional) Fazer o mesmo para pessoas e empreendimentos; repetir para outros recursos conforme necessidade | DIP gradual |

**Critérios de conclusão**

- [ ] Hook `useDemandas` não importa `demandasApi` diretamente; recebe repositório (ou usa um default injetado).
- [ ] Em testes ou em ambiente alternativo, seria possível trocar por implementação mock sem mudar componente.
- [ ] Comportamento da aplicação inalterado.

**Entregável:** Código preparado para testes com mocks e para trocar origem de dados no futuro.

---

### Sprint 8 — Testes e documentação (contínuo / 1 sprint focado)

**Objetivo:** Garantir que refatorações não quebrem comportamento e deixar padrões explícitos.

| # | Tarefa | Responsabilidade |
|---|--------|------------------|
| 8.1 | Testes unitários para `api/client.js` (request com token, 401, parse de erro) e para `domain/demandas.js` (statusAutomatico, fmt) | Regressão em código crítico |
| 8.2 | Testes de integração ou E2E para: login, listar demandas, criar demanda, editar demanda (pelo menos um fluxo feliz por área) | Confiança nas sprints anteriores |
| 8.3 | Atualizar README (ou docs) com: estrutura de pastas alvo, onde colocar novos recursos (novo recurso = novo `*.api.js`, novo hook se necessário, componentes em pasta da feature) | Onboarding e OCP |
| 8.4 | Checklist de “nova feature”: criar endpoint em handler, cliente em `api/*.api.js`, hook se for lista/dados compartilhados, componentes em pasta da feature, rota em `routes.jsx` | Processo repetível |

**Critérios de conclusão**

- [ ] Pelo menos um teste automatizado para client e um para domínio de demandas.
- [ ] Pelo menos um fluxo E2E ou de integração cobrindo login e demandas.
- [ ] Documentação de estrutura e checklist de nova feature atualizada.

**Entregável:** Base de testes e documentação para manter Clean Code e SOLID ao crescer.

---

## 4. Ordem de execução sugerida

```text
Sprint 1 (Fundação) → Sprint 2 (Shared + Forms) → Sprint 3 (Hooks)
       ↓                      ↓                         ↓
Sprint 4 (Demandas) ←──────────────────────────────────┘
       ↓
Sprint 5 (Dashboard)
       ↓
Sprint 6 (API domain)   Sprint 8 (Testes/docs) pode ser em paralelo ou após cada sprint
       ↓
Sprint 7 (Repositórios, opcional)
```

- **Obrigatórias para “mais Clean e SOLID”:** 1, 2, 3, 4, 5, 6.  
- **Recomendadas para escalar e testar:** 8.  
- **Opcionais (quando quiser preparar mocks e DIP):** 7.

---

## 5. Resumo por princípio

| Princípio | Onde atacamos |
|-----------|----------------|
| **SRP** | Componentes por responsabilidade (Layout, Navbar, DemandasPage, DemandaCard, DemandaForm, OverviewCards, PessoaModal, etc.); API em módulos por recurso; hooks por “fonte de dados”; domain no backend. |
| **OCP** | Novos recursos = novo `*.api.js`, novo hook se necessário, nova pasta de componentes; rotas em arquivo único; shared (Modal, Loading, Confirm) para estender sem alterar. |
| **DIP** | Sprint 7: hooks/páginas dependem de repositórios (contratos); implementação real (API) injetada. |
| **DRY** | `request()` único; DemandaForm único; hooks de lista únicos; `statusAutomatico`/`fmt` no backend em um módulo. |
| **Clean Code** | Nomes claros, arquivos menores, funções focadas, menos estado duplicado, documentação e checklist para novas features. |

---

## 6. Checklist — nova feature

Ao adicionar um novo recurso (ex.: novo módulo de API, nova tela), siga:

1. **Backend:** Criar handler em `api/_lib/handlers/<recurso>.js`; registrar rotas em `api/_lib/router.js`. Regras de domínio em `api/_lib/domain/` quando houver lógica reutilizável.
2. **Cliente API:** Criar `src/api/<recurso>.api.js` usando `request()` de `client.js`; exportar no barrel `src/services/api.js`.
3. **Hook (se for lista/dados compartilhados):** Criar `src/hooks/use<Recurso>.js` com `loading`, `error`, `refetch`.
4. **Componentes:** Colocar em `src/components/<recurso>/` ou `shared/` conforme o caso.
5. **Rota:** Adicionar em `src/routes.jsx` com `ProtectedRoute` quando necessário.

---

## 7. Controle de progresso

| Sprint | Status | Observação |
|--------|--------|------------|
| 1 — Fundação | ✅ Concluído | client.js, api/*.api.js, Layout, Navbar, routes, ProtectedRoute |
| 2 — Shared + Forms | ✅ Concluído | Modal, Loading, ErrorBanner, ConfirmDialog, DemandaForm, formDemanda |
| 3 — Hooks | ✅ Concluído | useDemandas, usePessoas, useEmpreendimentosLista, useCheckinSemanaAtual, useOverview |
| 4 — Demandas | ✅ Concluído | DemandasPage, DemandasList, DemandaCard, Comentários em Modal |
| 5 — Dashboard | ✅ Concluído | DemandasRisco, ProximosPrazos; Modal+DemandaForm já aplicados |
| 6 — API domain | ✅ Concluído | api/_lib/domain/demandas.js (statusAutomatico, fmt) |
| 7 — Repositórios | ⬜ Opcional | Não implementado |
| 8 — Testes/docs | ✅ Concluído | Vitest, formDemanda.test.js, checklist e doc atualizados |

---

*Documento criado para o projeto Base Marketing — frontend. Revise e ajuste prazos conforme a capacidade do time.*
