"use client";

//* Libraries Imports
import { useState, type FormEvent } from "react";

//* Components Imports
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { TaskColumnRecord } from "@/hooks/use-task-columns";
import type { TaskInput, TaskPriority, TaskRecord } from "@/hooks/use-tasks";

type TaskFormDialogProps = {
  open: boolean;
  task: TaskRecord | null;
  columns: TaskColumnRecord[];
  clients: ClientRecord[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: TaskInput) => Promise<boolean>;
};

function createEmptyForm(columnId: string): TaskInput {
  return {
    title: "",
    description: "",
    priority: "medium",
    column_id: columnId,
    cliente_id: null,
    average_duration_minutes: 30,
    due_date: new Date().toISOString().split("T")[0],
  };
}

export default function TaskFormDialog({
  open,
  task,
  columns,
  clients,
  isSaving,
  onOpenChange,
  onSubmit,
}: TaskFormDialogProps) {
  const [form, setForm] = useState<TaskInput>(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          column_id: task.column_id,
          cliente_id: task.cliente_id,
          average_duration_minutes: task.average_duration_minutes,
          due_date: task.due_date,
        }
      : createEmptyForm(columns[0]?.id ?? ""),
  );
  const isEditing = Boolean(task);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
    if (saved) onOpenChange(false);
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">
            {isEditing ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes da tarefa." : "Planeje uma nova tarefa para o seu fluxo de trabalho."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              required
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Ex.: Preparar proposta"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Detalhes importantes para esta tarefa"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Coluna</Label>
              <SelectRoot
                value={form.column_id}
                onValueChange={(value) => {
                  if (value) setForm((current) => ({ ...current, column_id: value }));
                }}
              >
                <SelectTrigger className="h-11 w-full bg-background">
                  <SelectValue>
                    {columns.find((column) => column.id === form.column_id)?.name ?? "Selecione uma coluna"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <SelectRoot
                value={form.priority}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as TaskPriority,
                  }))
                }
              >
                <SelectTrigger className="h-11 w-full bg-background">
                  <SelectValue>
                    {form.priority === "low" ? "Baixa" : form.priority === "medium" ? "Média" : "Urgente"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Urgente</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cliente (opcional)</Label>
            <SelectRoot
              value={form.cliente_id ?? "none"}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  cliente_id: value === "none" ? null : value,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full bg-background">
                <SelectValue>{clients.find((client) => client.id === form.cliente_id)?.name ?? "Nenhum"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-duration">Tempo médio (minutos)</Label>
            <Input
              id="task-duration"
              type="number"
              min="1"
              required
              value={form.average_duration_minutes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  average_duration_minutes: Number(event.target.value),
                }))
              }
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Data prevista de entrega</Label>
            <Input
              id="task-due-date"
              type="date"
              required
              value={form.due_date}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  due_date: event.target.value,
                }))
              }
              className="h-11"
            />
          </div>
          <DialogFooter className="mt-6 border-t-0 bg-transparent p-0">
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !form.column_id}>
              {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
