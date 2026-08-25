"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteClientDialogProps = {
  open: boolean;
  clientName: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export default function DeleteClientDialog({
  open,
  clientName,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteClientDialogProps) {
  async function handleConfirm() {
    const deleted = await onConfirm();
    if (deleted) onOpenChange(false);
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md p-10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Excluir cliente?</DialogTitle>
          <DialogDescription className="px-0">
            Essa ação removerá <strong>{clientName}</strong> da sua carteira e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={() => void handleConfirm()} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Excluir cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
