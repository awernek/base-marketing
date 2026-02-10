# Base — Sistema de Coordenação de Marketing

Frontend em React + Vite e **API serverless** para coordenação do time de design/marketing da **Genesis Empreendimentos Imobiliários**. Banco de dados no **Supabase**, deploy na **Vercel** (conectado ao GitHub).

## Tech Stack

| Camada       | Tecnologia                                      |
|--------------|--------------------------------------------------|
| Frontend     | React 18 + Vite 5                                |
| Roteamento   | React Router DOM 6                               |
| Estilo       | Tailwind CSS 3                                   |
| API          | Vercel Serverless Functions (Node.js)            |
| Banco        | Supabase (PostgreSQL)                            |
| Auth         | JWT (localStorage + server-side)                 |
| Deploy       | Vercel (via GitHub)                              |

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- Conta no **Supabase** (banco de dados)
- Conta na **Vercel** e repositório no **GitHub** (para deploy)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
#    Copie .env.example para .env e preencha (ver seção Variáveis de ambiente)

# 3. Desenvolvimento local
npm run dev
# Ou, para rodar frontend + API juntos (recomendado):
npx vercel dev

# 4. Build para produção
npm run build
```

> Para o guia completo de setup inicial (Supabase, .env, primeiro deploy), veja **INIT.md**.

## Variáveis de ambiente

| Variável                   | Onde usar | Descrição |
|----------------------------|-----------|-----------|
| `SUPABASE_URL`             | API (Vercel / serverless) | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Service Role Key do Supabase (nunca expor no frontend) |
| `JWT_SECRET`               | API | Chave secreta para assinar tokens JWT (mín. 64 caracteres) |
| `VITE_API_URL`             | Frontend | URL da API. Em produção na Vercel deixe **vazio** (mesma origem). Em dev local: `http://localhost:3000` se usar `vercel dev`. |

## Estrutura do projeto

```
├── api/                        # Vercel Serverless (API)
│   ├── [...path].js            # Handler único que roteia todas as requisições /api/*
│   └── _lib/
│       ├── auth.js            # Leitura de JWT, tipos de usuário
│       ├── supabase.js        # Cliente Supabase (Service Role)
│       ├── response.js        # Helpers de resposta (CORS, JSON, erros)
│       ├── router.js          # Tabela de rotas da API
│       └── handlers/
│           ├── auth.js       # login, register, solicitar-codigo, definir-senha
│           ├── pessoas.js    # CRUD pessoas, notas, convite
│           ├── empreendimentos.js
│           ├── demandas.js    # CRUD demandas, status, atualizações
│           ├── checkins.js
│           ├── dashboard.js  # overview
│           └── relatorios.js  # demandas concluídas, etc.
├── src/
│   ├── App.jsx                # Rotas e layout (navbar + rotas protegidas)
│   ├── main.jsx               # Entry point
│   ├── index.css              # Tailwind + estilos globais
│   ├── components/
│   │   ├── Dashboard.jsx       # Painel da coordenadora
│   │   ├── Demandas.jsx       # Lista, filtros, criar/editar demandas
│   │   ├── Calendario.jsx     # Visão em calendário
│   │   ├── Empreendimentos.jsx # CRUD empreendimentos (coordenador)
│   │   ├── Relatorios.jsx     # Relatórios (coordenador)
│   │   ├── CheckIn.jsx        # Check-in semanal do designer
│   │   └── Login.jsx          # Login e ativação de conta
│   ├── contexts/
│   │   └── AuthContext.jsx     # Autenticação (JWT, roles)
│   ├── services/
│   │   └── api.js             # Cliente HTTP para a API
│   └── utils/
│       └── enums.js           # Enums e labels (espelha contrato da API)
├── supabase-schema.sql        # Schema do banco (Supabase)
├── supabase-seed.sql         # Dados iniciais (opcional)
├── vercel.json               # Rewrites: /api/* → serverless, resto → SPA
└── api-contrato-frontend.md   # Contrato completo da API
```

## Rotas da aplicação

| Rota              | Acesso      | Descrição |
|-------------------|-------------|-----------|
| `/login`          | Público     | Login e ativação de conta |
| `/`               | Coordenador | Dashboard (visão geral) |
| `/empreendimentos`| Coordenador | CRUD empreendimentos |
| `/relatorios`     | Coordenador | Relatórios |
| `/demandas`       | Todos logados | Lista de demandas (coordenador: todas; designer: atribuídas) |
| `/calendario`     | Todos logados | Visão em calendário |
| `/checkin`        | Todos logados | Check-in semanal |

- Coordenador: redirecionado para `/` após login.  
- Designer: redirecionado para `/checkin` após login.  
- Rotas protegidas redirecionam para `/login` se não autenticado.

## Autenticação

1. **Login direto** — email + senha (coordenador ou designer já ativado).  
2. **Ativação por código** — designer recebe código por email, define senha e é autenticado.

O token JWT fica em `localStorage` e é enviado no header `Authorization: Bearer <token>`. Em 401 a aplicação redireciona para o login.

### Perfis

| Tipo        | Código | Permissões |
|-------------|--------|------------|
| Coordenador | 0      | Dashboard, Empreendimentos, Relatórios, CRUD pessoas e demandas, check-ins |
| Designer    | 1      | Check-in próprio, demandas atribuídas, calendário |

## API Backend

A API roda como **Vercel Serverless Functions** no mesmo projeto. Em produção, as requisições para `/api/*` são tratadas pelas funções em `api/`; o frontend usa a mesma origem, então `VITE_API_URL` pode ficar vazio.

**Documentação:** contrato completo em `api-contrato-frontend.md`.

**Módulos principais:**

| Módulo         | Base                  | Exemplos |
|----------------|-----------------------|----------|
| Auth           | `/api/auth`           | login, register, solicitar-codigo, definir-senha |
| Pessoas        | `/api/pessoas`        | CRUD, notas, convidar |
| Empreendimentos| `/api/empreendimentos`| CRUD |
| Demandas       | `/api/demandas`       | CRUD, status, concluir, atualizações |
| Check-ins      | `/api/checkins`       | criar, listar, semana-atual |
| Dashboard      | `/api/dashboard`      | overview |
| Relatórios     | `/api/relatorios`     | demandas-concluidas |

## Banco de dados (Supabase)

- **Schema:** executar `supabase-schema.sql` no SQL Editor do Supabase.  
- **Seed (opcional):** `supabase-seed.sql` para dados iniciais de teste.  
- As serverless functions usam **Service Role** para acessar o banco; nunca exponha a Service Role Key no frontend.

## Deploy (Vercel + GitHub)

1. Repositório no **GitHub** com o código do projeto.  
2. Em [vercel.com](https://vercel.com): **New Project** → importar o repositório.  
3. Configurar **Environment Variables** no projeto Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `VITE_API_URL` — deixar **vazio** em produção (mesma origem).  
4. Deploy automático a cada push na branch conectada.

O `vercel.json` já define:
- `/api/*` → função serverless `api/[...path].js`
- Demais rotas → `index.html` (SPA)

Detalhes em **DEPLOY.md** e **INIT.md**.

## Notas de UX

- Sistema focado em **visibilidade**, não em controle.  
- Linguagem informal e humana.  
- Check-in é auto-reporte (empoderamento do time).  
- Notas privadas da coordenação **nunca** são compartilhadas com designers.  
- Sem métricas tóxicas ou gamificação.

---

**Desenvolvido para Genesis Empreendimentos Imobiliários**
