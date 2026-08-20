# Task: Kanban de tarefas

## Objetivo

Implementar um board Kanban em `/dashboard/tasks` para gerenciar as tarefas cadastradas (tabela `public.tasks`), com colunas por status e drag-and-drop entre colunas.

## Pré-requisito

Rodar no Supabase o SQL de criação da tabela `tasks` (prioridade, tempo médio, data de cadastro, data prevista de entrega, status) definido na conversa anterior, antes de iniciar a implementação — sem a tabela e as policies de RLS o front não tem o que consumir.

## Modelo de dados (recap)

Tabela `public.tasks`:

- `id`, `user_id`, `title`, `description`
- `priority`: `low` | `medium` | `high`
- `status`: `pending` | `in_progress` | `completed` — vira as 3 colunas do board
- `average_duration_minutes`: tempo médio estimado
- `due_date`: data prevista de entrega
- `created_at`: data de cadastro
- `updated_at`

RLS por `user_id = auth.uid()`, mesmo padrão de `clients`.

## Decisão em aberto: drag-and-drop

O projeto não tem nenhuma lib de DnD instalada. Duas opções:

1. **Adicionar `@dnd-kit/core` + `@dnd-kit/sortable`** — API madura, acessível (teclado incluso), compatível com React 19. Recomendado.
2. **HTML5 Drag and Drop API nativo** — zero dependências novas, mas mais código manual e sem suporte a teclado/acessibilidade out-of-the-box.

Confirmar com o usuário antes de instalar pacote novo.

## Passo a passo

1. **Hook de dados** — `hooks/use-tasks.ts`, espelhando `hooks/use-clients.ts`:
   - `TaskRecord`, `TaskInput`, `TaskStatus`, `TaskPriority`.
   - `fetchTasks`, `createTask`, `updateTask` (inclui `updateTaskStatus(id, status)` usado pelo drag-and-drop), `deleteTask`.
   - Sempre filtrando por `user_id` do usuário autenticado, como no hook de clientes.

2. **Rota e navegação**:
   - `app/dashboard/tasks/page.tsx`.
   - Novo item no array `navigation` de [dashboard-sidebar.tsx](app/dashboard/_components/dashboard-sidebar.tsx:12) → `{ href: "/dashboard/tasks", label: "Tarefas", icon: ... }` (ícone `lucide-react`, ex. `KanbanSquare` ou `ListTodo`).

3. **Componentes do board** (`app/dashboard/tasks/_components/`):
   - `kanban-board.tsx` — 3 colunas (`Pendente`, `Em andamento`, `Concluída`), cada uma renderizando os cards filtrados por `status`.
   - `task-card.tsx` — título, badge de prioridade (cores por `low`/`medium`/`high`, usando `components/ui/badge.tsx`), data prevista de entrega, tempo médio.
   - `task-form-dialog.tsx` — criar/editar tarefa, mesmo padrão de [client-form-dialog.tsx](app/dashboard/clients/_components/client-form-dialog.tsx): campos título, descrição, prioridade (`SelectRoot`), tempo médio, data prevista (`components/ui/calendar.tsx` ou input date).
   - `delete-task-dialog.tsx` — mesmo padrão de [delete-client-dialog.tsx](app/dashboard/clients/_components/delete-client-dialog.tsx).

4. **Drag-and-drop**: ao soltar um card em outra coluna, chamar `updateTaskStatus` — atualização otimista no estado local + rollback com toast de erro em caso de falha (mesmo padrão de tratamento de erro do `use-clients.ts`, usando `sonner`).

5. **Estados vazios e loading**: skeleton (`components/ui/skeleton.tsx`) durante `isLoading`, mensagem de coluna vazia.

6. **Documentar**: ao concluir, registrar em `.agents/context/` (padrão já usado no projeto) e atualizar o README (rotas, funcionalidades) como foi feito para as demais features.

## Fora de escopo (por enquanto)

- Reordenação de tarefas dentro da mesma coluna (apenas troca de coluna/status).
- Filtros/busca no board (pode reaproveitar padrão de busca de `clients` depois).
