# 🎨 REFATORAÇÃO COMPLETA DE UI/UX - INSPIRADO EM RUNRUN.IT

---

# ⚡ EXECUÇÃO POR SPRINTS

**Para executar na ordem certa, use o plano em:** [`docs/SPRINTS-UI-UX.md`](docs/SPRINTS-UI-UX.md)

| Sprint | Nome | Tempo |
|--------|------|-------|
| 1 | Sistema de Design | 2–3 h |
| 2 | Navbar e Layout | 1–1,5 h |
| 3 | Dashboard | 4–5 h |
| 4 | Kanban | 3–4 h |
| 5 | Cards de Demanda e Filtros | 2 h |
| 6 | Comentários e Formulários | 2–3 h |
| 7 | Estados e Polimento | 2–3 h |
| 8 | Responsividade e Acessibilidade | 2 h |

**Total: 18–24 h.** O arquivo de sprints contém checklist, critérios de aceite e referências às seções deste documento.

---

# CONTEXTO

O sistema Base Marketing já tem as funcionalidades implementadas (Kanban, Comentários, Priorização, Dashboard, etc), mas a **UI/UX está confusa e não intuitiva**. Precisamos refatorar completamente o design para ficar **limpo, profissional e fácil de usar**, inspirado no **Runrun.it**.

---

# PRINCÍPIOS DE DESIGN DO RUNRUN.IT

Baseado em análises e reviews de usuários do Runrun.it, os princípios são:

## ✅ O que o Runrun.it faz BEM (copiar)
1. **Interface limpa e minimalista** - muito espaço em branco
2. **Hierarquia visual clara** - títulos grandes, subtítulos médios, textos pequenos
3. **Cards bem estruturados** - bordas suaves, sombras sutis, padding generoso
4. **Cores suaves com destaques vibrantes** - fundo claro, acentos em azul/verde/laranja
5. **Tipografia consistente** - Inter ou similar, tamanhos bem definidos
6. **Ações primárias destacadas** - botões grandes e coloridos
7. **Feedback visual imediato** - hover states, loading states, sucesso/erro
8. **Responsivo** - funciona perfeitamente em mobile

## ❌ O que o Runrun.it faz MAL (evitar)
1. Curva de aprendizado íngreme para novos usuários
2. Muitos cliques para completar ações simples
3. Calendário confuso
4. Falta de feedback sonoro/visual em algumas ações

---

# SISTEMA DE DESIGN

## 🎨 Paleta de Cores

```css
/* Primárias */
--primary-blue: #3B82F6;      /* Azul principal (ações primárias) */
--primary-blue-dark: #2563EB;  /* Hover do azul */
--primary-blue-light: #DBEAFE; /* Background azul claro */

/* Secundárias */
--secondary-green: #10B981;    /* Sucesso, concluído */
--secondary-yellow: #F59E0B;   /* Atenção, em andamento */
--secondary-red: #EF4444;      /* Urgente, erro */
--secondary-purple: #8B5CF6;   /* Revisão, aprovação */

/* Neutras */
--gray-50: #F9FAFB;           /* Background principal */
--gray-100: #F3F4F6;          /* Background cards */
--gray-200: #E5E7EB;          /* Bordas */
--gray-300: #D1D5DB;          /* Bordas hover */
--gray-400: #9CA3AF;          /* Texto secundário */
--gray-500: #6B7280;          /* Texto terciário */
--gray-600: #4B5563;          /* Texto secundário escuro */
--gray-700: #374151;          /* Texto primário */
--gray-800: #1F2937;          /* Títulos */
--gray-900: #111827;          /* Títulos principais */

/* Branco e Preto */
--white: #FFFFFF;
--black: #000000;
```

## 📐 Espaçamento

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

## 🔤 Tipografia

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px - badges, labels pequenos */
--text-sm: 0.875rem;    /* 14px - texto secundário */
--text-base: 1rem;      /* 16px - texto principal */
--text-lg: 1.125rem;    /* 18px - subtítulos */
--text-xl: 1.25rem;     /* 20px - títulos cards */
--text-2xl: 1.5rem;     /* 24px - títulos seções */
--text-3xl: 1.875rem;   /* 30px - títulos páginas */
--text-4xl: 2.25rem;    /* 36px - títulos principais */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 🎭 Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## 🔘 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius: 0.375rem;     /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* Círculo completo */
```

---

# COMPONENTES PRINCIPAIS

## 1️⃣ NAVBAR (Barra Superior)

**Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🟦 Base Marketing    Dashboard  Demandas  Calendário  [Avatar] │
└─────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- **Altura:** 64px
- **Background:** Branco (#FFFFFF)
- **Border-bottom:** 1px solid var(--gray-200)
- **Padding horizontal:** var(--spacing-6)
- **Logo:** Fonte bold, tamanho 1.25rem, cor var(--primary-blue)
- **Links:** Fonte medium, tamanho 0.875rem, cor var(--gray-600)
  - Hover: cor var(--primary-blue)
  - Active: cor var(--primary-blue) + border-bottom 2px
- **Avatar:** Círculo 40px, iniciais do usuário, background var(--primary-blue)
- **Sombra:** var(--shadow-sm)

**Código base:**
```jsx
<nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
  <div className="flex items-center gap-8">
    <h1 className="text-xl font-bold text-primary-blue">Base Marketing</h1>
    <div className="flex gap-6">
      <NavLink to="/" className="nav-link">Dashboard</NavLink>
      <NavLink to="/demandas" className="nav-link">Demandas</NavLink>
      <NavLink to="/calendario" className="nav-link">Calendário</NavLink>
    </div>
  </div>
  <Avatar user={currentUser} />
</nav>

<style>
.nav-link {
  @apply text-sm font-medium text-gray-600 hover:text-primary-blue 
         pb-4 border-b-2 border-transparent transition-colors;
}
.nav-link.active {
  @apply text-primary-blue border-primary-blue;
}
</style>
```

---

## 2️⃣ CARDS DE DEMANDA (Kanban/Lista)

**Design:**
```
┌───────────────────────────────────────────┐
│ 🔴 Alta                          [Avatar] │
│                                            │
│ Campanha Lançamento Res. Horizonte        │
│                                            │
│ 🏢 Horizonte  📅 12 Fev  💬 3              │
└───────────────────────────────────────────┘
```

**Especificação:**
- **Background:** Branco (#FFFFFF)
- **Border:** 1px solid var(--gray-200)
- **Border-radius:** var(--radius-lg) (12px)
- **Padding:** var(--spacing-4) (16px)
- **Sombra:** var(--shadow) normal, var(--shadow-md) ao hover
- **Transição:** all 0.2s ease
- **Cursor:** pointer
- **Hover:** Border muda para var(--primary-blue)

**Estrutura interna:**
```jsx
<div className="demanda-card">
  {/* Header */}
  <div className="flex items-center justify-between mb-3">
    <PrioridadeBadge prioridade="alta" />
    <Avatar size="sm" user={responsavel} />
  </div>
  
  {/* Título */}
  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2">
    {titulo}
  </h3>
  
  {/* Footer */}
  <div className="flex items-center gap-3 text-xs text-gray-500">
    <span className="flex items-center gap-1">
      🏢 {empreendimento}
    </span>
    <span className="flex items-center gap-1">
      📅 {prazo}
    </span>
    {comentarios > 0 && (
      <span className="flex items-center gap-1">
        💬 {comentarios}
      </span>
    )}
  </div>
</div>

<style>
.demanda-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 
         shadow hover:shadow-md hover:border-primary-blue 
         transition-all duration-200 cursor-pointer;
}
</style>
```

---

## 3️⃣ BADGE DE PRIORIDADE

```jsx
// Componente
function PrioridadeBadge({ prioridade }) {
  const configs = {
    alta: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      emoji: '🔴'
    },
    media: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      emoji: '🟡'
    },
    baixa: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      emoji: '🟢'
    }
  };
  
  const config = configs[prioridade];
  
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
      border ${config.bg} ${config.text} ${config.border}
    `}>
      <span>{config.emoji}</span>
      <span className="capitalize">{prioridade}</span>
    </span>
  );
}
```

---

## 4️⃣ BOTÕES

**Primário (ações principais):**
```jsx
<button className="
  px-4 py-2 bg-primary-blue text-white font-medium rounded-lg
  hover:bg-primary-blue-dark active:scale-95
  transition-all duration-200
  shadow-sm hover:shadow-md
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Nova Demanda
</button>
```

**Secundário (ações alternativas):**
```jsx
<button className="
  px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg
  hover:bg-gray-200 active:scale-95
  transition-all duration-200
  border border-gray-300
">
  Cancelar
</button>
```

**Ghost (ações terciárias):**
```jsx
<button className="
  px-4 py-2 text-gray-600 font-medium rounded-lg
  hover:bg-gray-100 active:scale-95
  transition-all duration-200
">
  Ver mais
</button>
```

**Ícone (ações rápidas):**
```jsx
<button className="
  w-10 h-10 flex items-center justify-center
  rounded-lg text-gray-600
  hover:bg-gray-100 active:scale-95
  transition-all duration-200
">
  <Icon name="more" />
</button>
```

---

## 5️⃣ KANBAN BOARD

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [Filtros]                                         [+ Nova]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│ │ Backlog  │  │ Fazendo  │  │ Revisão  │  │ Concluído│        │
│ │   (5)    │  │   (3)    │  │   (2)    │  │   (12)   │        │
│ ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤        │
│ │ [Card 1] │  │ [Card 4] │  │ [Card 7] │  │ [Card 9] │        │
│ │ [Card 2] │  │ [Card 5] │  │ [Card 8] │  │ [Card10] │        │
│ │ [Card 3] │  │ [Card 6] │  │          │  │ [Card11] │        │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- **Container:** Background var(--gray-50), padding var(--spacing-6)
- **Colunas:** 
  - Largura mínima: 300px
  - Gap entre colunas: var(--spacing-4) (16px)
  - Scroll horizontal no mobile
- **Header da coluna:**
  - Background var(--gray-100)
  - Border-radius var(--radius-lg)
  - Padding var(--spacing-3)
  - Título: font-semibold, text-sm
  - Contador: badge cinza
- **Drop zone:**
  - Border: 2px dashed var(--gray-300)
  - Background: var(--gray-50) quando vazio
  - Background: var(--primary-blue-light) quando hovering
  - Min-height: 200px

**Código base:**
```jsx
<div className="kanban-container">
  <div className="kanban-header">
    <Filtros />
    <Button variant="primary">+ Nova Demanda</Button>
  </div>
  
  <div className="kanban-board">
    <KanbanColumn 
      titulo="Backlog" 
      status="a_fazer" 
      count={5}
      demandas={demandasBacklog}
    />
    <KanbanColumn 
      titulo="Em Andamento" 
      status="em_andamento" 
      count={3}
      demandas={demandasFazendo}
    />
    <KanbanColumn 
      titulo="Revisão" 
      status="em_revisao" 
      count={2}
      demandas={demandasRevisao}
    />
    <KanbanColumn 
      titulo="Concluído" 
      status="concluido" 
      count={12}
      demandas={demandasConcluido}
    />
  </div>
</div>

<style>
.kanban-container {
  @apply bg-gray-50 min-h-screen p-6;
}

.kanban-header {
  @apply flex items-center justify-between mb-6;
}

.kanban-board {
  @apply flex gap-4 overflow-x-auto pb-4;
}

.kanban-column {
  @apply flex-shrink-0 w-80 bg-gray-100 rounded-lg p-3;
}

.kanban-column-header {
  @apply flex items-center justify-between mb-3;
}

.kanban-column-title {
  @apply font-semibold text-sm text-gray-700;
}

.kanban-column-count {
  @apply px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs;
}

.kanban-drop-zone {
  @apply min-h-[200px] border-2 border-dashed border-gray-300 
         rounded-lg bg-gray-50 transition-colors;
}

.kanban-drop-zone.drag-over {
  @apply border-primary-blue bg-primary-blue-light;
}
</style>
```

---

## 6️⃣ MODAL DE COMENTÁRIOS

**Design:**
```
┌─────────────────────────────────────────┐
│ Comentários                      [X]     │
├─────────────────────────────────────────┤
│                                          │
│ [Avatar] Tati · há 2 horas              │
│ Cliente aprovou, pode publicar!         │
│                                          │
│ [Avatar] Bruno · há 30 min              │
│ Ótimo! Vou publicar agora.              │
│                                          │
├─────────────────────────────────────────┤
│ [Textarea]                              │
│ Adicione um comentário...               │
│                                          │
│                            [Enviar] ──→ │
└─────────────────────────────────────────┘
```

**Especificação:**
- **Modal overlay:** Background rgba(0,0,0,0.5), backdrop-blur
- **Modal container:**
  - Width: 600px (max-width)
  - Background: Branco
  - Border-radius: var(--radius-xl)
  - Padding: var(--spacing-6)
  - Sombra: var(--shadow-xl)
- **Comentário:**
  - Avatar: 32px, círculo
  - Nome: font-semibold, text-sm, cor var(--gray-900)
  - Data: font-normal, text-xs, cor var(--gray-500)
  - Texto: font-normal, text-sm, cor var(--gray-700)
  - Padding entre comentários: var(--spacing-4)
- **Input:**
  - Textarea: auto-resize, min-height 80px
  - Border: var(--gray-300)
  - Focus: border var(--primary-blue), ring 2px var(--primary-blue-light)

---

## 7️⃣ FILTROS

**Design:**
```
[🏢 Empreendimento ▼] [👤 Responsável ▼] [🎯 Prioridade ▼] [📅 Prazo] [🔄 Limpar]
```

**Especificação:**
```jsx
<div className="flex items-center gap-3 mb-6">
  <Select 
    placeholder="🏢 Empreendimento"
    options={empreendimentos}
    className="filter-select"
  />
  <Select 
    placeholder="👤 Responsável"
    options={pessoas}
    className="filter-select"
  />
  <Select 
    placeholder="🎯 Prioridade"
    options={prioridades}
    className="filter-select"
  />
  <DatePicker 
    placeholder="📅 Prazo"
    className="filter-date"
  />
  <Button variant="ghost" onClick={limparFiltros}>
    🔄 Limpar
  </Button>
</div>

<style>
.filter-select {
  @apply min-w-[180px] px-4 py-2 bg-white border border-gray-300 
         rounded-lg text-sm font-medium text-gray-700
         hover:border-gray-400 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue-light
         transition-all;
}
</style>
```

---

## 8️⃣ DASHBOARD CARDS

**Design:**
```
┌─────────────────────────────────────┐
│ 📊 Demandas Ativas                  │
│                                     │
│     42                              │
│     ──                              │
│     +8 esta semana                  │
└─────────────────────────────────────┘
```

**Especificação:**
```jsx
<div className="dashboard-card">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-sm font-medium text-gray-600">
      📊 Demandas Ativas
    </h3>
    <button className="text-gray-400 hover:text-gray-600">
      <Icon name="more" size={16} />
    </button>
  </div>
  
  <div className="mb-2">
    <div className="text-4xl font-bold text-gray-900">42</div>
  </div>
  
  <div className="text-xs text-green-600 flex items-center gap-1">
    <Icon name="trending-up" size={12} />
    <span>+8 esta semana</span>
  </div>
</div>

<style>
.dashboard-card {
  @apply bg-white border border-gray-200 rounded-lg p-6
         shadow-sm hover:shadow-md transition-all;
}
</style>
```

---

# MELHORIAS ESPECÍFICAS POR COMPONENTE

## 📋 Dashboard

**Problemas comuns:**
- Cards muito apertados
- Métricas sem contexto
- Cores confusas
- Difícil de escanear

**Solução:**
```jsx
<div className="dashboard-container">
  {/* Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Dashboard
    </h1>
    <p className="text-gray-600">
      Visão geral do time e demandas
    </p>
  </div>
  
  {/* Cards de Métricas */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <MetricCard 
      icon="📋"
      title="Demandas Ativas"
      value={42}
      change="+8"
      changeType="positive"
    />
    <MetricCard 
      icon="⚠️"
      title="Atrasadas"
      value={5}
      change="-2"
      changeType="negative"
    />
    <MetricCard 
      icon="👥"
      title="Time"
      value={8}
      subtitle="pessoas ativas"
    />
    <MetricCard 
      icon="✅"
      title="Taxa de Conclusão"
      value="87%"
      change="+5%"
      changeType="positive"
    />
  </div>
  
  {/* Gráficos */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard title="Demandas por Status">
      <PieChart data={statusData} />
    </ChartCard>
    <ChartCard title="Carga do Time">
      <BarChart data={cargaData} />
    </ChartCard>
  </div>
</div>
```

---

## 🎨 Kanban

**Problemas comuns:**
- Difícil arrastar (área de clique pequena)
- Cores muito vibrantes
- Cards muito pequenos
- Falta feedback visual

**Solução:**
- Aumentar padding dos cards (16px mínimo)
- Adicionar área de "grip" (:::) no topo do card
- Animações suaves ao arrastar (scale 1.05, opacity 0.8)
- Border destacado na coluna de destino
- Confete/animação ao concluir tarefa

```jsx
<DraggableCard>
  <div className="drag-handle">
    <Icon name="grip-vertical" className="text-gray-400" />
  </div>
  <div className="card-content">
    {/* Conteúdo do card */}
  </div>
</DraggableCard>

<style>
.drag-handle {
  @apply cursor-grab active:cursor-grabbing 
         p-2 -m-2 flex items-center justify-center;
}

.dragging {
  @apply scale-105 opacity-80 shadow-xl rotate-2;
}

.drop-target {
  @apply border-2 border-primary-blue bg-primary-blue-light;
}
</style>
```

---

## 💬 Comentários

**Problemas comuns:**
- Textarea muito pequena
- Falta contexto de quem comentou
- Difícil ler thread longa
- Sem scroll suave

**Solução:**
- Textarea com auto-resize (min 60px, max 200px)
- Avatar + nome + data bem visível
- Scroll automático para último comentário
- Highlight do comentário novo (3 segundos)

```jsx
function ComentarioItem({ comentario, isNew }) {
  return (
    <div className={`
      flex gap-3 p-4 rounded-lg transition-colors
      ${isNew ? 'bg-blue-50 animate-fade-in' : 'hover:bg-gray-50'}
    `}>
      <Avatar user={comentario.usuario} size="md" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {comentario.usuario.nome}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(comentario.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {comentario.texto}
        </p>
      </div>
    </div>
  );
}
```

---

## 🎯 Priorização

**Problemas comuns:**
- Badges pequenas demais
- Cores não intuitivas
- Difícil mudar prioridade

**Solução:**
- Badges maiores (height 28px)
- Dropdown rápido ao clicar
- Animação ao mudar

```jsx
<PrioridadeSelector value={prioridade} onChange={setPrioridade}>
  <PrioridadeBadge prioridade={prioridade} className="cursor-pointer" />
  
  <Dropdown>
    <DropdownItem onClick={() => setPrioridade('alta')}>
      🔴 Alta
    </DropdownItem>
    <DropdownItem onClick={() => setPrioridade('media')}>
      🟡 Média
    </DropdownItem>
    <DropdownItem onClick={() => setPrioridade('baixa')}>
      🟢 Baixa
    </DropdownItem>
  </Dropdown>
</PrioridadeSelector>
```

---

# RESPONSIVIDADE

## Mobile (< 768px)

**Kanban:**
- Uma coluna por vez com swipe horizontal
- Tabs no topo para trocar coluna
- Cards full-width

**Dashboard:**
- Cards empilhados (1 coluna)
- Gráficos simplificados
- Menu hamburguer

**Demandas:**
- Lista em vez de grid
- Filtros em modal
- FAB (Floating Action Button) para nova demanda

**Código:**
```jsx
// Mobile Kanban
<div className="md:hidden">
  <Tabs value={colunaAtiva} onChange={setColunaAtiva}>
    <Tab value="a_fazer">Backlog (5)</Tab>
    <Tab value="em_andamento">Fazendo (3)</Tab>
    <Tab value="em_revisao">Revisão (2)</Tab>
    <Tab value="concluido">Concluído (12)</Tab>
  </Tabs>
  
  <div className="p-4">
    <KanbanColumn status={colunaAtiva} demandas={demandas} />
  </div>
</div>

// Desktop Kanban
<div className="hidden md:flex gap-4">
  <KanbanColumn status="a_fazer" />
  <KanbanColumn status="em_andamento" />
  <KanbanColumn status="em_revisao" />
  <KanbanColumn status="concluido" />
</div>
```

---

# ANIMAÇÕES E TRANSIÇÕES

## Micro-interações

```css
/* Hover suave */
.interactive {
  @apply transition-all duration-200 ease-out;
}

.interactive:hover {
  @apply scale-[1.02] shadow-md;
}

/* Click feedback */
.interactive:active {
  @apply scale-95;
}

/* Fade in */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Slide in */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Pulse (para notificações) */
@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.animate-pulse-ring {
  animation: pulse-ring 2s infinite;
}
```

---

# ESTADOS VISUAIS

## Loading

```jsx
// Skeleton (cards de demanda)
<div className="skeleton-card">
  <div className="skeleton skeleton-badge" />
  <div className="skeleton skeleton-title" />
  <div className="skeleton skeleton-text" />
</div>

<style>
.skeleton {
  @apply bg-gray-200 animate-pulse rounded;
}

.skeleton-badge {
  @apply w-16 h-6 mb-3;
}

.skeleton-title {
  @apply w-full h-4 mb-2;
}

.skeleton-text {
  @apply w-3/4 h-3;
}
</style>

// Spinner (botões)
<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner className="mr-2" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</Button>
```

## Empty State

```jsx
<div className="empty-state">
  <div className="empty-state-icon">📭</div>
  <h3 className="empty-state-title">Nenhuma demanda aqui</h3>
  <p className="empty-state-description">
    Arraste demandas para esta coluna ou crie uma nova
  </p>
  <Button variant="primary">+ Nova Demanda</Button>
</div>

<style>
.empty-state {
  @apply flex flex-col items-center justify-center 
         py-12 px-4 text-center;
}

.empty-state-icon {
  @apply text-6xl mb-4;
}

.empty-state-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.empty-state-description {
  @apply text-sm text-gray-600 mb-6 max-w-xs;
}
</style>
```

## Erro

```jsx
<Alert variant="error">
  <AlertIcon name="alert-circle" />
  <AlertTitle>Erro ao salvar demanda</AlertTitle>
  <AlertDescription>
    Não foi possível conectar ao servidor. Tente novamente.
  </AlertDescription>
  <AlertActions>
    <Button variant="ghost" onClick={fechar}>Fechar</Button>
    <Button variant="primary" onClick={tentar}>Tentar Novamente</Button>
  </AlertActions>
</Alert>
```

## Sucesso

```jsx
<Toast variant="success">
  <ToastIcon name="check-circle" />
  <ToastText>Demanda criada com sucesso!</ToastText>
</Toast>

// Auto-dismiss após 3 segundos
// Slide in do topo direito
// Fade out ao fechar
```

---

# ACESSIBILIDADE

## Checklist

- [ ] Todas as ações podem ser feitas pelo teclado
- [ ] Tab order lógico
- [ ] Focus visible em todos os elementos interativos
- [ ] ARIA labels em ícones
- [ ] Alt text em imagens
- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande)
- [ ] Drag & drop funciona com teclado (dnd-kit já suporta)

```jsx
// Exemplo de botão acessível
<button
  className="icon-button"
  aria-label="Editar demanda"
  onClick={editar}
>
  <Icon name="edit" aria-hidden="true" />
</button>

// Exemplo de input acessível
<label htmlFor="titulo" className="form-label">
  Título da demanda
</label>
<input
  id="titulo"
  type="text"
  className="form-input"
  aria-required="true"
  aria-invalid={errors.titulo ? 'true' : 'false'}
  aria-describedby={errors.titulo ? 'titulo-error' : undefined}
/>
{errors.titulo && (
  <p id="titulo-error" className="form-error" role="alert">
    {errors.titulo}
  </p>
)}
```

---

# PERFORMANCE

## Otimizações

1. **Lazy loading de componentes:**
```jsx
const KanbanBoard = lazy(() => import('./components/KanbanBoard'));
const Calendario = lazy(() => import('./components/Calendario'));

<Suspense fallback={<LoadingSpinner />}>
  <KanbanBoard />
</Suspense>
```

2. **Virtualização de listas longas:**
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={demandas.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <DemandaCard demanda={demandas[index]} />
    </div>
  )}
</FixedSizeList>
```

3. **Debounce em filtros:**
```jsx
const [filtro, setFiltro] = useState('');
const debouncedFiltro = useDebounce(filtro, 300);

useEffect(() => {
  filtrarDemandas(debouncedFiltro);
}, [debouncedFiltro]);
```

---

# CHECKLIST DE IMPLEMENTAÇÃO

## Fase 1: Sistema de Design (2-3 horas)
- [ ] Criar arquivo de variáveis CSS (`styles/design-system.css`)
- [ ] Importar fonte Inter do Google Fonts
- [ ] Configurar Tailwind com cores customizadas
- [ ] Criar componentes base (Button, Input, Select, Badge)

## Fase 2: Navbar (1 hora)
- [ ] Refatorar navbar com novo design
- [ ] Adicionar active states
- [ ] Implementar avatar com menu dropdown
- [ ] Responsivo mobile (hamburguer)

## Fase 3: Cards de Demanda (2 horas)
- [ ] Refatorar card com novo layout
- [ ] Implementar badges de prioridade
- [ ] Adicionar hover states
- [ ] Animações suaves

## Fase 4: Kanban (3-4 horas)
- [ ] Refatorar layout das colunas
- [ ] Melhorar drag & drop (feedback visual)
- [ ] Implementar filtros bonitos
- [ ] Empty states
- [ ] Responsivo mobile (tabs)

## Fase 5: Dashboard (2-3 horas)
- [ ] Refatorar cards de métricas
- [ ] Implementar gráficos (Chart.js ou Recharts)
- [ ] Grid responsivo
- [ ] Loading states

## Fase 6: Comentários (2 horas)
- [ ] Refatorar modal
- [ ] Melhorar layout dos comentários
- [ ] Textarea auto-resize
- [ ] Scroll suave

## Fase 7: Formulários (2 horas)
- [ ] Refatorar forms de criar/editar demanda
- [ ] Validações visuais
- [ ] Error states
- [ ] Success feedback

## Fase 8: Polimento (2-3 horas)
- [ ] Adicionar todas as animações
- [ ] Toast notifications
- [ ] Loading skeletons
- [ ] Revisar responsividade
- [ ] Revisar acessibilidade

**Tempo total estimado: 18-24 horas**

---

# INSTRUÇÕES PARA O CURSOR AI

1. **Comece pela Fase 1** (Sistema de Design) - é a fundação de tudo
2. **Não quebre funcionalidades** - apenas melhore o visual
3. **Use Tailwind CSS** - evite CSS customizado desnecessário
4. **Teste em diferentes tamanhos** de tela após cada fase
5. **Commit após cada fase** completa
6. **Peça confirmação** antes de grandes refatorações

---

# CRITÉRIOS DE SUCESSO

A refatoração está completa quando:

1. ✅ Tati abre o sistema e diz "nossa, ficou profissional!"
2. ✅ Um designer novo consegue usar sem tutorial
3. ✅ Funciona perfeitamente no celular dela
4. ✅ Todas as ações têm feedback visual imediato
5. ✅ Carrega rápido (< 2 segundos)
6. ✅ Nenhuma funcionalidade parou de funcionar

---

Boa sorte! 🎨🚀

# 🎯 MELHORIAS CIRÚRGICAS - DASHBOARD E KANBAN

## CONTEXTO

O sistema Base Marketing já está funcional, mas o **Dashboard** e o **Kanban** precisam de melhorias visuais específicas. A navbar e calendário estão OK.

---

# PARTE 1: DASHBOARD

## 🎨 Objetivos

1. Criar visual **profissional e atrativo**
2. Adicionar **métricas visuais** (não só números)
3. Melhorar **hierarquia de informação**
4. Reduzir **poluição visual**

---

## 1️⃣ CARDS DO TIME (seção "🟢 Time")

### ❌ Estado Atual (RUIM)
```
┌─────────────┐
│ Ana         │
│ Alta        │
│ 2 demandas  │
└─────────────┘
```
- Muito texto
- Sem visual
- Sem cor
- Sem hierarquia

### ✅ Estado Desejado (BOM)
```
┌──────────────────────────┐
│  [Avatar  Ana            │
│   AS]     Alta      🔴   │
│           2 demandas     │
│                          │
│  ████████░░ 80% carga    │
└──────────────────────────┘
```

### 📝 Implementação

```jsx
// Componente PessoaCard.jsx
function PessoaCard({ pessoa }) {
  const cargaConfig = {
    alta: { cor: 'bg-red-500', emoji: '🔴', porcentagem: 90 },
    media: { cor: 'bg-yellow-500', emoji: '🟡', porcentagem: 60 },
    baixa: { cor: 'bg-green-500', emoji: '🟢', porcentagem: 30 }
  };
  
  const config = cargaConfig[pessoa.carga];
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar com iniciais */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
          {pessoa.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{pessoa.nome}</h3>
          <p className="text-xs text-gray-500">{pessoa.demandasAtivas} demandas ativas</p>
        </div>
        
        {/* Badge de carga */}
        <div className="flex items-center gap-1">
          <span className="text-lg">{config.emoji}</span>
        </div>
      </div>
      
      {/* Barra de progresso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 capitalize">{pessoa.carga}</span>
          <span className="text-gray-500 font-medium">{config.porcentagem}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full ${config.cor} rounded-full transition-all duration-500`}
            style={{ width: `${config.porcentagem}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

**CSS adicional:**
```css
/* Gradiente suave no avatar */
.avatar-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Animação da barra de progresso */
@keyframes grow {
  from { width: 0%; }
  to { width: var(--final-width); }
}
```

---

## 2️⃣ MÉTRICAS VISUAIS (topo do dashboard)

### ❌ Estado Atual
Sem métricas visuais no topo

### ✅ Estado Desejado

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📋           │ │ ⚠️           │ │ ✅           │ │ 👥           │
│ Ativas       │ │ Atrasadas    │ │ Concluídas   │ │ Time         │
│              │ │              │ │              │ │              │
│ 12           │ │ 3            │ │ 45           │ │ 8            │
│ +3 semana    │ │ -1 semana    │ │ esta semana  │ │ pessoas      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### 📝 Implementação

```jsx
// Componente MetricCard.jsx
function MetricCard({ icon, titulo, valor, mudanca, tipo }) {
  const tipoConfig = {
    positivo: { cor: 'text-green-600', bgCor: 'bg-green-50', icon: '↑' },
    negativo: { cor: 'text-red-600', bgCor: 'bg-red-50', icon: '↓' },
    neutro: { cor: 'text-gray-600', bgCor: 'bg-gray-50', icon: '•' }
  };
  
  const config = tipoConfig[tipo] || tipoConfig.neutro;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <div className={`w-2 h-2 rounded-full ${config.bgCor}`} />
      </div>
      
      {/* Título */}
      <h3 className="text-sm font-medium text-gray-600 mb-2">{titulo}</h3>
      
      {/* Valor principal */}
      <p className="text-3xl font-bold text-gray-900 mb-2">{valor}</p>
      
      {/* Mudança */}
      {mudanca && (
        <div className={`flex items-center gap-1 text-sm ${config.cor}`}>
          <span className="font-medium">{config.icon}</span>
          <span>{mudanca}</span>
        </div>
      )}
    </div>
  );
}

// Uso no Dashboard
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  <MetricCard 
    icon="📋"
    titulo="Demandas Ativas"
    valor="12"
    mudanca="+3 esta semana"
    tipo="positivo"
  />
  <MetricCard 
    icon="⚠️"
    titulo="Atrasadas"
    valor="3"
    mudanca="-1 esta semana"
    tipo="positivo"
  />
  <MetricCard 
    icon="✅"
    titulo="Concluídas"
    valor="45"
    mudanca="esta semana"
    tipo="neutro"
  />
  <MetricCard 
    icon="👥"
    titulo="Time Ativo"
    valor="8"
    mudanca="pessoas"
    tipo="neutro"
  />
</div>
```

---

## 3️⃣ SEÇÃO "PRÓXIMOS PRAZOS"

### ❌ Estado Atual
Lista simples com bolinhas

### ✅ Estado Desejado
Timeline visual com cards compactos

### 📝 Implementação

```jsx
function PrazoCard({ demanda }) {
  const diasRestantes = Math.ceil((new Date(demanda.prazo) - new Date()) / (1000 * 60 * 60 * 24));
  const urgente = diasRestantes <= 2;
  
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border-l-4 
      ${urgente ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'}
      hover:bg-gray-100 transition-colors
    `}>
      {/* Badge de prioridade */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm
        ${urgente ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}
      `}>
        {diasRestantes}d
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {demanda.titulo}
        </h4>
        <p className="text-xs text-gray-600">
          {demanda.responsavel} • {demanda.empreendimento}
        </p>
      </div>
      
      {/* Ação */}
      <button className="text-gray-400 hover:text-gray-600 p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// Container
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      📅 Próximos Prazos
      <span className="text-xs font-normal text-gray-500">(7 dias)</span>
    </h2>
  </div>
  
  <div className="space-y-2">
    {prazos.map(p => <PrazoCard key={p.id} demanda={p} />)}
  </div>
</div>
```

---

## 4️⃣ SEÇÃO "ALERTAS"

### ❌ Estado Atual
Caixa amarela grande e gritante

### ✅ Estado Desejado
Cards discretos e acionáveis

### 📝 Implementação

```jsx
function AlertaCard({ alerta }) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-700 text-lg">⚠️</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 mb-1">
            {alerta.pessoa}
          </h4>
          <p className="text-sm text-gray-700">
            {alerta.mensagem}
          </p>
        </div>
        
        <button className="text-sm font-medium text-yellow-700 hover:text-yellow-800 whitespace-nowrap">
          Ver mais →
        </button>
      </div>
    </div>
  );
}

// Container
<div className="space-y-3">
  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
    ⚠️ Alertas
    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
      {alertas.length}
    </span>
  </h2>
  
  {alertas.map((a, i) => <AlertaCard key={i} alerta={a} />)}
</div>
```

---

## 5️⃣ SEÇÃO "DEMANDAS ATIVAS"

### ❌ Estado Atual
Cards expandidos ocupando muito espaço

### ✅ Estado Desejado
Cards compactos em grid responsivo

### 📝 Implementação

```jsx
function DemandaCompactCard({ demanda }) {
  const prioridadeConfig = {
    alta: { cor: 'bg-red-100 text-red-700 border-red-300', emoji: '🔴' },
    media: { cor: 'bg-yellow-100 text-yellow-700 border-yellow-300', emoji: '🟡' },
    baixa: { cor: 'bg-green-100 text-green-700 border-green-300', emoji: '🟢' }
  };
  
  const config = prioridadeConfig[demanda.prioridade];
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border
          ${config.cor}
        `}>
          {config.emoji} {demanda.prioridade}
        </span>
        
        {/* Avatar responsável */}
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
          {demanda.responsavel.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>
      
      {/* Título */}
      <h3 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2 leading-tight">
        {demanda.titulo}
      </h3>
      
      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          🏢 {demanda.empreendimento}
        </span>
        <span className="flex items-center gap-1">
          📅 {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

// Grid
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      📋 Demandas Ativas
      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
        {demandas.length}
      </span>
    </h2>
    
    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
      Ver todas →
    </button>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {demandas.slice(0, 6).map(d => <DemandaCompactCard key={d.id} demanda={d} />)}
  </div>
</div>
```

---

# PARTE 2: KANBAN

## 🎨 Objetivos

1. **Colunas com headers visuais** bem destacados
2. **Cards com mais padding** e respiração
3. **Badges de prioridade consistentes** (🔴🟡🟢)
4. **Contador por coluna** visível
5. **Feedback visual de drag** claro
6. **Ocupar altura total** da tela

---

## 1️⃣ HEADER DAS COLUNAS

### ❌ Estado Atual
Só o nome da coluna, sem destaque

### ✅ Estado Desejado
Header colorido com contador

### 📝 Implementação

```jsx
function KanbanColumnHeader({ titulo, status, count, cor }) {
  const coresConfig = {
    backlog: { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-200' },
    em_andamento: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-200' },
    em_revisao: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-200' },
    concluido: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-200' }
  };
  
  const config = coresConfig[status];
  
  return (
    <div className={`${config.bg} rounded-t-xl px-4 py-3 flex items-center justify-between sticky top-0 z-10`}>
      <h3 className={`font-semibold text-sm ${config.text}`}>
        {titulo}
      </h3>
      <span className={`${config.badge} ${config.text} px-2 py-1 rounded-full text-xs font-bold`}>
        {count}
      </span>
    </div>
  );
}
```

---

## 2️⃣ ESTRUTURA DA COLUNA

### 📝 Implementação

```jsx
function KanbanColumn({ titulo, status, demandas }) {
  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
      <KanbanColumnHeader 
        titulo={titulo}
        status={status}
        count={demandas.length}
      />
      
      {/* Drop Zone */}
      <div className="p-3 min-h-[600px] space-y-3">
        {demandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm text-gray-500">Nenhuma demanda</p>
          </div>
        ) : (
          demandas.map(d => <KanbanCard key={d.id} demanda={d} />)
        )}
      </div>
    </div>
  );
}
```

---

## 3️⃣ CARD DA DEMANDA (KANBAN)

### ❌ Estado Atual
Pouco padding, badges confusas

### ✅ Estado Desejado
Padding generoso, badges corretas

### 📝 Implementação

```jsx
function KanbanCard({ demanda, isDragging }) {
  const prioridadeConfig = {
    alta: { cor: 'bg-red-100 text-red-800 border-red-300', emoji: '🔴' },
    media: { cor: 'bg-yellow-100 text-yellow-800 border-yellow-300', emoji: '🟡' },
    baixa: { cor: 'bg-green-100 text-green-800 border-green-300', emoji: '🟢' }
  };
  
  const tipoConfig = {
    campanha: { cor: 'bg-purple-100 text-purple-700', label: 'Campanha' },
    post: { cor: 'bg-blue-100 text-blue-700', label: 'Post' },
    landing: { cor: 'bg-orange-100 text-orange-700', label: 'Landing' },
    institucional: { cor: 'bg-gray-100 text-gray-700', label: 'Institucional' }
  };
  
  const prioridade = prioridadeConfig[demanda.prioridade];
  const tipo = tipoConfig[demanda.tipo];
  
  return (
    <div className={`
      bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200
      hover:shadow-md hover:border-blue-400 
      cursor-grab active:cursor-grabbing
      transition-all duration-200
      ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
    `}>
      {/* Grip handle (opcional) */}
      <div className="flex items-center justify-center mb-2 -mt-2">
        <div className="w-8 h-1 bg-gray-300 rounded-full" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`
          inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border
          ${prioridade.cor}
        `}>
          {prioridade.emoji} {demanda.prioridade}
        </span>
        
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-sm">
          {demanda.responsavel.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>
      
      {/* Título */}
      <h4 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2 leading-snug">
        {demanda.titulo}
      </h4>
      
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${tipo.cor}`}>
          {tipo.label}
        </span>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1 truncate">
          🏢 {demanda.empreendimento}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          📅 {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>
      
      {/* Comentários (se tiver) */}
      {demanda.comentarios > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            💬 {demanda.comentarios} {demanda.comentarios === 1 ? 'comentário' : 'comentários'}
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## 4️⃣ LAYOUT DO KANBAN BOARD

### 📝 Implementação

```jsx
function KanbanBoard() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header com filtros */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Filtros aqui (manter como está) */}
      </div>
      
      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-4 h-full">
          <KanbanColumn 
            titulo="Backlog" 
            status="backlog"
            demandas={demandasBacklog}
          />
          <KanbanColumn 
            titulo="Em Andamento" 
            status="em_andamento"
            demandas={demandasAndamento}
          />
          <KanbanColumn 
            titulo="Revisão" 
            status="em_revisao"
            demandas={demandasRevisao}
          />
          <KanbanColumn 
            titulo="Concluído" 
            status="concluido"
            demandas={demandasConcluido}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 5️⃣ FEEDBACK VISUAL DE DRAG

### 📝 Implementação com @dnd-kit

```jsx
import { DndContext, DragOverlay } from '@dnd-kit/core';

function KanbanBoard() {
  const [activeId, setActiveId] = useState(null);
  
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Colunas */}
      <div className="flex gap-4">
        {/* ... */}
      </div>
      
      {/* Overlay durante drag */}
      <DragOverlay>
        {activeId ? (
          <div className="rotate-3 scale-105">
            <KanbanCard demanda={getDemandaById(activeId)} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// CSS adicional
.droppable-over {
  @apply bg-blue-50 border-blue-300;
}

.draggable-dragging {
  @apply opacity-50;
}
```

---

# CHECKLIST DE IMPLEMENTAÇÃO

## Dashboard
- [ ] Adicionar cards de métricas no topo (4 cards)
- [ ] Refatorar cards do time (avatar + barra de progresso)
- [ ] Melhorar seção "Próximos Prazos" (cards compactos)
- [ ] Refatorar seção "Alertas" (gradiente + acionável)
- [ ] Transformar "Demandas Ativas" em grid 3 colunas
- [ ] Adicionar espaçamento consistente (gap-4 a gap-8)
- [ ] Garantir responsividade mobile

## Kanban
- [ ] Adicionar headers coloridos nas colunas
- [ ] Aumentar padding dos cards (p-4)
- [ ] Corrigir badges de prioridade (🔴🟡🟢)
- [ ] Adicionar contador por coluna no header
- [ ] Implementar feedback visual de drag (opacity + rotate)
- [ ] Ocupar altura total da tela (h-screen)
- [ ] Empty state bonito quando coluna vazia
- [ ] Grip handle nos cards (barra cinza no topo)

---

# RESULTADO ESPERADO

## Dashboard ANTES vs DEPOIS

**ANTES:**
- Texto simples
- Sem hierarquia
- Alertas gritantes
- Tudo listado

**DEPOIS:**
- Cards com métricas visuais
- Hierarquia clara
- Alertas discretos
- Grid organizado
- Cores harmoniosas
- Barras de progresso

## Kanban ANTES vs DEPOIS

**ANTES:**
- Colunas invisíveis
- Cards apertados
- Badges confusas
- Muito espaço vazio

**DEPOIS:**
- Headers coloridos
- Cards com padding generoso
- Badges consistentes (🔴🟡🟢)
- Altura total preenchida
- Drag suave com feedback
- Empty states bonitos

---

# TEMPO ESTIMADO

- Dashboard: 4-5 horas
- Kanban: 3-4 horas
- **Total: 7-9 horas**

---

Implemente tudo isso e me mostre o resultado! 🚀