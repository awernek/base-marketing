# Base — Sistema de Coordenação de Marketing

Frontend em React + Vite para coordenação do time de design/marketing da **Genesis Empreendimentos Imobiliários**.

## Tech Stack

| Camada       | Tecnologia                        |
|--------------|-----------------------------------|
| Framework    | React 18 + Vite 5                 |
| Roteamento   | React Router DOM 6                |
| Estilo       | Tailwind CSS 3                    |
| HTTP         | Fetch API (wrapper em `src/services/api.js`) |
| Auth         | JWT (localStorage)                |
| Deploy       | Vercel                            |

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- Backend rodando (ver variável `VITE_API_URL`)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente (opcional — padrão: http://localhost:5055)
#    Criar arquivo .env na raiz:
#    VITE_API_URL=http://localhost:5055

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
```

> Para o guia completo de setup inicial (incluindo Git, .env e primeiro deploy), veja o arquivo **INIT.md**.

## Estrutura do projeto

```
src/
├── App.jsx                  # Rotas e layout (navbar + protected routes)
├── main.jsx                 # Entry point (React DOM)
├── index.css                # Tailwind directives + estilos globais
├── mockData.js              # Dados de teste (legado, não usado em produção)
├── components/
│   ├── Dashboard.jsx        # Painel da coordenadora
│   ├── Demandas.jsx         # Página de demandas (lista, filtros, criar/editar)
│   ├── CheckIn.jsx          # Check-in semanal do designer
│   └── Login.jsx            # Tela de login / ativação de conta
├── contexts/
│   └── AuthContext.jsx      # Provider de autenticação (JWT, roles)
├── services/
│   └── api.js               # Cliente HTTP — auth, pessoas, demandas, check-ins, dashboard
└── utils/
    └── enums.js             # Enums numéricos e labels (espelha contrato da API)
```

## Rotas

| Rota       | Acesso        | Descrição                    |
|------------|---------------|------------------------------|
| `/login`   | Público       | Login e ativação de conta    |
| `/`        | Coordenador   | Dashboard (visão geral)      |
| `/demandas`| Todos logados | Lista de demandas (coordenador: todas + filtros; designer: minhas) |
| `/checkin` | Todos logados | Check-in semanal             |

- Coordenador é redirecionado para `/` após login.
- Designer é redirecionado para `/checkin` após login.
- Rotas protegidas redirecionam para `/login` se não autenticado.

## Autenticação

Dois fluxos de acesso:

1. **Login direto** — email + senha (coordenador ou designer já ativado).
2. **Ativação por código** — designer recebe código por email, define senha e é autenticado automaticamente.

O token JWT é armazenado em `localStorage` e enviado via header `Authorization: Bearer <token>` em todas as requisições autenticadas. Sessão expirada (401) redireciona para login.

### Perfis

| Tipo        | Código | Permissões                                       |
|-------------|--------|--------------------------------------------------|
| Coordenador | 0      | Dashboard, CRUD pessoas, CRUD demandas, check-ins |
| Designer    | 1      | Check-in próprio, visualizar demandas atribuídas  |

## Features

### Dashboard (Coordenador)
- Visão geral: total de pessoas, demandas ativas, carga alta, demandas em risco, check-ins pendentes
- Visualização de carga do time (semáforo 🟢🟡🔴)
- Alertas automáticos (carga alta, demandas em risco)
- Lista de demandas ativas (ordenadas por status)
- Perfil detalhado de cada pessoa do time
- Notas privadas da coordenação
- Criar/editar demandas
- Gerenciar pessoas do time

### Check-in Semanal (Designer)
- Interface simples e amigável
- Seleção de carga (Baixa / Média / Alta)
- Campo opcional para bloqueios/contexto
- Um check-in por pessoa por semana (segunda a domingo)

### Login / Ativação
- Login com email e senha
- Fluxo de ativação: solicitar código → receber por email → definir senha

## API Backend

O contrato completo da API está documentado em `resumo.md`.

**Endpoints principais:**

| Módulo     | Base               | Exemplos                          |
|------------|--------------------|-----------------------------------|
| Auth       | `/api/auth`        | login, register, solicitar-codigo |
| Pessoas    | `/api/pessoas`     | CRUD + notas                      |
| Demandas   | `/api/demandas`    | CRUD + status + concluir          |
| Check-ins  | `/api/checkins`    | criar, listar, semana-atual       |
| Dashboard  | `/api/dashboard`   | overview                          |

**Variável de ambiente:** `VITE_API_URL` (padrão: `http://localhost:5055`)

## Deploy

Veja [DEPLOY.md](DEPLOY.md) para instruções detalhadas (Vercel via GitHub ou CLI).

```bash
# Deploy rápido via CLI
npm i -g vercel
vercel --prod
```

**CORS configurado no backend para:**
- `http://localhost:5173` (dev)
- `https://base-marketing.vercel.app` (produção)

## Notas de UX

- Sistema focado em **visibilidade**, não em controle
- Linguagem informal e humana
- Check-in é auto-reporte (empoderamento do time)
- Notas privadas **nunca** são compartilhadas
- Sem métricas tóxicas ou gamificação

---

**Desenvolvido para Genesis Empreendimentos Imobiliários**
