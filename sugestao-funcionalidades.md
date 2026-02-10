# Sugestões de novas funcionalidades — Base Marketing

Objetivo do projeto: **facilitar a vida da coordenação e da equipe de Marketing e Design da Genesis Empreendimentos.**

As melhorias já descritas em `frontend.md` e `backend.md` tratam do que já existe na base. Este documento sugere **funcionalidades novas** alinhadas a esse objetivo.

---

## 1. Vinculação de demandas a empreendimentos / lançamentos

**Por quê:** Na Genesis, as demandas de marketing e design costumam estar ligadas a um empreendimento ou lançamento (ex.: “Campanha Residencial Horizonte”, “Landing do Ed. Solar”). Hoje só há título, tipo e responsável.

**O quê:**
- Cadastro de **Empreendimentos** (nome, opcional: status ativo/inativo).
- Na **Demanda**, campo opcional **empreendimentoId** (ou “projeto”).
- Coordenação consegue filtrar demandas por empreendimento e ver carga por lançamento.

**Benefício:** Visão por obra/lançamento, planejamento de campanhas e relatórios por empreendimento.

**Onde:** Backend (nova entidade, migration, endpoints CRUD empreendimentos + campo em Demanda). Frontend (select no formulário de demanda, filtro na lista, opcionalmente bloco no Dashboard “por empreendimento”).

---

## 2. Descrição / briefing na demanda

**Por quê:** Só o título às vezes não basta; o designer precisa de contexto, referências ou instruções (ex.: “Seguir manual da marca”, “Incluir planta do 3º pavimento”).

**O quê:**
- Campo **descricao** ou **briefing** (texto) na demanda, opcional.
- Exibição no detalhe da demanda (e na lista, se for curto, ou “Ver briefing”).

**Benefício:** Menos idas e vindas por falta de contexto; briefing centralizado na demanda.

**Onde:** Backend (campo na entidade e DTOs). Frontend (textarea no criar/editar demanda, exibição no modal/detalhe).

---

## 3. Visão em calendário / linha do tempo dos prazos

**Por quê:** Coordenação e equipe se planejam por datas: “o que vence esta semana?”, “quando é a entrega do Horizonte?”.

**O quê:**
- Tela ou aba **Calendário** (ou “Linha do tempo”): demandas ativas posicionadas pela data de **prazo**.
- Filtros: por responsável, por empreendimento (se existir), por tipo.
- Coordenador vê tudo; designer vê só as suas.

**Benefício:** Planejamento visual por prazo, menos surpresas com prazos apertados.

**Onde:** Backend (já há prazo nas demandas; eventualmente endpoint otimizado por intervalo de datas). Frontend (nova rota/página, componente de calendário ou lista agrupada por semana/mês).

---

## 4. Atualização de status / comentário pelo designer na demanda

**Por quê:** Hoje só a coordenação altera status (OK/Atenção/Risco). O designer sabe quando “travou” (ex.: aguardando aprovação, revisão do cliente) ou quando enviou para revisão.

**O quê:**
- Designer pode **atualizar o status** da demanda em que é responsável (OK / Atenção / Risco), ou
- Campo **comentário/atualização** na demanda (ex.: “Enviado para aprovação em 10/02”) com data e autor.
- Coordenação vê histórico ou último comentário no card/detalhe.

**Benefício:** Coordenação acompanha sem precisar perguntar “em que pé está?”; designer comunica em um lugar só.

**Onde:** Backend (permitir designer em PUT status; ou nova entidade “AtualizacaoDemanda” com texto + demandaId + usuarioId + data). Frontend (botão/select de status para o designer na “minha demanda”, e/ou campo de comentário + lista de atualizações).

---

## 5. Alertas e lembretes (prazos próximos e em risco)

**Por quê:** Evitar que prazos importantes passem em branco; coordenação e designer se antecipam.

**O quê:**
- **No app:** bloco “Próximos prazos” no Dashboard (ex.: demandas que vencem em 3 ou 7 dias) e destaque para demandas em risco.
- **Por e-mail (opcional):** resumo semanal para coordenação (demandas em risco, check-ins pendentes) e/ou lembrete para designer com suas demandas que vencem na semana.

**Benefício:** Menos atrasos por esquecimento; coordenação prioriza sem ter que caçar no sistema.

**Onde:** Backend (endpoint “próximos prazos” por intervalo; opcional job + e-mail). Frontend (widget no Dashboard, possível página “Alertas”; e-mails via backend).

---

## 6. Relatório simples (demandas concluídas por período / pessoa)

**Por quê:** Gestão e coordenação precisam de visão de resultado: “quantas demandas fechamos no mês?”, “como está a entrega por pessoa?”.

**O quê:**
- Relatório **demandas concluídas** com filtro por período (mês, trimestre) e opcionalmente por responsável ou empreendimento.
- Exibição em tabela ou cards (quantidade, lista resumida). Exportar CSV/Excel é um plus.

**Benefício:** Base para reuniões, avaliação de produtividade e planejamento.

**Onde:** Backend (endpoint ex.: GET /api/relatorios/demandas-concluidas?de=...&ate=...&pessoaId=...). Frontend (página “Relatórios” ou aba no Dashboard, tabela e filtros).

---

## 7. Sugestão de responsável ao criar demanda (quem pode assumir)

**Por quê:** Coordenação precisa distribuir demanda de forma equilibrada; hoje a escolha do responsável é manual sem apoio visual.

**O quê:**
- Ao criar/editar demanda, além da lista de pessoas, mostrar **carga atual** e **quantidade de demandas ativas** de cada uma (já existem no GET /api/pessoas).
- Opcional: ordenar ou destacar “quem tem mais capacidade” (ex.: carga baixa e menos demandas).

**Benefício:** Distribuição mais justa e consciente; menos sobrecarga em uma pessoa só.

**Onde:** Principalmente frontend (no select de responsável, exibir carga e nº de demandas; ordenar ou marcar sugestão). Backend já expõe esses dados.

---

## 8. Check-in: lembrete semanal (e-mail)

**Por quê:** Garantir que ninguém esqueça o check-in semanal; coordenação tem visão atualizada de carga e bloqueios.

**O quê:**
- No meio da semana (ex.: quarta), enviar **e-mail** para quem ainda não fez check-in na semana: “Lembrete: faça seu check-in semanal”.
- Lista de “check-ins pendentes” já existe no Dashboard; o backend só precisa identificar quem não fez e disparar o e-mail.

**Benefício:** Mais adesão ao check-in; overview do time mais confiável.

**Onde:** Backend (job agendado ou endpoint chamado por cron; usar IEmailService e lista de pessoas sem check-in na semana). Frontend não obrigatório (opcional: “Não me lembrar” nas preferências).

---

## 9. Prioridade ou ordem das demandas (para o designer)

**Por quê:** O designer pode ter várias demandas ao mesmo tempo; coordenação quer indicar “faça esta primeiro”.

**O quê:**
- Campo **prioridade** (ex.: Alta / Média / Baixa) ou **ordem** (número) na demanda.
- Na lista “Minhas demandas” do designer, ordenar por prioridade/ordem e prazo.
- Coordenador define prioridade ao criar/editar.

**Benefício:** Alinhamento sobre o que atacar primeiro; menos dúvida para o designer.

**Onde:** Backend (campo na Demanda, migration, DTOs, ordenação na listagem). Frontend (select no formulário, ordenação e badge na lista).

---

## 10. Anexos ou links na demanda (brief, pasta, referência)

**Por quê:** Briefs, artes de referência e pastas costumam estar em drive ou e-mail; concentrar o link (ou anexo) na demanda evita perda de contexto.

**O quê:**
- Campo **link** (URL) na demanda, ou
- Upload de **anexos** (arquivos) vinculados à demanda (backend armazena ou integra com storage).

**Benefício:** Tudo relacionado à demanda em um só lugar; designer acessa direto pelo sistema.

**Onde:** Backend (campo link simples; ou entidade Anexo + storage). Frontend (input URL no formulário; ou upload + lista de anexos no detalhe).

---

## Resumo por impacto (coordenação × equipe)

| Funcionalidade                         | Coordenação | Equipe (design/marketing) |
|---------------------------------------|-------------|----------------------------|
| Empreendimentos / lançamentos         | Alto        | Médio                      |
| Descrição / briefing na demanda       | Médio       | Alto                       |
| Calendário / linha do tempo           | Alto        | Alto                       |
| Status ou comentário pelo designer    | Alto        | Alto                       |
| Alertas e lembretes                   | Alto        | Alto                       |
| Relatório demandas concluídas         | Alto        | Baixo                      |
| Sugestão de responsável               | Alto        | —                          |
| Lembrete de check-in por e-mail       | Alto        | Médio                      |
| Prioridade/ordem na demanda            | Médio       | Alto                       |
| Anexos/links na demanda               | Médio       | Alto                       |

---

## Ordem sugerida para implementação

1. **Descrição/briefing** e **prioridade** na demanda — pouco esforço, alto retorno no dia a dia.
2. **Próximos prazos / alertas** no Dashboard e, se possível, **lembrete de check-in por e-mail** — melhora imediata de acompanhamento.
3. **Visão em calendário** — melhora forte de planejamento.
4. **Empreendimentos** e vínculo com demandas — alinhado ao negócio da Genesis.
5. **Status/comentário pelo designer** e **relatório de concluídas** — fecham o ciclo de comunicação e gestão.
6. **Sugestão de responsável**, **anexos/links** e demais itens conforme prioridade da equipe.

---

*Documento alinhado ao objetivo: facilitar a vida da coordenação e da equipe de Marketing e Design da Genesis Empreendimentos.*
