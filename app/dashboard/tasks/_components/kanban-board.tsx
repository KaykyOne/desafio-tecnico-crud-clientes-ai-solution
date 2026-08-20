"use client";

//* Libraries Imports
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CheckCircle2, CircleDashed, LoaderCircle } from "lucide-react";

//* Components Imports
import { Skeleton } from "@/components/ui/skeleton";

//* Types Imports
import type { TaskRecord, TaskStatus } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";

import TaskCard from "./task-card";

type KanbanBoardProps = {
  tasks: TaskRecord[];
  isLoading: boolean;
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
};

const columns: Array<{ status: TaskStatus; title: string; description: string; icon: typeof CircleDashed }> = [
  { status: "pending", title: "Pendente", description: "Aguardando início", icon: CircleDashed },
  { status: "in_progress", title: "Em andamento", description: "Em execução", icon: LoaderCircle },
  { status: "completed", title: "Concluída", description: "Finalizadas", icon: CheckCircle2 },
];

function DraggableTaskCard({ task, onEdit, onDelete }: Omit<KanbanBoardProps, "tasks" | "isLoading"> & { task: TaskRecord }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return <div ref={setNodeRef} style={style}><TaskCard task={task} isDragging={isDragging} draggableAttributes={attributes} draggableListeners={listeners} onEdit={onEdit} onDelete={onDelete} /></div>;
}

function KanbanColumn({ status, title, description, icon: Icon, tasks, isLoading, onEdit, onDelete }: { status: TaskStatus; title: string; description: string; icon: typeof CircleDashed; tasks: TaskRecord[] } & Omit<KanbanBoardProps, "tasks">) {
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <section ref={setNodeRef} className={cn("flex min-h-[24rem] flex-col rounded-2xl border bg-muted/45 p-3 transition-colors sm:p-4", isOver && "border-foreground/35 bg-muted")} aria-label={`${title}: ${tasks.length} tarefas`}>
      <header className="mb-4 flex items-start justify-between gap-3 px-1">
        <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-md bg-background text-muted-foreground"><Icon className="size-4" /></span><div><h2 className="text-sm font-bold">{title}</h2><p className="text-xs text-muted-foreground">{description}</p></div></div>
        <span className="flex size-6 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted-foreground">{isLoading ? "—" : tasks.length}</span>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {isLoading ? Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-32 w-full rounded-xl" />) : tasks.length ? tasks.map((task) => <DraggableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />) : <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-background/60 px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma tarefa nesta coluna.</div>}
      </div>
    </section>
  );
}

export default function KanbanBoard({ tasks, isLoading, onEdit, onDelete }: KanbanBoardProps) {
  return <div className="grid gap-5 xl:grid-cols-3">{columns.map((column) => <KanbanColumn key={column.status} {...column} tasks={tasks.filter((task) => task.status === column.status)} isLoading={isLoading} onEdit={onEdit} onDelete={onDelete} />)}</div>;
}
