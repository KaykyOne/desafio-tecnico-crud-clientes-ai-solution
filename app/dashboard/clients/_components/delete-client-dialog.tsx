"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";

type DeleteClientDialogProps = {
  open: boolean;
  clientName: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export function DeleteClientDialog({ open, clientName, isDeleting, onOpenChange, onConfirm }: DeleteClientDialogProps) {
  async function handleConfirm() {
    const deleted = await onConfirm();
    if (deleted) onOpenChange(false);
  }

  return (
    <Dialog.DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="bg-background sm:max-w-md p-10">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">Excluir cliente?</Dialog.DialogTitle>
          <Dialog.DialogDescription className="px-0">
            Essa ação removerá <strong>{clientName}</strong> da sua carteira e não pode ser desfeita.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>
        <Dialog.DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={() => void handleConfirm()} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Excluir cliente"}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
