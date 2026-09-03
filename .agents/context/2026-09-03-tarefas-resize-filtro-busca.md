# Melhorias na aba de Tarefas: Resize Handle + Filtro de Busca

**Data:** 2026-09-03  
**Alteração:** Adicionado resize handle para altura do Kanban Board + filtro de busca por nome/descrição

## Resumo

Implementadas duas melhorias na aba de tarefas (`/dashboard/tasks`):

1. **Resize Handle**: Adicionar um elemento arrastável entre os filtros e o Kanban Board que permite aumentar/diminuir a altura do quadro de tarefas.
2. **Filtro de Busca Unificado**: Novo input de busca que filtra tarefas por **nome** E **descrição** no mesmo campo.

## Mudanças de Código

### 1. `lib/task-filters.ts`

Adicionado campo `searchText` ao tipo `TaskFilterValue`:

```typescript
export type TaskFilterValue = {
  clienteIds: string[];
  priorities: TaskPriority[];
  weekStart: string | null;
  searchText: string;  // ✨ NOVO
};

export const EMPTY_TASK_FILTERS: TaskFilterValue = {
  clienteIds: [],
  priorities: [],
  weekStart: null,
  searchText: "",  // ✨ NOVO
};
```

Lógica de filtro atualizada em `filterTasks()`:

```typescript
if (filters.searchText) {
  const query = filters.searchText.toLowerCase();
  const titleMatch = task.title.toLowerCase().includes(query);
  const descriptionMatch = task.description?.toLowerCase().includes(query) ?? false;
  if (!titleMatch && !descriptionMatch) return false;
}
```

### 2. `app/dashboard/tasks/_components/task-filters.tsx`

Adicionado input de busca com ícone (Search do lucide-react):

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
  <Input
    type="text"
    placeholder="Nome ou descrição..."
    className="h-9 pl-9 pr-3"
    value={value.searchText}
    onChange={(e) => onChange({ ...value, searchText: e.target.value })}
  />
</div>
```

### 3. `app/dashboard/tasks/page.tsx`

Adicionado estado e lógica de resize:

```typescript
const [boardHeight, setBoardHeight] = useState(60);
const resizeRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleMouseDown = () => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const container = resizeRef.current.closest("section");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = Math.max(
        20,
        Math.min(90, ((e.clientY - containerRect.top) / containerRect.height) * 100)
      );
      setBoardHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const element = resizeRef.current;
  if (element) {
    element.addEventListener("mousedown", handleMouseDown);
    return () => element.removeEventListener("mousedown", handleMouseDown);
  }
}, []);
```

JSX estrutura:

```tsx
<TaskFilters value={filters} clients={clients} onChange={setFilters} />
<div
  ref={resizeRef}
  className="h-1 cursor-row-resize hover:bg-primary/20 transition-colors"
  title="Arraste para redimensionar"
/>
<div style={{ height: `calc(${boardHeight}% - 0.25rem)` }} className="min-h-0 flex-1">
  <DndContext {...props}>
    {/* Kanban Board */}
  </DndContext>
</div>
```

## Comportamento

- **Filtro de Busca**: Digitar no input de busca filtra as tarefas em tempo real por:
  - Título (case-insensitive)
  - Descrição (case-insensitive, ignora se `null`)
  - Ambos são buscados com operador OU (AND com outros filtros)

- **Resize Handle**: 
  - Aparece como uma linha fina de 4px entre os filtros e o Kanban
  - Muda de cor ao passar o mouse (`hover:bg-primary/20`)
  - Permite arrastar para redimensionar a altura entre 20%-90% do container
  - Mantém o cursor em `row-resize` durante o arrasto

## Testes Realizados

✅ Criadas 2 tarefas de teste  
✅ Filtro por nome ("filtro") - mostra apenas 1 tarefa  
✅ Filtro por descrição ("cliente") - mostra apenas 1 tarefa  
✅ Limpar filtro - volta a mostrar todas  
✅ Resize handle - arrasta para cima/baixo altera altura do Kanban  

## Próximos Passos (Opcional)

- Persistir altura do Kanban em `localStorage` entre sessões
- Adicionar animação suave no resize
- Adicionar dica visual mostrando a altura atual (ex: "60%")
