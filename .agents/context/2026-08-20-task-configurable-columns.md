# Colunas configuráveis do Kanban

## Resumo

O board de tarefas passou a usar `task_columns` e `tasks.column_id` como fonte única de verdade para as etapas do Kanban.

## Alterações

- Criado `useTaskColumns` para listar, criar, renomear, excluir e reordenar colunas do usuário autenticado.
- O hook e a UI de tarefas não dependem mais do status fixo; toda movimentação atualiza `column_id` de forma otimista.
- Adicionado diálogo Gerenciar colunas, com criação, edição de nome, drag-and-drop de ordenação e bloqueio de exclusão para colunas com tarefas.
- Cada cabeçalho de coluna também possui uma alça arrastável para reordenar o board diretamente, sem abrir o diálogo.
- O formulário de tarefa usa a primeira coluna por posição como padrão e permite escolher outra coluna.

## Pré-requisito aplicado

Esta implementação pressupõe que a migration de `task_columns` e a migração de `tasks.status` para `tasks.column_id` já foram executadas no Supabase.
