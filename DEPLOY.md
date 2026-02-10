# Deploy na Vercel

O projeto usa **Supabase** como banco de dados e é publicado na **Vercel** a partir do **GitHub**. Cada push na branch conectada gera deploy automático.

## Opção 1: Via GitHub (Recomendado)

1. Criar repositório no GitHub e fazer push do código:
```bash
git init
git add .
git commit -m "Initial commit - Base Marketing"
git remote add origin https://github.com/SEU-USUARIO/base-marketing.git
git branch -M main
git push -u origin main
```

2. Acessar https://vercel.com → **Add New** → **Project** → importar o repositório.
3. Configurar **Environment Variables** no projeto:
   - `SUPABASE_URL` — URL do projeto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` — Service Role Key do Supabase
   - `JWT_SECRET` — chave para JWT (mín. 64 caracteres)
   - `VITE_API_URL` — deixar **vazio** (API e frontend na mesma origem)
4. Deploy. A Vercel detecta Vite e o `vercel.json` (rewrites para `/api/*` e SPA).

**URL será algo como:** `seu-projeto.vercel.app`

---

## Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta do projeto
vercel

# Seguir prompts
# Deploy de produção:
vercel --prod
```

---

## Configuração (vercel.json)

O `vercel.json` já define:

- **Rewrites:** `/api/*` → serverless `api/[...path].js`; demais rotas → `index.html` (SPA).
- Build e output são detectados automaticamente (Vite → `dist/`).

Para mais detalhes de setup inicial (Supabase, .env, primeiro deploy), veja **INIT.md**.
