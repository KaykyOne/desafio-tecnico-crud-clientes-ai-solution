"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";

type DeleteEventoDialogProps = {
  open: boolean;
  titulo: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export function DeleteEventoDialog({ open, titulo, isDeleting, onOpenChange, onConfirm }: DeleteEventoDialogProps) {
  async function handleConfirm() {
    if (await onConfirm()) onOpenChange(false);
  }

  return (
    <Dialog.DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="bg-background p-8 sm:max-w-md">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">Excluir evento?</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Essa ação removerá <strong>{titulo}</strong> da sua agenda e não pode ser desfeita.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>
        <Dialog.DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" disabled={isDeleting} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleConfirm()}>
            {isDeleting ? "Excluindo..." : "Excluir evento"}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
