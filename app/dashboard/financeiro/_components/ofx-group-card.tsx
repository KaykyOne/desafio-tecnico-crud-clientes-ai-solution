"use client";

//* Components Imports
import Checkbox from "@/components/ui/checkbox";
import Select from "@/components/ui/select";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { OfxGroup } from "@/lib/ofx";

//* Utils Imports
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

/** Escolhas do usuário para um grupo de transações do OFX, antes de importar. */
export type OfxReviewState = {
  include: boolean;
  tipo: "gasto" | "ganho";
  cliente_id: string | null;
};

type OfxGroupCardProps = {
  group: OfxGroup;
  review: OfxReviewState;
  clients: ClientRecord[];
  onUpdate: (patch: Partial<OfxReviewState>) => void;
};

const toneStyles = {
  ganho: { border: "border-l-emerald-400", text: "text-emerald-700", sign: "+" },
  gasto: { border: "border-l-rose-400", text: "text-rose-700", sign: "-" },
};

export function OfxGroupCard({ group, review, clients, onUpdate }: OfxGroupCardProps) {
  const tone = toneStyles[review.tipo];
  const total = group.valor * group.transactions.length;

  return (
    <div className={cn("rounded-lg border border-l-4 bg-card p-4", tone.border)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={review.include}
            onCheckedChange={(checked) => onUpdate({ include: checked === true })}
            className="mt-1"
          />
          <div>
            <p className="font-medium">{group.descricao}</p>
            <p className="text-xs text-muted-foreground">
              {group.transactions.length === 1 ? "1 transação" : `${group.transactions.length} transações`} ·{" "}
              {formatCurrency(group.valor)} {group.transactions.length > 1 && "cada"}
            </p>
          </div>
        </div>
        <p className={cn("shrink-0 text-sm font-semibold", tone.text)}>
          {tone.sign}
          {formatCurrency(total)}
        </p>
      </div>

      {review.include && (
        <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-2">
          <Select.SelectRoot
            value={review.tipo}
            onValueChange={(value) => onUpdate({ tipo: value as "gasto" | "ganho" })}
          >
            <Select.SelectTrigger className="h-10 w-full bg-background">
              <Select.SelectValue>{review.tipo === "gasto" ? "Saída" : "Ganho"}</Select.SelectValue>
            </Select.SelectTrigger>
            <Select.SelectContent>
              <Select.SelectItem value="gasto">Saída</Select.SelectItem>
              <Select.SelectItem value="ganho">Ganho</Select.SelectItem>
            </Select.SelectContent>
          </Select.SelectRoot>

          <Select.SelectRoot
            value={review.cliente_id ?? "none"}
            onValueChange={(value) => onUpdate({ cliente_id: value === "none" ? null : value })}
          >
            <Select.SelectTrigger className="h-10 w-full bg-background">
              <Select.SelectValue>
                {clients.find((client) => client.id === review.cliente_id)?.name ?? "Nenhum cliente"}
              </Select.SelectValue>
            </Select.SelectTrigger>
            <Select.SelectContent>
              <Select.SelectItem value="none">Nenhum cliente</Select.SelectItem>
              {clients.map((client) => (
                <Select.SelectItem key={client.id} value={client.id}>
                  {client.name}
                </Select.SelectItem>
              ))}
            </Select.SelectContent>
          </Select.SelectRoot>
        </div>
      )}
    </div>
  );
}
