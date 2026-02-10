# Melhorias — Frontend (Base Marketing)

Documento de melhorias de funcionalidade e UX para o frontend React (Vite).  
O backend já expõe as APIs necessárias; este foco é em telas, fluxos e integração no cliente.

---

## 1. Alterar status da demanda (OK / Atenção / Risco)

**Situação:** No Dashboard só existe o botão "Concluir" por demanda. Não há como marcar uma demanda como **OK**, **Atenção** ou **Risco**.

**Backend já disponível:** `PUT /api/demandas/{id}/status` e `demandasApi.atualizarStatus(id, status)`.

**Melhoria:**
- No card de cada demanda (ou em um dropdown/modal rápido), adicionar seletor de status: **OK** | **Atenção** | **Risco**.
- Ao selecionar, chamar `demandasApi.atualizarStatus(demanda.id, status)` e atualizar a lista/estado local.
- Manter o botão "Concluir" para marcar como concluída.

---

## 2. Editar demanda

**Situação:** Só é possível criar demanda. Não há tela ou modal para editar título, prazo, responsável, tipo ou impacto.

**Backend já disponível:** `PUT /api/demandas/{id}` e `demandasApi.atualizar(id, data)`.

**Melhoria:**
- Botão "Editar" em cada card de demanda (ou clique no card).
- Abrir modal com o mesmo formulário do "Nova demanda", preenchido com os dados atuais (título, tipo, responsável, prazo, impacto).
- Ao salvar, enviar `demandasApi.atualizar(id, { titulo, tipo, responsavelId, prazo, impacto, status })` e atualizar a lista.

---

## 3. Editar pessoa (nome, email)

**Situação:** No modal do perfil da pessoa só as **notas** são editáveis. Nome e email não podem ser alterados.

**Backend já disponível:** `PUT /api/pessoas/{id}` e `pessoasApi.atualizar(id, data)`.

**Melhoria:**
- No modal da pessoa, permitir editar **nome** e **email** (campos de texto), além das notas.
- Incluir no payload: `{ nome, email, notasCoordenacao, ativo }` (ativo quando houver desativação).
- Botão "Salvar" que chama `pessoasApi.atualizar(selectedPessoa.id, payload)` e atualiza estado local e lista.

---

## 4. Desativar pessoa

**Situação:** Não existe ação de desativar pessoa na interface. A API existe e faz soft delete.

**Backend já disponível:** `DELETE /api/pessoas/{id}` e `pessoasApi.desativar(id)`.

**Melhoria:**
- No modal da pessoa (ou no card), adicionar botão "Desativar".
- Exibir confirmação: *"Tem certeza? A pessoa deixará de aparecer nas listas e não poderá fazer login como designer."*
- Ao confirmar, chamar `pessoasApi.desativar(id)`, fechar o modal e atualizar a lista de pessoas e o overview do Dashboard (recarregar dados).

---

## 5. Demandas em risco em destaque

**Situação:** O bloco de alertas do Dashboard calcula "demandas em risco" filtrando a lista local. O endpoint dedicado não é usado.

**Backend já disponível:** `GET /api/demandas/risco` e `demandasApi.listarEmRisco()`.

**Melhoria:**
- Usar `demandasApi.listarEmRisco()` para o bloco "Demandas em risco" ou para um link "Ver X em risco".
- Exibir lista ou link que leve a uma visualização focada (mesma lista do Dashboard filtrada ou seção dedicada), garantindo consistência com o backend.

---

## 6. Fluxo de convite do Designer (vincular Pessoa → usuário)

**Situação:** O coordenador cadastra Pessoa (nome, email), mas não há passo claro para o designer passar a ter acesso (login com código).

**Melhoria (frontend):**
- No modal da pessoa (ou no card), adicionar ação **"Enviar convite"** / **"Convidar para acesso"** quando a pessoa ainda não tiver usuário vinculado.
- Se o backend ganhar um endpoint de convite (ex.: `POST /api/pessoas/{id}/convidar`), o botão chama esse endpoint.
- Enquanto não existir endpoint, deixar explícito no UI: *"O designer deve usar 'Primeiro acesso?' na tela de login com o email cadastrado"*, ou exibir o link da tela de login + texto orientando o primeiro acesso.

---

## 7. Página ou rota dedicada a Demandas

**Situação:** Demandas aparecem só no Dashboard (coordenador) e em lista resumida no Check-in (designer).

**Melhoria:**
- Criar rota **`/demandas`** (e link no navbar).
- **Coordenador:** listar demandas com filtros (ativas / concluídas / em risco), tipo, responsável; ações criar, editar, alterar status e concluir (reutilizando lógica do Dashboard).
- **Designer:** listar "Minhas demandas" (ativas e, se fizer sentido, concluídas), com possibilidade de ver detalhe e, no futuro, concluir a partir daqui.
- Proteger a rota com `ProtectedRoute` e exibir apenas conforme o papel (coordenador vê todas, designer vê só as suas).

---

## 8. Check-in já feito nesta semana (Designer)

**Situação:** O designer não vê se já fez check-in na semana; pode achar que não fez ou enviar de novo sem contexto.

**Backend já disponível:** `GET /api/checkins/semana-atual` e, por pessoa, `GET /api/checkins/pessoa/{pessoaId}`. O usuário designer tem `user.pessoaId`.

**Melhoria:**
- Na tela de Check-in, ao carregar (para designer), buscar check-in da semana: ex.: `checkinsApi.semanaAtual()` e filtrar pelo `user.pessoaId`, ou usar um endpoint que retorne o check-in da pessoa na semana atual.
- Se já existir registro: exibir mensagem *"Você já fez check-in esta semana (carga X, bloqueio: …). Enviar novamente atualiza esse registro."* e opcionalmente pré-preencher o formulário com os valores atuais.
- Manter o botão "Enviar" para permitir atualizar o check-in.

---

## 9. Histórico de check-ins no perfil da pessoa

**Situação:** No modal da pessoa há "Histórico de demandas", mas não há histórico de check-ins (datas e carga).

**Backend já disponível:** `GET /api/checkins/pessoa/{pessoaId}` e `checkinsApi.porPessoa(pessoaId)`.

**Melhoria:**
- No modal da pessoa (Dashboard), adicionar seção **"Histórico de check-ins"**.
- Chamar `checkinsApi.porPessoa(selectedPessoa.id)` e exibir lista (data, carga, bloqueio se houver), ordenada por data decrescente.
- Opcional: paginar ou limitar a últimas N semanas se a lista for grande.

---

## 10. Confirmações antes de ações importantes

**Situação:** Concluir demanda e desativar pessoa são irreversíveis (ou de alto impacto) e hoje podem ser acionadas com um clique.

**Melhoria:**
- **Concluir demanda:** antes de chamar `demandasApi.concluir(id)`, exibir confirmação (modal ou `confirm`): *"Marcar esta demanda como concluída?"*.
- **Desativar pessoa:** conforme item 4, sempre usar confirmação explícita antes de `pessoasApi.desativar(id)`.

---

## 11. Consistência de configuração e documentação

**Situação:** A documentação (ex.: `resumo.md`) cita `http://localhost:5000`; o frontend usa `VITE_API_URL || 'http://localhost:5055'` em `api.js`.

**Melhoria:**
- Alinhar a documentação à porta realmente usada em desenvolvimento (ex.: 5055, conforme `launchSettings.json` do backend).
- No README ou INIT do frontend, deixar explícito: variável `VITE_API_URL` para a base da API em dev e produção.

---

## 12. Tratamento de erros da API

**Situação:** Vários `catch` usam `alert()` ou mensagem genérica. O backend pode retornar 400 com corpo (ex.: `{ message: "..." }`).

**Melhoria:**
- Em formulários (login, definir senha, criar/editar demanda, criar/editar pessoa), ao receber 400/422, ler o corpo da resposta (JSON) e exibir a mensagem (ex.: `message`) em um banner ou texto de erro abaixo do botão, em vez de apenas "Erro ao criar demanda" ou "Erro ao definir senha".
- Manter fallback para mensagem genérica quando o corpo não tiver texto útil.
- Reaproveitar o padrão já usado no Login (ex.: "Email já cadastrado", "Código inválido...") nos demais fluxos.

---

## Resumo prioritário

| Prioridade | Melhoria |
|-----------|----------|
| Alta | Alterar status da demanda (OK / Atenção / Risco) no Dashboard |
| Alta | Editar demanda (modal com título, prazo, responsável, tipo, impacto) |
| Alta | Desativar pessoa com confirmação |
| Média | Editar pessoa (nome, email) no modal do perfil |
| Média | Fluxo de convite do Designer (botão + texto ou integração com futuro endpoint) |
| Média | Indicar "check-in já feito esta semana" para o designer |
| Média | Histórico de check-ins no modal da pessoa |
| Baixa | Bloco "Demandas em risco" usando `listarEmRisco()` |
| Baixa | Página/rota dedicada `/demandas` |
| Baixa | Confirmação ao concluir demanda |
| Baixa | Consistência documentação (porta, VITE_API_URL) |
| Baixa | Exibir mensagens de erro da API nos formulários |

---

*Documento gerado para o repositório Base Marketing — frontend.*
