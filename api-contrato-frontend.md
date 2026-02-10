# Contrato da API – Base Marketing Backend

Use este documento para adaptar o frontend React a consumir as APIs do backend. Todas as rotas (exceto login, register, solicitar-codigo e definir-senha) exigem o header **Authorization: Bearer &lt;token&gt;** (token retornado no login).

- **Serialização JSON:** o backend retorna e aceita propriedades em **camelCase** (ex.: `token`, `pessoaId`, `notasCoordenacao`).
- **Datas:** formato ISO 8601 (ex.: `2025-02-10T00:00:00Z`).

**Base URL (dev):** `http://localhost:5055` (porta em `Properties/launchSettings.json`; alinhe o frontend, ex.: `VITE_API_URL=http://localhost:5055`).  
**Base URL (prod):** configurável via variável de ambiente ou reverse proxy.

**Respostas de erro (4xx/5xx):** quando aplicável, o corpo é JSON com campo `message` (texto legível), ex.: `{ "message": "Pessoa não encontrada." }`. Validação de entrada (400) pode retornar mensagens por campo ou um único `message`.

---

## Autenticação

### POST /api/auth/login  
**Público.** Body JSON:

```json
{
  "email": "string",
  "senha": "string"
}
```

**Resposta 200:**  
```json
{
  "token": "string (JWT)",
  "tipo": 0,
  "pessoaId": null,
  "email": "string"
}
```
- `tipo`: **0** = Coordenador, **1** = Designer  
- `pessoaId`: preenchido quando for Designer (vincula ao cadastro de Pessoa).

**Resposta 401:** credenciais inválidas.

---

### POST /api/auth/register  
**Público.** Body JSON:

```json
{
  "email": "string",
  "senha": "string",
  "tipo": 0,
  "pessoaId": null
}
```
- `tipo`: 0 = Coordenador, 1 = Designer  
- `pessoaId`: obrigatório quando `tipo === 1` (Designer).

**Resposta 200:** mesmo formato de login (token + tipo + pessoaId + email).  
**Resposta 400:** email já cadastrado.

---

### POST /api/auth/solicitar-codigo  
**Público.** Fluxo de ativação por email (Designer). Body JSON:

```json
{
  "email": "string"
}
```

**Resposta 200:** sempre 200, mesmo que o email não esteja cadastrado (não revela existência do email):

```json
{
  "message": "Se o email estiver cadastrado, o código foi enviado."
}
```

- Rate limit: máximo 5 solicitações por email por hora.  
- Códigos anteriores do mesmo email são invalidados ao solicitar um novo.

---

### POST /api/auth/definir-senha  
**Público.** Ativação de conta com código recebido por email. Body JSON:

```json
{
  "email": "string",
  "codigo": "string",
  "senha": "string"
}
```

**Resposta 200:** mesmo formato de login (token + tipo + pessoaId + email). Conta criada (Designer) ou senha atualizada.

**Resposta 400:** código inválido, expirado ou número de tentativas excedido (máx. 3 tentativas erradas por código).

---

## Pessoas  
**Todos os endpoints de pessoas exigem usuário Coordenador.** Designer recebe 403 Forbid.

### GET /api/pessoas  
Lista pessoas ativas com dados completos (notas, carga da semana, quantidade de demandas ativas).

**Resposta 200:** array de:
```json
{
  "id": 0,
  "nome": "string",
  "email": "string",
  "ativo": true,
  "notasCoordenacao": "string | null",
  "cargaAtual": "string",
  "demandasAtivas": 0
}
```
- `cargaAtual`: `"Baixa"` | `"Media"` | `"Alta"` ou `""` se não fez check-in na semana.  
- `demandasAtivas`: número de demandas não concluídas.

---

### GET /api/pessoas/lista  
Lista enxuta para dropdowns (ex.: escolher responsável em demanda). Apenas Id, Nome, Email.

**Resposta 200:** array de:
```json
{
  "id": 0,
  "nome": "string",
  "email": "string"
}
```

---

### GET /api/pessoas/{id}  
Detalhe de uma pessoa (mesmo formato do item de GET /api/pessoas).

**Resposta 200:** objeto com id, nome, email, ativo, notasCoordenacao, cargaAtual, demandasAtivas.  
**Resposta 404:** pessoa não encontrada.

---

### POST /api/pessoas  
Criar pessoa. Body:

```json
{
  "nome": "string",
  "email": "string",
  "notasCoordenacao": "string | null"
}
```

**Resposta 201:** objeto completo da pessoa (como em GET /api/pessoas/{id}), header Location.  
**Resposta 404/403:** conforme regras.

---

### PUT /api/pessoas/{id}  
Atualizar pessoa. Body:

```json
{
  "nome": "string",
  "email": "string",
  "notasCoordenacao": "string | null",
  "ativo": true
}
```

**Resposta 204:** sem corpo.

---

### PUT /api/pessoas/{id}/notas  
Atualizar apenas as notas privadas. Body:

```json
{
  "notas": "string | null"
}
```

**Resposta 204:** sem corpo.

---

### DELETE /api/pessoas/{id}  
Desativar pessoa (soft delete). **Resposta 204:** sem corpo.

---

### POST /api/pessoas/{id}/convidar  
**Apenas coordenador.** Envia convite para a pessoa virar Designer: cria o usuário (sem senha ativa), gera código de acesso e envia por email. O designer usa o fluxo "Primeiro acesso?" (solicitar-codigo com o mesmo email já não é necessário; o código já foi enviado) ou solicita novo código e define a senha em definir-senha.

**Resposta 200:**  
```json
{ "message": "Convite enviado para email@exemplo.com." }
```

**Resposta 400:** ex.: `{ "message": "Esta pessoa já possui acesso." }` ou `"Pessoa sem email cadastrado."`  
**Resposta 404:** pessoa não encontrada ou inativa.

---

### POST /api/pessoas/{id}/definir-senha *(opcional – ambiente sem email)*  
**Apenas coordenador.** Define ou redefine a senha do usuário Designer vinculado a esta pessoa, sem envio de email. Útil quando não há serviço de email configurado.

Body JSON:
```json
{
  "senha": "string"
}
```

**Resposta 204:** sem corpo (senha atualizada).  
**Resposta 400:** senha inválida (ex.: muito curta).  
**Resposta 404:** pessoa não encontrada, inativa ou sem usuário vinculado.

*Se este endpoint não existir no backend, o frontend pode usar como alternativa o POST /api/auth/register (email da pessoa + senha + tipo 1 + pessoaId) apenas para **criar** o primeiro acesso; para **redefinir** senha de quem já tem usuário, é necessário implementar este endpoint.*

---

## Empreendimentos  

- **Coordenador:** vê todos; pode criar/editar/desativar.  
- **Designer:** vê apenas ativos (lista para dropdown).

### GET /api/empreendimentos  
Query opcional: `?apenasAtivos=true` (default para designer).

**Resposta 200:** array de:
```json
{
  "id": 0,
  "nome": "string",
  "ativo": true
}
```

---

### GET /api/empreendimentos/lista  
Lista enxuta para dropdown (id, nome). Apenas ativos.

**Resposta 200:** array de `{ "id": 0, "nome": "string" }`.

---

### GET /api/empreendimentos/{id}  
**Resposta 200:** objeto completo. **404:** não encontrado.

---

### POST /api/empreendimentos  
Criar. **Só Coordenador.** Body: `{ "nome": "string", "ativo": true }`. **Resposta 201:** objeto, Location.

---

### PUT /api/empreendimentos/{id}  
Atualizar. **Só Coordenador.** Body: `{ "nome": "string", "ativo": true }`. **Resposta 204.**

---

### DELETE /api/empreendimentos/{id}  
Desativar (soft). **Só Coordenador.** **Resposta 204.**

---

## Demandas  

- **Coordenador:** vê todas as demandas.  
- **Designer:** vê apenas demandas em que ele é o responsável (`responsavelId === pessoaId` do usuário).

### GET /api/demandas  
Query: `?ativas=true` (só não concluídas), `?de=` e `?ate=` (intervalo de prazo, ISO 8601), `?empreendimentoId=`, `?tipo=` (TipoDemanda).

**Resposta 200:** array de:
```json
{
  "id": 0,
  "titulo": "string",
  "descricao": "string | null",
  "tipo": 0,
  "responsavelId": 0,
  "responsavelNome": "string | null",
  "prazo": "2025-02-10T00:00:00Z",
  "impacto": 0,
  "status": 0,
  "prioridade": 0,
  "ordem": 0 | null,
  "link": "string | null",
  "empreendimentoId": 0 | null,
  "empreendimentoNome": "string | null",
  "concluida": false,
  "criadaEm": "2025-02-10T00:00:00Z",
  "atualizadaEm": "2025-02-10T00:00:00Z | null"
}
```

**Enums (valores numéricos):**  
- `tipo` (TipoDemanda): **0** Post, **1** Campanha, **2** Landing, **3** Institucional, **4** Outro  
- `impacto` (ImpactoNegocio): **0** Venda, **1** Lead, **2** Institucional  
- `status` (StatusDemanda): **0** OK, **1** Atencao, **2** Risco  
- `prioridade` (PrioridadeDemanda): **0** Alta, **1** Media, **2** Baixa  

---

### GET /api/demandas/ativas  
Apenas demandas não concluídas. Mesmo formato de GET /api/demandas.

---

### GET /api/demandas/proximos-prazos  
Demandas ativas com prazo nos próximos N dias. Query: `?dias=7` (default). Coordenador vê todas; Designer só as suas.

**Resposta 200:** array no mesmo formato de GET /api/demandas.

---

### GET /api/demandas/risco  
Apenas demandas em risco. **Só Coordenador.** Mesmo formato.

---

### GET /api/demandas/{id}  
Detalhe de uma demanda. Mesmo objeto da lista.

**Resposta 404:** não encontrada. **403:** designer tentando acessar demanda de outro.

---

### POST /api/demandas  
Criar demanda. **Só Coordenador.** Body:

```json
{
  "titulo": "string",
  "descricao": "string | null",
  "tipo": 0,
  "responsavelId": 0,
  "prazo": "2025-02-15T23:59:59Z",
  "impacto": 0,
  "prioridade": 1,
  "ordem": null,
  "link": "string | null",
  "empreendimentoId": null
}
```
- `prioridade`: 0 Alta, 1 Media, 2 Baixa (default 1).  
- `ordem`, `link`, `empreendimentoId` opcionais.

**Resposta 201:** objeto Demanda completo, header Location.

---

### PUT /api/demandas/{id}  
Atualizar demanda. Body (coordenador ou designer responsável):

```json
{
  "titulo": "string",
  "descricao": "string | null",
  "tipo": 0,
  "responsavelId": 0,
  "prazo": "2025-02-15T23:59:59Z",
  "impacto": 0,
  "status": 0,
  "prioridade": 0,
  "ordem": null,
  "link": "string | null",
  "empreendimentoId": null
}
```

**Resposta 204:** sem corpo.

---

### PUT /api/demandas/{id}/status  
Atualizar apenas o status. **Coordenador** ou **Designer responsável pela demanda.** Body:

```json
{
  "status": 0
}
```
(status: 0 OK, 1 Atencao, 2 Risco)

**Resposta 204:** sem corpo.

---

### GET /api/demandas/{id}/atualizacoes  
Lista comentários/atualizações da demanda (ordenados do mais recente). Coordenador ou designer responsável.

**Resposta 200:** array de:
```json
{
  "id": 0,
  "demandaId": 0,
  "pessoaId": 0 | null,
  "pessoaNome": "string | null",
  "texto": "string",
  "criadoEm": "2025-02-10T00:00:00Z"
}
```
- `pessoaId`/`pessoaNome` null quando o autor é coordenador.

---

### POST /api/demandas/{id}/atualizacoes  
Adicionar comentário/atualização na demanda. Coordenador ou designer responsável. Body:

```json
{
  "texto": "string"
}
```

**Resposta 201:** objeto AtualizacaoDemanda, Location.

---

### PUT /api/demandas/{id}/concluir  
Marcar demanda como concluída. Body vazio ou `{}`. **Resposta 204:** sem corpo.

---

## Check-ins  

- **Coordenador:** vê todos os check-ins; ao criar, deve enviar `pessoaId`.  
- **Designer:** vê só os próprios; ao criar, não envia `pessoaId` (ou envia o próprio).  
- Regra: **um check-in por pessoa por semana** (segunda a domingo). Se já existir, o POST atualiza o existente.

### GET /api/checkins  
Query opcional: `?semanaAtual=true` para filtrar só check-ins da semana atual.

**Resposta 200:** array de:
```json
{
  "id": 0,
  "pessoaId": 0,
  "pessoaNome": "string | null",
  "data": "2025-02-10T00:00:00Z",
  "carga": 0,
  "bloqueio": "string | null"
}
```
- `carga` (CargaSemanal): **0** Baixa, **1** Media, **2** Alta.

---

### GET /api/checkins/semana-atual  
Equivalente a GET /api/checkins?semanaAtual=true. Mesmo formato.

---

### GET /api/checkins/pessoa/{pessoaId}  
Histórico de check-ins de uma pessoa. Coordenador pode ver qualquer um; Designer só o próprio `pessoaId`.

**Resposta 200:** array no mesmo formato de GET /api/checkins.

---

### POST /api/checkins  
Criar ou atualizar check-in da semana.

**Coordenador:** body deve incluir `pessoaId`.  
**Designer:** body sem `pessoaId` (ou com o próprio id).

Body:
```json
{
  "pessoaId": null,
  "carga": 0,
  "bloqueio": "string | null"
}
```
- `carga`: 0 Baixa, 1 Media, 2 Alta.

**Resposta 200:** se atualizou check-in existente (mesmo objeto).  
**Resposta 201:** se criou novo (objeto CheckIn, header Location).  
**Resposta 400:** coordenador não enviou pessoaId.

---

## Dashboard  
**Só Coordenador.** Designer recebe 403.

### GET /api/dashboard/overview  

**Resposta 200:**
```json
{
  "totalPessoasAtivas": 0,
  "totalDemandasAtivas": 0,
  "pessoasComCargaAlta": 0,
  "demandasEmRisco": 0,
  "checkInsPendentes": 0
}
```
- `checkInsPendentes`: pessoas ativas que ainda não fizeram check-in na semana atual.

---

## Relatórios  
**Só Coordenador.**

### GET /api/relatorios/demandas-concluidas  
Demandas concluídas no período. Query: `?de=` e `?ate=` (datas ISO 8601; default último mês), `?responsavelId=`, `?empreendimentoId=`.

**Resposta 200:**
```json
{
  "total": 0,
  "itens": [
    {
      "id": 0,
      "titulo": "string",
      "tipo": 0,
      "responsavelId": 0,
      "responsavelNome": "string | null",
      "prazo": "2025-02-10T00:00:00Z",
      "atualizadaEm": "2025-02-10T00:00:00Z | null",
      "empreendimentoNome": "string | null"
    }
  ]
}
```

---

## Resumo de enums (valores numéricos)

| Enum               | Valores (número → texto) |
|--------------------|---------------------------|
| TipoUsuario        | 0 Coordenador, 1 Designer |
| CargaSemanal       | 0 Baixa, 1 Media, 2 Alta  |
| TipoDemanda        | 0 Post, 1 Campanha, 2 Landing, 3 Institucional, 4 Outro |
| ImpactoNegocio     | 0 Venda, 1 Lead, 2 Institucional |
| StatusDemanda      | 0 OK, 1 Atencao, 2 Risco  |
| PrioridadeDemanda  | 0 Alta, 1 Media, 2 Baixa   |

---

## CORS

Backend permite origem:
- `http://localhost:5173` (Vite dev)
- `https://base-marketing.vercel.app`

Header **Authorization: Bearer &lt;token&gt;** em todas as requisições autenticadas. Em ambiente com cookies/credenciais, usar `credentials: 'include'` se a política CORS permitir.

---

## Respostas de erro comuns

- **401 Unauthorized:** token ausente, inválido ou expirado → redirecionar para login.  
- **403 Forbid:** usuário sem permissão (ex.: designer em rota só de coordenador).  
- **404 Not Found:** recurso não encontrado.  
- **400 Bad Request:** body inválido ou regra de negócio (ex.: coordenador sem pessoaId no POST check-in).
