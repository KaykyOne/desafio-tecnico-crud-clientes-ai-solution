# Convenções de código

Regras obrigatórias deste projeto. A referência completa (incluindo nomenclatura, estrutura interna
de componentes e handlers) está em [.agents/skills/imports.md](.agents/skills/imports.md) — este
arquivo é o resumo operacional do que mais se erra no dia a dia.

---

## 1. Um componente por arquivo

Cada arquivo `.tsx` exporta **exatamente um** componente React.

Se um componente auxiliar nasce dentro de outro arquivo, ele vira arquivo próprio na pasta
`_components/` da rota — não fica junto.

```
app/dashboard/tasks/
├── page.tsx
└── _components/
    ├── index.ts                  ← barrel
    ├── kanban-board.tsx          ← KanbanBoard
    ├── kanban-column.tsx         ← KanbanColumn
    └── draggable-task-card.tsx   ← DraggableTaskCard
```

Tipos, constantes e funções puras relacionadas ao componente podem ficar no mesmo arquivo. Lógica
pura reaproveitável (cálculo, filtro, formatação) vai pra `lib/`, não pra dentro do componente.

**Exceção:** arquivos reservados do Next (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
`not-found.tsx`, `route.ts`) continuam com `export default` — é exigência do framework.

## 2. Named export para componente do projeto, default para shadcn

**Componentes que nós escrevemos → named export**, importados com chaves:

```tsx
// task-card.tsx
export function TaskCard({ task }: TaskCardProps) { ... }

// quem consome
import { TaskCard } from "./_components/task-card";
```

**Componentes do shadcn (`components/ui/`) → default import.** Os que agrupam várias peças vêm
como namespace:

```tsx
import Button from "@/components/ui/button"; // peça única
import Dialog from "@/components/ui/dialog"; // namespace

<Dialog.DialogRoot>
  <Dialog.DialogContent>
    <Button>Salvar</Button>
  </Dialog.DialogContent>
</Dialog.DialogRoot>;
```

O motivo da divisão: bate o olho no import e já se sabe se aquilo é código nosso (chaves) ou peça
de fora (default).

## 3. Barrel `index.ts` em cada `_components/`

Toda pasta `_components/` tem um `index.ts` reexportando seus módulos:

```ts
export * from "./kanban-board";
export * from "./task-card";
```

Assim a página importa de um lugar só:

```tsx
import { KanbanBoard, TaskCard, TaskFilters } from "./_components";
```

**Um componente da pasta nunca importa pelo barrel** — importa direto o arquivo irmão
(`./task-card`). Passar pelo barrel criaria import circular.

## 4. Imports agrupados e comentados

Todo import pertence a uma seção comentada. Sem exceção, mesmo com um import só.

Ordem:

```
//* Components Imports
//* Libraries Imports
//* Hooks Imports
//* Services Imports
//* Schemas Imports
//* Types Imports
//* Constants Imports
//* Utils Imports
```

Só existe a seção que tem conteúdo — não deixar cabeçalho vazio.

```tsx
"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";

import { TaskCard } from "./task-card";

//* Libraries Imports
import { useState } from "react";
import { Plus } from "lucide-react";

//* Hooks Imports
import { useTasks } from "@/hooks/use-tasks";

//* Types Imports
import type { TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";
```

Dentro de **Components**, o shadcn vem primeiro e os componentes do projeto depois, separados por
linha em branco.

Import usado só como tipo usa `import type` e vai pra **Types**, mesmo vindo de uma biblioteca.

## 5. Acesso a dados passa pela camada genérica

Nenhum hook fala com o banco diretamente. Tudo passa por `lib/http.ts` (instância Axios) e pelos
genéricos de `services/`:

```
Componente → Hook → Service genérico → HTTP → Supabase
```

Trocar o backend depois é mexer em `lib/http.ts` e `services/`, sem tocar em hook nem em tela.

## 6. Nomes

| Coisa             | Padrão           | Exemplo         |
| ----------------- | ---------------- | --------------- |
| Arquivo           | kebab-case       | `task-card.tsx` |
| Componente        | PascalCase       | `TaskCard`      |
| Tipo              | PascalCase       | `TaskCardProps` |
| Função / variável | camelCase        | `handleSubmit`  |
| Handler de evento | prefixo `handle` | `handleDelete`  |

## 7. Comentários

Comentário explica **decisão não óbvia**, não o que o código já diz.

```tsx
// Bom: explica o porquê
// O `delay` fica só no toque; no mouse ele viraria uma espera antes de todo arrasto.

// Ruim: narra o óbvio
// Pega o cliente pelo id.
```

Não deixar código morto comentado — o histórico do git já guarda isso.

## 8. Registro de mudança

Toda alteração gera um arquivo em `.agents/context/YYYY-MM-DD-descricao.md`, com as seções:
Resumo, Arquivos alterados, Alterações, Decisões, Estado atual e Pendências. Se houver SQL, ele vai
literal sob `## SQL (rodar no Supabase)` — é o único registro do que ainda falta rodar no banco.
