"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";

//* Utils Imports
import { cn } from "@/lib/utils";

/** Uma linha da lista de detalhe. Genérica de propósito: serve pra lançamento e pra cliente. */
export type OverviewDetailItem = {
  id: string;
  primary: string;
  secondary: string;
  trailing?: string;
  trailingClassName?: string;
};

type OverviewDetailDialogProps = {
  title: string;
  description: string;
  total?: string;
  totalClassName?: string;
  items: OverviewDetailItem[];
  onOpenChange: (open: boolean) => void;
};

export function OverviewDetailDialog({
  title,
  description,
  total,
  totalClassName,
  items,
  onOpenChange,
}: OverviewDetailDialogProps) {
  return (
    <Dialog.DialogRoot open onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-md sm:p-8">
        <Dialog.DialogHeader className="min-w-0">
          <Dialog.DialogTitle className="text-xl font-semibold tracking-[-0.03em]">{title}</Dialog.DialogTitle>
          <Dialog.DialogDescription>{description}</Dialog.DialogDescription>
        </Dialog.DialogHeader>

        {total && (
          <div className="min-w-0 rounded-xl border bg-muted p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Total</p>
            <p className={cn("mt-1 text-2xl font-semibold tracking-[-0.03em] tabular-nums", totalClassName)}>{total}</p>
          </div>
        )}

        <ul className="min-w-0 divide-y rounded-xl border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.primary}</p>
                <p className="text-xs text-muted-foreground">{item.secondary}</p>
              </div>
              {item.trailing && (
                <p className={cn("shrink-0 text-sm font-semibold tabular-nums", item.trailingClassName)}>
                  {item.trailing}
                </p>
              )}
            </li>
          ))}
        </ul>

        <Dialog.DialogFooter className="mt-2 min-w-0 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
