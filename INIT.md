# INIT — Guia de Setup Inicial

Passo a passo para configurar o projeto do zero: Supabase, variáveis de ambiente, desenvolvimento local e deploy na Vercel via GitHub.

---

## 1. Pré-requisitos

| Ferramenta   | Versão mínima | Verificar        |
|--------------|---------------|------------------|
| Node.js      | 18            | `node -v`        |
| npm          | 9             | `npm -v`         |
| Git          | 2.x           | `git --version`  |

Contas (gratuitas): **Supabase**, **GitHub**, **Vercel**.

---

## 2. Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/base-marketing.git
cd base-marketing
# ou, se o frontend estiver em subpasta:
# cd base-marketing/frontend
```

> Se já tem a pasta, pule para o passo 3.

---

## 3. Instalar dependências

```bash
npm install
```

---

## 4. Configurar o Supabase (banco de dados)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto (ou use um existente).
2. No painel do projeto: **SQL Editor**.
3. Execute o conteúdo de **`supabase-schema.sql`** (cria tabelas e estrutura).
4. (Opcional) Execute **`supabase-seed.sql`** para dados iniciais de teste.
5. Em **Project Settings → API** anote:
   - **Project URL** → será `SUPABASE_URL`
   - **Service Role** (secret) → será `SUPABASE_SERVICE_ROLE_KEY`  
   ⚠️ Nunca use a Service Role no frontend; apenas nas serverless functions.

---

## 5. Variáveis de ambiente

Crie o arquivo **`.env`** na raiz do projeto (mesmo nível do `package.json`). Use o `.env.example` como base:

```env
# ─── Supabase ────────────────────────────────────────────
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ─── JWT (tokens da aplicação) ─────────────────────────────
JWT_SECRET=gere-uma-chave-secreta-aqui-com-pelo-menos-64-caracteres

# ─── Frontend (Vite — prefixo VITE_) ──────────────────────
# Deixe vazio para produção (mesma origin na Vercel).
# Em dev com "vercel dev": pode deixar vazio ou usar http://localhost:3000
VITE_API_URL=
```

| Variável                   | Obrigatório | Descrição |
|----------------------------|-------------|-----------|
| `SUPABASE_URL`             | Sim (API)   | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY`| Sim (API)   | Chave Service Role do Supabase |
| `JWT_SECRET`               | Sim (API)   | Chave para assinar JWT (mín. 64 caracteres) |
| `VITE_API_URL`             | Não         | URL da API. Vazio = mesma origem. Em dev com `vercel dev`: `http://localhost:3000` ou vazio. |

> Variáveis que começam com `VITE_` são expostas ao frontend. **Não** coloque `SUPABASE_SERVICE_ROLE_KEY` nem `JWT_SECRET` com prefixo `VITE_`.

---

## 6. Rodar em desenvolvimento

### Opção A: Só o frontend (Vite)

```bash
npm run dev
```

Abre em `http://localhost:5173`. A **API** precisa estar disponível: use a Opção B ou um deploy de preview na Vercel e configure `VITE_API_URL` com a URL da API.

### Opção B: Frontend + API local (recomendado)

```bash
npx vercel dev
```

Sobe o app e as serverless functions em `http://localhost:3000`. Use essa URL no navegador. Não é necessário definir `VITE_API_URL` (mesma origem) ou defina `VITE_API_URL=http://localhost:3000`.

### Verificar se está funcionando

1. Abra a URL do dev (5173 ou 3000).
2. Deve aparecer a tela de login.
3. Se já existir usuário no banco (seed ou cadastrado), faça login.
4. Coordenador → Dashboard (`/`). Designer → Check-in (`/checkin`).

---

## 7. Backend (API)

O “backend” é a pasta **`api/`**: funções serverless da Vercel que falam com o **Supabase** e usam **JWT** para autenticação. Não há servidor .NET separado.

- Em **produção**: a Vercel serve o frontend (build em `dist/`) e as rotas `/api/*` nas serverless.
- Em **dev** com `vercel dev`: o mesmo comportamento na sua máquina.

Certifique-se de que no Supabase:

- O schema foi aplicado (`supabase-schema.sql`).
- Existe pelo menos um usuário (coordenador) na tabela de usuários para poder fazer login (ou use o seed).

**Endpoints que o frontend consome** (resumo; ver `api-contrato-frontend.md` para o contrato completo):

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/solicitar-codigo
POST /api/auth/definir-senha
GET  /api/pessoas, POST, PUT, DELETE, notas, convidar
GET  /api/empreendimentos, POST, PUT, DELETE
GET  /api/demandas, POST, PUT, status, concluir, atualizacoes
GET  /api/checkins, POST, semana-atual, pessoa/:id
GET  /api/dashboard/overview
GET  /api/relatorios/demandas-concluidas
```

---

## 8. Build para produção

```bash
npm run build
```

Gera a pasta **`dist/`** com os arquivos estáticos. Para testar localmente:

```bash
npm run preview
```

---

## 9. Deploy na Vercel (via GitHub)

### Repositório no GitHub

1. Crie um repositório no GitHub (ex.: `base-marketing`).
2. Configure o remote e faça push:

```bash
git init
git add .
git commit -m "Initial commit - Base Marketing"
git remote add origin https://github.com/SEU-USUARIO/base-marketing.git
git branch -M main
git push -u origin main
```

### Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar conta GitHub).
2. **Add New** → **Project** → importe o repositório **base-marketing**.
3. Configure as **Environment Variables** do projeto:
   - `SUPABASE_URL` = URL do projeto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key do Supabase
   - `JWT_SECRET` = mesma chave usada localmente (mín. 64 caracteres)
   - `VITE_API_URL` = **deixe vazio** (em produção a API e o frontend estão na mesma origem)
4. **Deploy**. A Vercel detecta Vite e o `vercel.json` (rewrites para `/api/*` e SPA).
5. A partir daí, cada push na branch conectada gera deploy automático.

URL típica: `https://seu-projeto.vercel.app`.

Mais detalhes em **DEPLOY.md**.

---

## 10. Estrutura de autenticação

O sistema usa JWT com dois perfis:

| Perfil      | `tipo` | Acesso |
|-------------|--------|--------|
| Coordenador | 0      | Dashboard, Empreendimentos, Relatórios, pessoas, demandas, check-ins |
| Designer    | 1      | Check-in próprio, demandas atribuídas, calendário |

### Fluxo de login

```
Email + senha → POST /api/auth/login → JWT → localStorage → header Authorization
```

### Fluxo de ativação (Designer novo)

```
1. POST /api/auth/solicitar-codigo  → backend envia código por email
2. POST /api/auth/definir-senha     → valida código, define senha, retorna JWT
```

---

## 11. Scripts disponíveis

| Comando           | Descrição |
|-------------------|-----------|
| `npm run dev`     | Servidor de desenvolvimento (só frontend, porta 5173) |
| `npm run build`   | Build de produção (gera `dist/`) |
| `npm run preview` | Preview local do build de produção |
| `npx vercel dev`  | Frontend + API local (porta 3000) |

---

## Troubleshooting

### "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias"

- A API (serverless) não está recebendo as variáveis. Em **dev**: confira o `.env` na raiz. Em **produção**: confira Environment Variables no projeto Vercel.

### "CORS error" no console

- Em dev com `npm run dev` (porta 5173): defina `VITE_API_URL` apontando para onde a API está (ex.: `http://localhost:3000` se usar `vercel dev` em outro terminal).
- Em produção com `VITE_API_URL` vazio não deve dar CORS (mesma origem).

### "Sessão expirada" ao navegar

- O token JWT expirou. Faça login novamente. O tempo de expiração é definido na API (auth).

### Tela branca / erro de rota

- Limpe o storage: no console do navegador, `localStorage.clear()` e recarregue.

### `npm run dev` não inicia

- Rode `npm install`.
- Verifique se a porta 5173 está livre ou use `npx vite --port 5174`.

### API retorna 404 em produção

- Confirme que o `vercel.json` tem o rewrite de `/api/:path*` para `/api/[...path]` e que o arquivo `api/[...path].js` existe.

---

## Checklist de primeiro setup

- [ ] Node.js >= 18 instalado
- [ ] `npm install` executado sem erros
- [ ] Projeto Supabase criado e **supabase-schema.sql** executado
- [ ] `.env` criado com `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` e, se precisar, `VITE_API_URL`
- [ ] `npx vercel dev` ou `npm run dev` abre a tela de login
- [ ] Login funciona (usuário no banco, ex.: seed)
- [ ] Repositório no GitHub e projeto na Vercel com as mesmas variáveis de ambiente
- [ ] Deploy na Vercel concluído e app acessível na URL gerada
