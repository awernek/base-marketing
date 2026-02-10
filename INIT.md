# INIT — Guia de Setup Inicial

Passo a passo para configurar o projeto do zero em uma máquina nova.

---

## 1. Pré-requisitos

| Ferramenta | Versão mínima | Verificar              |
|------------|---------------|------------------------|
| Node.js    | 18            | `node -v`              |
| npm        | 9             | `npm -v`               |
| Git        | 2.x           | `git --version`        |

---

## 2. Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/base-marketing.git
cd base-marketing/frontend
```

> Se já tem a pasta, pule para o passo 3.

---

## 3. Instalar dependências

```bash
npm install
```

---

## 4. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (mesmo nível do `package.json`):

```env
# URL do backend (sem barra final)
VITE_API_URL=http://localhost:5055
```

| Variável       | Descrição                        | Padrão                    |
|----------------|----------------------------------|---------------------------|
| VITE_API_URL   | URL base da API backend          | `http://localhost:5055`   |

> **Importante:** variáveis Vite devem começar com `VITE_` para serem expostas ao frontend.

> **Produção (Vercel):** configure `VITE_API_URL` nas Environment Variables do projeto na Vercel.

---

## 5. Rodar em desenvolvimento

```bash
npm run dev
```

O Vite inicia em `http://localhost:5173`. Acesse no navegador.

### Verificar se está funcionando

1. Abra `http://localhost:5173` — deve aparecer a tela de login.
2. Se o backend estiver rodando, faça login com um usuário existente.
3. Coordenador vai para o Dashboard (`/`), Designer vai para Check-in (`/checkin`).

---

## 6. Backend necessário

O frontend depende do backend .NET rodando. Certifique-se de que:

- O backend está rodando na porta configurada em `VITE_API_URL`
- CORS está habilitado para `http://localhost:5173`
- Existe pelo menos um usuário cadastrado (Coordenador) para login

### Endpoints que o frontend consome

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/solicitar-codigo
POST /api/auth/definir-senha
GET  /api/pessoas
GET  /api/pessoas/lista
POST /api/pessoas
PUT  /api/pessoas/{id}
PUT  /api/pessoas/{id}/notas
DELETE /api/pessoas/{id}
GET  /api/demandas
GET  /api/demandas/ativas
GET  /api/demandas/risco
POST /api/demandas
PUT  /api/demandas/{id}
PUT  /api/demandas/{id}/status
PUT  /api/demandas/{id}/concluir
GET  /api/checkins/semana-atual
GET  /api/checkins/pessoa/{pessoaId}
POST /api/checkins
GET  /api/dashboard/overview
```

> Documentação completa da API: ver `resumo.md`

---

## 7. Build para produção

```bash
npm run build
```

Gera a pasta `dist/` com os arquivos estáticos otimizados.

Para testar o build localmente:

```bash
npm run preview
```

---

## 8. Deploy na Vercel

### Via GitHub (recomendado)

1. Faça push do código para o GitHub
2. Acesse https://vercel.com → "New Project"
3. Importe o repositório
4. Configure a variável de ambiente:
   - `VITE_API_URL` = URL do backend em produção
5. Deploy automático!

### Via CLI

```bash
npm i -g vercel
vercel              # primeiro deploy (segue prompts)
vercel --prod       # deploy de produção
```

> Mais detalhes em `DEPLOY.md`

---

## 9. Estrutura de autenticação

O sistema usa JWT com dois perfis:

| Perfil      | `tipo` | Acesso                                          |
|-------------|--------|--------------------------------------------------|
| Coordenador | 0      | Dashboard, gerenciar pessoas, demandas, check-ins |
| Designer    | 1      | Check-in próprio, ver demandas atribuídas         |

### Fluxo de login

```
Usuário com senha → POST /api/auth/login → JWT → localStorage
```

### Fluxo de ativação (Designer novo)

```
1. POST /api/auth/solicitar-codigo  → backend envia código por email
2. POST /api/auth/definir-senha     → valida código, cria senha, retorna JWT
```

---

## 10. Scripts disponíveis

| Comando           | Descrição                              |
|-------------------|----------------------------------------|
| `npm run dev`     | Inicia servidor de desenvolvimento     |
| `npm run build`   | Build de produção (gera `dist/`)       |
| `npm run preview` | Preview local do build de produção     |

---

## Troubleshooting

### "CORS error" no console

- Verifique se o backend está rodando
- Verifique se `VITE_API_URL` aponta para a URL correta do backend
- Confirme que o backend permite origin `http://localhost:5173`

### "Sessão expirada" ao navegar

- O token JWT expirou — faça login novamente
- Verifique o tempo de expiração configurado no backend

### Tela branca / erro de rota

- Limpe o localStorage: `localStorage.clear()` no console do browser
- Recarregue a página

### `npm run dev` não inicia

- Verifique se `node_modules` existe (`npm install`)
- Verifique se a porta 5173 não está ocupada
- Tente `npx vite --port 5174`

---

## Checklist de primeiro setup

- [ ] Node.js >= 18 instalado
- [ ] `npm install` executado sem erros
- [ ] `.env` criado com `VITE_API_URL`
- [ ] Backend rodando e acessível
- [ ] `npm run dev` abre a tela de login
- [ ] Login funciona com credenciais válidas
