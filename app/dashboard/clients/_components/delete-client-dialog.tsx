"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";

type DeleteClientDialogProps = {
  open: boolean;
  clientName: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export default function DeleteClientDialog({ open, clientName, isDeleting, onOpenChange, onConfirm }: DeleteClientDialogProps) {
  async function handleConfirm() {
    const deleted = await onConfirm();
    if (deleted) onOpenChange(false);
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#f0d8d3] bg-[#fffaf9] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em] text-[#8f3f35]">Excluir cliente?</DialogTitle>
          <DialogDescription className="px-0 text-[#806e69]">Essa ação removerá <strong>{clientName}</strong> da sua carteira e não pode ser desfeita.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancelar</Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={isDeleting} className="bg-[#b45d4d] text-white hover:bg-[#984b3d]">{isDeleting ? "Excluindo..." : "Excluir cliente"}</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
