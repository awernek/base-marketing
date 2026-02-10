# Deploy na Vercel

## Opção 1: Via GitHub (Recomendado)

1. Criar repositório no GitHub
2. Push do código:
```bash
git init
git add .
git commit -m "Initial commit - Base Marketing MVP"
git remote add origin https://github.com/SEU-USUARIO/base-marketing.git
git push -u origin main
```

3. Ir em https://vercel.com
4. "New Project" > Importar seu repositório
5. Vercel detecta automaticamente Vite
6. Deploy! 🚀

**URL será algo como:** `base-marketing.vercel.app`

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

## Configuração Vercel (vercel.json)

Já está configurado! Se precisar customizar, use:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## Depois do deploy

Compartilhe a URL com sua esposa:
- "Teste as funcionalidades"
- "Navegue entre Dashboard e Check-in"
- "Veja se a linguagem está natural"
- "Mande feedback do que falta ou do que está sobrando"

**Importante:** Mostre que é um protótipo com dados fake para testar a UX antes de construir o backend.
