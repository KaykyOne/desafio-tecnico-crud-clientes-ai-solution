"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";

type DeleteFinanceiroDialogProps = {
  open: boolean;
  descricao?: string;
  count?: number;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export function DeleteFinanceiroDialog({
  open,
  descricao,
  count,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteFinanceiroDialogProps) {
  const isBulk = Boolean(count && count > 1);

  async function handleConfirm() {
    if (await onConfirm()) onOpenChange(false);
  }

  return (
    <Dialog.DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="bg-background p-8 sm:max-w-md">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">
            {isBulk ? `Excluir ${count} lançamentos?` : "Excluir lançamento?"}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            {isBulk ? (
              <>
                Essa ação removerá <strong>{count} lançamentos selecionados</strong> do extrato e não pode ser desfeita.
              </>
            ) : (
              <>
                Essa ação removerá <strong>{descricao}</strong> do extrato e não pode ser desfeita.
              </>
            )}
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>
        <Dialog.DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" disabled={isDeleting} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleConfirm()}>
            {isDeleting ? "Excluindo..." : isBulk ? "Excluir selecionados" : "Excluir lançamento"}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
