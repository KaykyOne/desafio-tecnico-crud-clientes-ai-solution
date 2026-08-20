"use client";

//* Components Imports
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";

type DeleteTaskDialogProps = { open: boolean; taskTitle: string; isDeleting: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => Promise<boolean> };

export default function DeleteTaskDialog({ open, taskTitle, isDeleting, onOpenChange, onConfirm }: DeleteTaskDialogProps) {
  async function handleConfirm() { if (await onConfirm()) onOpenChange(false); }
  return <DialogRoot open={open} onOpenChange={onOpenChange}><DialogContent className="bg-background p-8 sm:max-w-md"><DialogHeader><DialogTitle className="text-xl font-bold tracking-[-0.04em]">Excluir tarefa?</DialogTitle><DialogDescription>Essa ação removerá <strong>{taskTitle}</strong> e não pode ser desfeita.</DialogDescription></DialogHeader><DialogFooter className="mt-4 border-t-0 bg-transparent p-0"><Button type="button" variant="outline" disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleConfirm()}>{isDeleting ? "Excluindo..." : "Excluir tarefa"}</Button></DialogFooter></DialogContent></DialogRoot>;
}
