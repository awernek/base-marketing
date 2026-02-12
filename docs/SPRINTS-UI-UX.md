# 🚀 Plano de Sprints – UI/UX Base Marketing (Runrun.it)

Documento de execução. Detalhes de design e código estão em `prompt.md`.

---

## Visão geral

| Sprint | Nome                         | Objetivo principal           | Estimativa |
|--------|------------------------------|------------------------------|------------|
| 1      | Sistema de Design            | Fundação: cores, fonte, tokens| 2–3 h      |
| 2      | Navbar e Layout              | Barra superior e navegação   | 1–1,5 h    |
| 3      | Dashboard                    | Métricas, time, prazos, alertas | 4–5 h   |
| 4      | Kanban                       | Colunas, cards, drag & drop  | 3–4 h      |
| 5      | Cards de Demanda e Filtros   | Lista e filtros              | 2 h        |
| 6      | Comentários e Formulários    | Modal e forms                | 2–3 h      |
| 7      | Estados e Polimento          | Loading, empty, toasts, animações | 2–3 h  |
| 8      | Responsividade e Acessibilidade | Mobile e a11y            | 2 h        |

**Total estimado: 18–24 horas**

Ordem recomendada: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (Sprint 1 é dependência de todas).

---

# Sprint 1: Sistema de Design

**Objetivo:** Ter uma base visual única (cores, tipografia, componentes base) para o resto das sprints.

**Referência em `prompt.md`:** seção "SISTEMA DE DESIGN" (paleta, espaçamento, tipografia, sombras, radius) + "4️⃣ BOTÕES" + "3️⃣ BADGE DE PRIORIDADE".

## Entregas

- [x] **Tailwind:** estender `tailwind.config.js` com cores (primary-blue, gray-50…), fontFamily Inter, radius e shadows do spec.
- [x] **Fonte:** carregar Inter (Google Fonts em `index.html` ou `index.css`) e usar como `font-sans`.
- [x] **Variáveis CSS (opcional):** arquivo `src/styles/design-system.css` com as variáveis do spec e import em `index.css`.
- [x] **Componente PrioridadeBadge:** `src/components/shared/PrioridadeBadge.jsx` (alta/média/baixa, 🔴🟡🟢, classes do spec).
- [x] **Componente Avatar:** `src/components/shared/Avatar.jsx` (círculo, iniciais, tamanhos sm/md).
- [x] **Botões:** garantir que primário/secundário/ghost usem as classes do spec (ou criar `Button.jsx` com variantes).

## Critérios de aceite

- Cores do spec disponíveis no Tailwind (ex.: `bg-primary-blue`, `text-gray-700`).
- Inter como fonte principal.
- PrioridadeBadge e Avatar reutilizáveis e alinhados ao spec.
- Nenhuma funcionalidade existente quebrada.

## Tempo estimado

2–3 horas

---

# Sprint 2: Navbar e Layout

**Objetivo:** Navbar profissional com logo, links ativos e avatar.

**Referência em `prompt.md`:** "1️⃣ NAVBAR (Barra Superior)".

## Entregas

- [x] **Navbar:** altura 64px, fundo branco, borda inferior, `shadow-sm`.
- [x] **Logo:** "Base Marketing", bold, `text-xl`, cor primary-blue.
- [x] **Links:** usar `NavLink` (react-router) com estilo base + `.active` (cor primary-blue + border-bottom 2px). Links: Dashboard, Demandas, Calendário (+ Empreendimentos/Relatórios se coordenador), Check-in.
- [x] **Avatar:** substituir texto "email · perfil" por componente Avatar com iniciais do usuário; ao clicar, menu com "Sair" (ou dropdown futuro).
- [x] **Responsivo:** em mobile, menu hambúrguer que abre drawer/lista com os links.

## Critérios de aceite

- Link da rota atual destacado (active).
- Avatar visível e com menu de logout.
- Mobile com menu colapsável.
- Layout geral (Layout.jsx) continua funcionando.

## Tempo estimado

1–1,5 hora

---

# Sprint 3: Dashboard

**Objetivo:** Dashboard com métricas visuais, cards do time, prazos, alertas e demandas ativas.

**Referência em `prompt.md`:** "8️⃣ DASHBOARD CARDS", "MELHORIAS ESPECÍFICAS POR COMPONENTE > Dashboard", e "MELHORIAS CIRÚRGICAS > PARTE 1: DASHBOARD".

## Entregas

- [x] **Métricas no topo:** 4 cards (Demandas Ativas, Atrasadas, Concluídas, Time) com ícone, valor grande e variação (ex.: "+3 esta semana"). Usar componente tipo MetricCard.
- [x] **Cards do time:** substituir lista simples por PessoaCard com avatar, nome, quantidade de demandas, badge de carga (alta/média/baixa) e barra de progresso (%).
- [x] **Próximos prazos:** cards compactos (PrazoCard) com dias restantes, título, responsável e empreendimento; borda/background diferente para urgente (≤2 dias).
- [x] **Alertas:** AlertaCard com gradiente suave, ícone, mensagem e "Ver mais"; seção com título e contador em badge.
- [x] **Demandas ativas:** grid 3 colunas (md/lg) com DemandaCompactCard (prioridade, avatar, título, empreendimento, prazo); link "Ver todas".
- [x] **Espaçamento:** gaps consistentes (gap-4 a gap-8), títulos de seção claros.

## Critérios de aceite

- 4 métricas no topo com números e tendência.
- Time com avatar e barra de carga.
- Prazos e alertas legíveis e acionáveis.
- Demandas ativas em grid; responsivo (1 coluna em mobile).

## Tempo estimado

4–5 horas

---

# Sprint 4: Kanban

**Objetivo:** Kanban com colunas destacadas, cards padronizados e drag & drop com feedback.

**Referência em `prompt.md`:** "5️⃣ KANBAN BOARD", melhorias Kanban no meio do doc, e "MELHORIAS CIRÚRGICAS > PARTE 2: KANBAN".

## Entregas

- [x] **Headers das colunas:** fundo por status (backlog=cinza, em_andamento=azul, em_revisao=roxo, concluido=verde), título + contador em badge.
- [x] **Estrutura da coluna:** coluna com `min-h-[600px]`, drop zone com estilo; quando vazia, empty state (ícone 📭 + texto "Nenhuma demanda").
- [x] **Card no Kanban:** padding p-4, PrioridadeBadge + Avatar, título (line-clamp-2), badge de tipo (campanha/post/landing/institucional), footer com empreendimento e prazo, comentários se houver; grip handle (barra cinza no topo); hover e estado de drag (opacity + scale/rotate).
- [x] **Layout do board:** `h-screen`, header fixo com filtros + "Nova Demanda", área do board com scroll horizontal; colunas com largura fixa (ex.: w-80).
- [x] **Drag:** usar DragOverlay (@dnd-kit) para clonar card durante arraste; coluna de destino com destaque (ex.: bg-blue-50, borda) ao hover.

## Critérios de aceite

- Colunas com header colorido e contador.
- Cards com prioridade/tipo/avatar/prazo; grip visível.
- Arrastar mostra feedback (overlay + highlight na coluna).
- Coluna vazia com empty state.
- Nenhuma regra de negócio de movimentação alterada.

## Tempo estimado

3–4 horas

---

# Sprint 5: Cards de Demanda e Filtros

**Objetivo:** Cards de demanda padronizados (lista/outras vistas) e filtros alinhados ao design system.

**Referência em `prompt.md`:** "2️⃣ CARDS DE DEMANDA", "7️⃣ FILTROS".

## Entregas

- [x] **DemandaCard (lista/geral):** mesmo padrão do spec (header com PrioridadeBadge + Avatar, título, footer empreendimento/prazo/comentários); borda, sombra, hover border-primary-blue.
- [x] **Filtros:** linha de filtros com selects (Empreendimento, Responsável, Prioridade), date picker Prazo e botão "Limpar"; estilos consistentes (border, rounded-lg, focus ring primary-blue).
- [x] **Integração:** DemandasList / DemandasPage e Kanban usando o mesmo DemandaCard ou variante, e mesma barra de Filtros onde aplicável.

## Critérios de aceite

- Card de demanda único e reutilizável; badges e avatar do design system.
- Filtros visuais e usáveis; limpar reseta os valores.
- Lista de demandas e Kanban continuam funcionando.

## Tempo estimado

2 horas

---

# Sprint 6: Comentários e Formulários

**Objetivo:** Modal de comentários e formulários de demanda com boa UX.

**Referência em `prompt.md`:** "6️⃣ MODAL DE COMENTÁRIOS", "💬 Comentários" (melhorias), "Formulários" (Fase 7).

## Entregas

- [x] **Modal de comentários:** overlay com backdrop; container 600px max, rounded-xl, padding; lista de comentários com Avatar + nome + data relativa + texto; textarea com auto-resize (min/max height); botão Enviar; scroll suave para o último comentário; highlight breve para comentário novo.
- [x] **Formulário criar/editar demanda:** labels, inputs com borda e focus ring; validação com mensagens visíveis (ex.: texto vermelho); botões Salvar/Cancelar no padrão do design system; feedback de loading no submit (spinner + "Salvando...").
- [x] **Feedback de sucesso/erro:** após salvar, toast ou mensagem de sucesso; em erro, alerta visível com opção "Tentar novamente" se fizer sentido.

## Critérios de aceite

- Comentários legíveis; novo comentário aparece e fica em destaque por alguns segundos.
- Formulário valida e exibe erros; loading durante submit.
- Não quebrar fluxo de abrir demanda → comentar → editar.

## Tempo estimado

2–3 horas

---

# Sprint 7: Estados e Polimento

**Objetivo:** Loading, empty states, toasts e microanimações.

**Referência em `prompt.md`:** "ESTADOS VISUAIS", "ANIMAÇÕES E TRANSIÇÕES".

## Entregas

- [x] **Loading:** skeleton para listas/cards (ex.: demanda e dashboard); botões com spinner + texto "Salvando..." quando loading.
- [x] **Empty state:** componente reutilizável (ícone + título + descrição + CTA); usar em colunas vazias do Kanban e onde fizer sentido.
- [x] **Toast:** sucesso (ex.: "Demanda criada") e erro (ex.: "Erro ao salvar"); auto-dismiss para sucesso; posição fixa (ex.: top-right).
- [x] **Animações:** classes para fade-in e transições (duration-200) em cards e listas; active:scale-95 em botões já aplicado onde possível.

## Critérios de aceite

- Listas/cards não “piscam” sem feedback; skeleton ou spinner visível.
- Colunas vazias e listas vazias com mensagem e CTA quando aplicável.
- Ações críticas (criar/editar/salvar) dão feedback visual (toast ou inline).

## Tempo estimado

2–3 horas

---

# Sprint 8: Responsividade e Acessibilidade

**Objetivo:** Uso confortável em mobile e base acessível.

**Referência em `prompt.md`:** "RESPONSIVIDADE", "ACESSIBILIDADE".

## Entregas

- [x] **Mobile – Kanban:** em `< 768px`, exibir uma coluna por vez com tabs (Backlog, Em Andamento, Revisão, Concluído) ou swipe; cards em largura total.
- [x] **Mobile – Dashboard:** métricas e cards em 1 coluna; gráficos (se houver) simplificados ou em scroll horizontal.
- [x] **Mobile – Navbar:** menu hambúrguer já entregue na Sprint 2; conferir e ajustar se necessário.
- [x] **Mobile – Filtros:** em telas pequenas, filtros em modal ou drawer em vez de linha inteira; FAB para "Nova demanda" se fizer sentido.
- [x] **Acessibilidade:** focus visible em links e botões; botões/ícones com aria-label onde necessário; inputs com label associado e aria-invalid/aria-describedby em erro; contraste mínimo (texto 4.5:1, grande 3:1).

## Critérios de aceite

- Uso básico possível em 360px de largura (sem quebrar layout).
- Navegação por teclado (Tab, Enter) funcional nas telas principais.
- Sem regressões em desktop.

## Tempo estimado

2 horas

---

# Como executar

1. **Sempre na ordem:** Sprint 1 → 2 → … → 8.
2. **Ao iniciar uma sprint:** marcar tarefas da lista de entregas; usar `prompt.md` como spec detalhada.
3. **Ao terminar:** rodar o app, testar fluxos principais e responsivo; commit com mensagem tipo `feat(ui): Sprint N - Nome`.
4. **Não mudar comportamento de negócio:** apenas UI/UX e estrutura de componentes.
5. **Cursor/IA:** pode usar "Implemente a Sprint N conforme SPRINTS-UI-UX.md e prompt.md".

---

# Critérios de sucesso (geral)

- Interface alinhada ao spec Runrun.it (limpa, hierarquia clara, feedback visual).
- Dashboard e Kanban conforme "MELHORIAS CIRÚRGICAS" em `prompt.md`.
- Uso fluido em desktop e mobile.
- Nenhuma funcionalidade existente quebrada.

---

*Detalhes de cores, componentes e código de exemplo: `prompt.md`.*
