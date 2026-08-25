# Kanban de tarefas

## Resumo

Implementado o board Kanban em `/dashboard/tasks` para tarefas do usuário autenticado.

## Alterações

- Criado `useTasks`, espelhando o CRUD client-side de clientes e sempre filtrando por `user_id`.
- Adicionadas criação, edição, exclusão e três colunas: pendente, em andamento e concluída.
- Incluído drag-and-drop acessível com `@dnd-kit/core`; a troca de coluna atualiza o status de forma otimista e restaura o estado anterior se o Supabase retornar erro.
- Incluído o item Tarefas na navegação e atualizada a documentação do projeto.

## Decisões

- Não há ordenação dentro de uma mesma coluna, apenas mudança de status, conforme o escopo.
- A prioridade usa badges visuais baixa, média e alta; os demais elementos permanecem alinhados à interface monocromática do projeto.

## Pré-requisito

A tabela `public.tasks` e as policies RLS por `user_id = auth.uid()` precisam estar aplicadas no Supabase para o board consumir os dados.
