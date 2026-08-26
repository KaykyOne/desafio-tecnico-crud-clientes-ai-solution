# Tarefas: vínculo com cliente e edição rápida pelo card

## Resumo

Duas mudanças no Kanban de tarefas:

1. **Cliente opcional na tarefa** — toda tarefa pode (ou não) apontar pra um cliente da carteira. Aparece como select "Cliente (opcional)" no formulário de tarefa e, quando preenchido, o nome do cliente é exibido no rodapé do card, junto da data de entrega e do tempo médio.
2. **Edição rápida pelo badge** — o badge de prioridade do card virou um botão. Clicar nele abre um `Sheet` (lateral direita) onde dá pra trocar a prioridade e o cliente da tarefa sem abrir o modal de edição completo. Cada alteração salva sozinha, de forma otimista.

## Arquivos alterados

- `hooks/use-tasks.ts` — `TaskRecord`/`TaskInput` ganharam `cliente_id: string | null`; novo tipo `TaskQuickPatch` (`priority`/`cliente_id`); colunas do select extraídas pra `SELECT_COLUMNS`; nova função `quickUpdateTask(id, patch)`.
- `app/dashboard/tasks/_components/task-quick-edit-sheet.tsx` (novo) — o Sheet: três opções de prioridade como badges clicáveis (com check na atual) + select de cliente com opção "Nenhum".
- `app/dashboard/tasks/_components/task-card.tsx` — badge de prioridade vira `<button>` via a prop `render` do `Badge` quando `onQuickEdit` é passado; nova prop `clientName` exibida com ícone de usuário no rodapé de metadados.
- `app/dashboard/tasks/_components/kanban-board.tsx` — repassa `clientNameById` e `onQuickEdit` até o card.
- `app/dashboard/tasks/_components/task-form-dialog.tsx` — novo select "Cliente (opcional)".
- `app/dashboard/tasks/page.tsx` — usa `useClients()`, monta o mapa `clientNameById`, guarda `quickEditTaskId` e renderiza o Sheet.

## SQL (rodar no Supabase)

```sql
alter table public.tasks add column if not exists cliente_id uuid references public.clients (id) on delete set null;
```

`on delete set null`: apagar um cliente não apaga as tarefas dele, só desvincula.

## Decisões

- **`quickUpdateTask` é otimista e não recarrega a lista** (mesmo padrão do `updateTaskColumn`, e diferente do `updateTask`, que faz `fetchTasks()`): a edição pelo card precisa responder na hora, e um refetch a cada clique de prioridade seria pesado e piscaria a tela. Em erro, o estado anterior é restaurado e um toast explica.
- **A página guarda `quickEditTaskId`, não o objeto da tarefa** — a tarefa é lida da lista `tasks` a cada render, então o Sheet reflete cada alteração salva imediatamente (marcando a prioridade nova como selecionada). Guardar o objeto deixaria o Sheet exibindo o estado velho depois do primeiro clique.
- **Salva na hora, sem botão de confirmar** — é o motivo de existir o atalho; um "Salvar" transformaria o Sheet num segundo modal de edição.
- O clique no badge não dispara arrasto porque o `PointerSensor` do quadro já usa `activationConstraint: { distance: 6 }` — mesma razão pela qual os botões de editar/excluir do card já funcionavam.
- Estilos de prioridade do Sheet são próprios, não reaproveitados do card: os do card (`priorityBadgeStyles`) foram feitos pra ficar por cima do fundo colorido do card, e ficariam sem contraste sobre o fundo neutro do Sheet.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos; a rota `/dashboard/tasks` compila e responde 200 no dev server. **A verificação visual (abrir o Sheet, trocar prioridade/cliente) não foi feita**: a sessão do preview tinha expirado e voltava pro `/login` — não faço login pelo usuário. Falta também rodar o SQL acima; sem ele, listar tarefas falha com `column tasks.cliente_id does not exist`.

## Pendências

- Rodar o SQL acima no Supabase.
- Verificar visualmente o Sheet depois de logar.
