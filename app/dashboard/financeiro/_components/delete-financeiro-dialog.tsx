"use client";

//* Components Imports
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";

type DeleteFinanceiroDialogProps = {
  open: boolean;
  descricao: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export default function DeleteFinanceiroDialog({ open, descricao, isDeleting, onOpenChange, onConfirm }: DeleteFinanceiroDialogProps) {
  async function handleConfirm() {
    if (await onConfirm()) onOpenChange(false);
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background p-8 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Excluir lançamento?</DialogTitle>
          <DialogDescription>
            Essa ação removerá <strong>{descricao}</strong> do extrato e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" disabled={isDeleting} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleConfirm()}>{isDeleting ? "Excluindo..." : "Excluir lançamento"}</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
