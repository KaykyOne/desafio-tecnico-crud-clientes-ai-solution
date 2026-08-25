# Task para o Codex: colunas do Kanban configuráveis por usuário

## Contexto

O Kanban de tarefas (`app/dashboard/tasks/`) hoje tem exatamente 3 colunas fixas, hardcoded em dois lugares:

- [`app/dashboard/tasks/_components/kanban-board.tsx`](_components/kanban-board.tsx:25) — array `columns` com `status`/`title`/`description`/`icon`.
- [`app/dashboard/tasks/page.tsx`](page.tsx:19) — array `statuses` usado no `handleDragEnd`.
- [`hooks/use-tasks.ts`](../../../hooks/use-tasks.ts:10) — `TaskStatus = "pending" | "in_progress" | "completed"`, e `tasks.status` no banco é `text` com `check (status in (...))`.

Objetivo desta task: cada usuário passa a poder criar, renomear, reordenar e excluir suas próprias colunas, em vez de ficar preso a `pending`/`in_progress`/`completed`.

## Pré-requisito: migration no Supabase

Rodar o SQL abaixo no SQL editor do Supabase **antes** de mexer no front. Ele:

1. Cria `public.task_columns`, uma tabela de colunas por usuário (RLS por `auth.uid()`, mesmo padrão de `clients`/`tasks`).
2. Cria um trigger que semeia as 3 colunas padrão (`Pendente`, `Em andamento`, `Concluída`) automaticamente para todo novo usuário (`after insert on auth.users`).
3. Faz o backfill dessas mesmas 3 colunas para os usuários que já existem hoje.
4. Adiciona `tasks.column_id` (FK para `task_columns.id`), migra os dados do antigo `tasks.status` para a coluna correspondente, torna `column_id` obrigatório e **remove a coluna `status`** — `column_id` passa a ser a única fonte de verdade de "em qual coluna a tarefa está".

```sql
-- 1) Tabela de colunas do Kanban, por usuário
create table if not exists public.task_columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  name text not null check (char_length(trim(name)) > 0),
  color text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

create index if not exists task_columns_user_id_idx on public.task_columns (user_id);
create index if not exists task_columns_user_position_idx on public.task_columns (user_id, position);

create trigger set_task_columns_updated_at
  before update on public.task_columns
  for each row
  execute function extensions.moddatetime (updated_at);

alter table public.task_columns enable row level security;
alter table public.task_columns force row level security;

create policy "Task columns are viewable by owner"
  on public.task_columns for select to authenticated using (user_id = auth.uid());
create policy "Task columns are insertable by owner"
  on public.task_columns for insert to authenticated with check (user_id = auth.uid());
create policy "Task columns are updatable by owner"
  on public.task_columns for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Task columns are deletable by owner"
  on public.task_columns for delete to authenticated using (user_id = auth.uid());

-- 2) Seed automático das 3 colunas padrão para todo novo usuário
create or replace function public.seed_default_task_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_columns (user_id, key, name, position)
  values
    (new.id, 'pending', 'Pendente', 0),
    (new.id, 'in_progress', 'Em andamento', 1),
    (new.id, 'completed', 'Concluída', 2)
  on conflict (user_id, key) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_seed_task_columns
  after insert on auth.users
  for each row
  execute function public.seed_default_task_columns();

-- 2b) Backfill das colunas padrão para usuários que já existem
insert into public.task_columns (user_id, key, name, position)
select id, 'pending', 'Pendente', 0 from auth.users
union all
select id, 'in_progress', 'Em andamento', 1 from auth.users
union all
select id, 'completed', 'Concluída', 2 from auth.users
on conflict (user_id, key) do nothing;

-- 3) tasks passa a referenciar a coluna em vez de um status fixo
alter table public.tasks add column if not exists column_id uuid references public.task_columns (id);

update public.tasks t
set column_id = tc.id
from public.task_columns tc
where tc.user_id = t.user_id
  and tc.key = t.status
  and t.column_id is null;

alter table public.tasks alter column column_id set not null;

create index if not exists tasks_column_id_idx on public.tasks (column_id);

alter table public.tasks drop column if exists status;
```

Decisões tomadas nessa migration (vale manter no front):

- **Sem `on delete cascade`/`set null` em `tasks.column_id`**: por padrão o Postgres bloqueia (`NO ACTION`) apagar uma coluna que ainda tem tarefas. O front deve impedir a exclusão de uma coluna com tarefas (ou oferecer mover as tarefas antes), e tratar o erro do Postgres como fallback.
- `key` só importa para o seed automático das colunas padrão (evita duplicar `Pendente`/`Em andamento`/`Concluída` se o trigger rodar mais de uma vez). Para colunas novas criadas pelo usuário, qualquer slug único por usuário serve (ex.: slug do nome, ou `crypto.randomUUID()`); **o identificador usado em todo o resto do app é `id` (uuid), não `key`**.
- `color` é opcional (nullable) — pensado para o usuário customizar a cor do cabeçalho da coluna. Pode ficar de fora do MVP se o Codex preferir focar em nome/ordem/exclusão primeiro.
- `position` não tem `unique`, para não travar reordenações em lote. A ordenação exibida é sempre `order by position asc`; ao criar uma coluna nova, usar `max(position) + 1` do usuário.

## Trabalho de frontend

1. **`hooks/use-task-columns.ts`** (novo) — espelhar o padrão de `hooks/use-tasks.ts`:
   - `TaskColumnRecord` (`id`, `user_id`, `key`, `name`, `color`, `position`, `created_at`, `updated_at`).
   - `fetchColumns` (ordenado por `position`), `createColumn(name)`, `renameColumn(id, name)`, `deleteColumn(id)` (tratar erro de FK quando a coluna ainda tem tarefas com uma mensagem clara via `sonner`), `reorderColumns(orderedIds)` (atualiza `position` em lote).

2. **`hooks/use-tasks.ts`**:
   - Trocar `TaskStatus`/`status` por `column_id: string` em `TaskRecord` e `TaskInput`.
   - `select`/`insert`/`update` passam a incluir `column_id` em vez de `status`.
   - `updateTaskStatus(id, status)` vira `updateTaskColumn(id, columnId)`.

3. **`app/dashboard/tasks/_components/kanban-board.tsx`**:
   - Remover o array `columns` hardcoded; receber as colunas de `useTaskColumns()` e renderizar uma `KanbanColumn` por registro, filtrando `tasks` por `task.column_id === column.id`.
   - Ícone fixo por status deixa de fazer sentido — usar um ícone genérico ou o `color` da coluna no cabeçalho.

4. **`app/dashboard/tasks/page.tsx`**:
   - Trocar o array `statuses` fixo pela lista de `column_id`s vindos de `useTaskColumns()` para validar o `handleDragEnd`.
   - `handleDragEnd` deve chamar `updateTaskColumn` em vez de `updateTaskStatus`.

5. **UI de gerenciar colunas** (novo, ex.: `_components/manage-columns-dialog.tsx`):
   - Botão perto de "Nova tarefa" para abrir um diálogo com a lista de colunas do usuário.
   - Ações: adicionar coluna (nome), renomear, excluir (bloqueando/avisando se houver tarefas nela).
   - Reordenar colunas (drag-and-drop reaproveitando `@dnd-kit`, já é dependência do projeto) pode ficar como segunda etapa — não é bloqueante para o restante funcionar.

6. **`app/dashboard/tasks/_components/task-form-dialog.tsx`**:
   - Hoje o formulário não expõe `status` (ele só é setado via drag no board, com default `"pending"` em `emptyForm`). Trocar o default para "a primeira coluna do usuário, ordenada por `position`" — o formulário provavelmente precisa receber a lista de colunas para escolher esse default e, ao criar uma tarefa fora do board, opcionalmente deixar escolher a coluna.

## Fora de escopo (pode ficar para depois)

- Reordenação de colunas por drag-and-drop (pode nascer como "adicionar sempre no fim" e evoluir depois).
- Cor por coluna, se o Codex preferir não implementar já.
- Limite máximo de colunas por usuário.

## Critério de aceite

- Um usuário novo, ao logar pela primeira vez, já vê as 3 colunas padrão.
- Um usuário consegue criar uma coluna nova, renomear e excluir uma coluna sem tarefas.
- Tentar excluir uma coluna com tarefas dá um erro amigável, sem apagar as tarefas.
- Arrastar uma tarefa entre colunas continua funcionando, agora movendo `column_id`.
- Nenhuma referência a `status`/`TaskStatus` sobra no código (grep por `TaskStatus` e por `.status` em `tasks`).
