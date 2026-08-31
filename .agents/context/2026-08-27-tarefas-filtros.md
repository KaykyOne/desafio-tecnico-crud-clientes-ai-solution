# Filtros no quadro de tarefas

## Resumo

O Kanban ganhou uma barra de filtros acima do quadro, com três filtros: **cliente**, **prioridade** e **semana de entrega**. Cliente e prioridade são de múltipla escolha com busca (padrão _faceted filter_ do shadcn: Popover + Command); a semana é um navegador com setas. O componente foi desenhado pra receber filtros novos sem reestruturação.

## Arquivos alterados

- `app/dashboard/tasks/_components/task-filters.tsx` (novo) — a barra, o `FacetedFilter` genérico, o `WeekFilter` e as funções puras `filterTasks` / `countActiveFilters` / helpers de semana.
- `app/dashboard/tasks/page.tsx` — estado dos filtros, `visibleTasks` e a barra renderizada entre os totais e o quadro.

Sem SQL. Filtro é 100% client-side sobre a lista que o `useTasks` já carrega inteira.

## Como adicionar um filtro novo

O ponto da estrutura. São quatro passos localizados:

1. Acrescente o campo em `TaskFilterValue`.
2. Acrescente o valor vazio em `EMPTY_TASK_FILTERS`.
3. Acrescente a regra em `filterTasks` (um `if` que retorna `false`; filtro vazio não restringe nada).
4. Acrescente o controle no JSX de `TaskFilters`.

Se o filtro novo for do tipo "escolher de uma lista", o passo 4 é só reusar `<FacetedFilter>` passando `options`/`selected`/`onChange` — não precisa escrever UI nenhuma. Foi por isso que ele nasceu genérico em vez de um componente por filtro.

## Decisões

- **`FacetedFilter` é genérico e multi-seleção**, seguindo a receita de faceted filter do shadcn (Popover + Command com busca, contador no gatilho e "Limpar" no rodapé da lista). Multi-seleção porque filtrar por dois clientes ao mesmo tempo é pedido natural e não custa nada a mais; e a busca importa porque a lista de clientes cresce sem limite.
- **Os filtros se combinam com E**, e um filtro vazio não restringe nada — assim a barra é previsível e cada filtro é independente dos outros.
- **"Sem cliente" é uma opção da lista**, não um caso à parte. Internamente vira a constante `SEM_CLIENTE` no lugar do `cliente_id` nulo, o que mantém `filterTasks` com um único caminho.
- **A semana é um navegador (← 25/08 – 31/08 →), não uma lista de presets.** Isso combina com o `period-filter.tsx` do financeiro, que é o vocabulário que o app já usa pra tempo, e permite chegar em qualquer semana em vez de só nas três mais próximas. Quando a semana filtrada é a atual, o rótulo mostra "Esta semana" em vez do intervalo.
- **Semana começa no domingo**, a mesma escolha já feita nos totais do cronômetro — as duas telas precisam concordar sobre o que é "esta semana", senão o app se contradiz.
- **A semana filtra por `due_date`** (a data de entrega), que é a única data que a tarefa tem com significado de prazo.
- **`taskCountByColumnId` continua sobre TODAS as tarefas, não sobre as filtradas.** Ele é quem informa ao diálogo "Gerenciar colunas" se uma coluna pode ser excluída — e o banco recusa excluir coluna com tarefa (FK sem cascade). Se ele respeitasse o filtro, a tela diria "0 tarefas" e o usuário levaria um erro incompreensível ao tentar excluir. Só o quadro é filtrado.
- **Filtro no cliente, sem ida ao banco.** O `useTasks` já carrega todas as tarefas do usuário de uma vez; refazer a query a cada clique de filtro seria round trip por nada.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos.

A matemática de semana foi verificada isoladamente rodando os helpers no Node, sobre 400 dias corridos: todo `weekStart` cai num domingo, todo `weekEnd` num sábado, toda data está dentro da própria semana, o ida-e-volta do `shiftWeek` é identidade, e as viradas de mês, de ano e de ano bissexto batem. Todos os casos passaram.

**A interface não foi verificada no navegador** — a sessão do preview estava deslogada e o quadro fica atrás de autenticação.

## Pendências

- Verificar visualmente: abrir cada popover, marcar/desmarcar opções, conferir o contador no gatilho, navegar semanas e usar o "Limpar".
- A combinação de filtro ativo + arrastar card não foi testada. Deve funcionar (o `handleDragEnd` trabalha com ids, não com a lista filtrada), mas vale confirmar.
