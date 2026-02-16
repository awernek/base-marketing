Refatorar o módulo de demandas focando em UX e redução de fricção.

Problemas atuais:
- Muitos cliques para visualizar uma demanda
- Falta de identificação clara (ID)
- Cards com pouca informação
- Fluxo pouco intuitivo para colaboradores

Objetivos:

1. Adicionar identificador único da demanda
- Criar campo incremental (ID)
- Exibir no card e na visualização detalhada
- Formato: #000123

2. Melhorar o card da demanda (Kanban)
O card deve exibir:
- ID da demanda
- Título
- Responsável (iniciais/avatar)
- Prioridade
- Data de entrega
- Resumo do briefing (máx 2 linhas)

3. Implementar “Quick View”
- Ao clicar no card, abrir um drawer lateral (não modal)
- Exibir:
  - briefing completo
  - anexos
  - comentários
  - botão de editar

4. Reduzir cliques
- Evitar navegação em múltiplas telas
- Priorizar visualização inline ou em drawer

5. Implementar fluxo de “pull de tarefas”
- Criar coluna "Backlog" ou "A fazer (sem responsável)"
- Adicionar botão "Assumir tarefa"
- Ao assumir, tarefa passa para o usuário atual

6. Permitir criação rápida de demanda
- Criar modo simplificado:
  - título
  - descrição
- Campos avançados opcionais

7. Melhorar experiência geral
- Tornar interface mais fluida e direta
- Reduzir necessidade de abrir múltiplos modais
- Foco em produtividade operacional

Critério de sucesso:
- Usuário consegue entender uma demanda sem clicar
- Usuário consegue acessar detalhes com 1 clique
- Usuário consegue assumir tarefas rapidamente
