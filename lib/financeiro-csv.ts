import type { BancoRecord } from "@/hooks/use-bancos";
import type { ClientRecord } from "@/hooks/use-clients";
import type { FinanceiroRecord, FinanceiroTipo } from "@/hooks/use-financeiro";

const BOM = "﻿";

const tipoLabels: Record<FinanceiroTipo, string> = { gasto: "Gasto", gasto_fixo: "Gasto fixo", ganho: "Ganho" };

function csvEscape(value: string) {
  return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

function formatValor(record: FinanceiroRecord) {
  const sinal = record.tipo === "ganho" ? "" : "-";
  return `${sinal}${record.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Exporta lançamentos como CSV separado por ";" (padrão do Excel em pt-BR), com BOM para acentos. */
export function exportFinanceiroToCsv(records: FinanceiroRecord[], clients: ClientRecord[], bancos: BancoRecord[], filename = "extrato.csv") {
  const header = ["Data", "Tipo", "Descrição", "Cliente", "Banco", "Valor"];
  const rows = records.map((record) => {
    const client = clients.find((candidate) => candidate.id === record.cliente_id);
    const banco = bancos.find((candidate) => candidate.id === record.banco_id);
    return [formatDate(record.data), tipoLabels[record.tipo], record.descricao ?? "", client?.name ?? "", banco?.nome ?? "", formatValor(record)];
  });

  const csvContent = BOM + [header, ...rows].map((row) => row.map(csvEscape).join(";")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
