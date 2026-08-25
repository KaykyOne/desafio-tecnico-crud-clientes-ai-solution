# Task: Skeletons de carregamento

## Objetivo

Trocar os estados de carregamento em texto ("Carregando clientes...", "Carregando seus dados...") por skeletons visuais, e extrair o skeleton já usado no Kanban para um componente próprio. Para isso, criar dois componentes base reutilizáveis em `components/` e, a partir deles, um skeleton específico por rota que tem carregamento, dentro do `_components` de cada rota.

## Componentes base (`components/`)

Compostos sobre o primitive já existente [`components/ui/skeleton.tsx`](../components/ui/skeleton.tsx) (`<Skeleton className="animate-pulse rounded-md bg-muted" />`). Ficam em `components/` (não em `components/ui/`) por serem composições específicas do app, não primitives genéricos.

1. **`components/card-skeleton.tsx`** — placeholder no formato do [`Card`](../components/ui/card.tsx) (`rounded-xl bg-card ring-1 ring-foreground/10`, mesmo `--card-spacing`). Props sugeridas: `lines?: number` (quantas barras de conteúdo, default 2) e `className?: string`. Estrutura: uma barra maior (título) + N barras menores (conteúdo), todas usando `Skeleton`. Vai ser reaproveitado nos cards de estatística de clientes e nos cards de tarefa do Kanban.

2. **`components/label-skeleton.tsx`** — placeholder de um par [`Label`](../components/ui/label.tsx) + input: uma barra estreita e curta (rótulo) sobre uma barra `h-11` (altura padrão dos `Input` do projeto). Prop `className?: string`. Vai ser reaproveitado no formulário de configurações.

## Skeletons por rota (`_components`)

Levantamento das rotas que hoje têm `isLoading` vindo de um hook e o que cada uma mostra enquanto carrega:

| Rota                       | Estado atual                                                       | Arquivo                                                                                       |
| -------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `/dashboard/clients`       | Texto "Carregando clientes..." numa linha da tabela                | [clients/page.tsx:84](../app/dashboard/clients/page.tsx)                                      |
| `/dashboard/settings`      | Texto "Carregando seus dados..." substituindo a página inteira     | [settings/page.tsx:18-26](../app/dashboard/settings/page.tsx)                                 |
| `/dashboard/tasks`         | Já usa `Skeleton` cru, repetido inline dentro do `KanbanColumn`    | [tasks/\_components/kanban-board.tsx:47](../app/dashboard/tasks/_components/kanban-board.tsx) |
| `/dashboard` (visão geral) | Página estática, não busca dados — **sem loading, fora de escopo** | [dashboard/page.tsx](../app/dashboard/page.tsx)                                               |

### 1. `app/dashboard/clients/_components/clients-skeleton.tsx`

Substitui o `isLoading` de [`ClientsPage`](../app/dashboard/clients/page.tsx:23) (hook `useClients`). Deve reproduzir a forma final da página:

- 3 `CardSkeleton` no lugar dos `StatCard` (grid `md:grid-cols-3`).
- Dentro do container `rounded-xl border bg-card p-4`, uma barra no lugar do campo de busca + algumas linhas de `Skeleton` no formato de linha de tabela (uma barra por coluna: nome, contato, status, cadastro, ações) repetidas ~5 vezes.

Trocar a renderização condicional atual (`isLoading ? <Table.TableRow>texto</Table.TableRow> : ...`) para renderizar `<ClientsSkeleton />` no lugar de toda a seção de stats + tabela quando `isLoading` for `true`, em vez de só a linha da tabela.

### 2. `app/dashboard/settings/_components/settings-skeleton.tsx`

Substitui o bloco `if (isLoading) return (...)` de [`SettingsPage`](../app/dashboard/settings/page.tsx:18) (hook `useProfile`). Deve reproduzir a forma final:

- Cabeçalho (título/descrição) pode continuar como está hoje, sem skeleton — só o conteúdo dinâmico precisa de placeholder.
- Container `rounded-xl border bg-card p-6 sm:p-8` com 3 `LabelSkeleton` (Nome, E-mail, Nova senha) + uma barra `h-11` alinhada à direita no lugar do botão "Salvar alterações".

### 3. `app/dashboard/tasks/_components/task-card-skeleton.tsx`

Extrai o placeholder hoje inline em [`kanban-board.tsx:47`](../app/dashboard/tasks/_components/kanban-board.tsx) (`Array.from({ length: 3 }, ... <Skeleton className="h-32 w-full rounded-xl" />)`) para um componente próprio baseado em `CardSkeleton`, no mesmo formato do [`TaskCard`](../app/dashboard/tasks/_components/task-card.tsx) real (título + badge de prioridade + 2 linhas de meta). `KanbanColumn` passa a renderizar `Array.from({ length: 3 }, (_, i) => <TaskCardSkeleton key={i} />)` em vez do `Skeleton` cru.

## Decisões

- `CardSkeleton`/`LabelSkeleton` ficam genéricos (sem saber nada de clientes/tarefas/config) — a forma específica de cada tela é montada no skeleton daquela rota, que é quem sabe quantos campos/linhas existem.
- Overview (`/dashboard`) fica de fora porque não busca dado nenhum hoje; se um dia ganhar dados dinâmicos, essa mesma tarefa serve de referência.
- Manter os skeletons dentro de `_components` da própria rota (não em `components/`), seguindo o padrão já usado no projeto para peças que só fazem sentido numa tela (`client-form-dialog.tsx`, `task-card.tsx` etc.).

## Critério de aceite

- Nenhuma tela mostra texto "Carregando..." — todas usam skeleton visual no formato final do conteúdo.
- `components/card-skeleton.tsx` e `components/label-skeleton.tsx` existem e são reaproveitados em pelo menos duas rotas cada.
- `kanban-board.tsx` não tem mais `Skeleton` cru inline — usa `TaskCardSkeleton`.
