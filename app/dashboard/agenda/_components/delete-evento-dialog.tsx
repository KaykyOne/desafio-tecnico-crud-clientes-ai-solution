"use client";

//* Components Imports
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";

type DeleteEventoDialogProps = {
  open: boolean;
  titulo: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export default function DeleteEventoDialog({ open, titulo, isDeleting, onOpenChange, onConfirm }: DeleteEventoDialogProps) {
  async function handleConfirm() {
    if (await onConfirm()) onOpenChange(false);
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background p-8 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Excluir evento?</DialogTitle>
          <DialogDescription>
            Essa ação removerá <strong>{titulo}</strong> da sua agenda e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleConfirm()}>{isDeleting ? "Excluindo..." : "Excluir evento"}</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
