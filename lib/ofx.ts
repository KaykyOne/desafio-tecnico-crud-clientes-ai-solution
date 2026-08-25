import { parseStrict, type ofxTypes } from "ofx-js";

export type OfxTransaction = {
  fitid: string | null;
  data: string;
  valor: number;
  descricao: string;
  tipoSugerido: "gasto" | "ganho";
};

export type OfxGroup = {
  key: string;
  descricao: string;
  valor: number;
  tipoSugerido: "gasto" | "ganho";
  transactions: OfxTransaction[];
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function parseOfxDate(dtposted: string) {
  const year = dtposted.slice(0, 4);
  const month = dtposted.slice(4, 6);
  const day = dtposted.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function normalizeTransaction(transaction: ofxTypes.StatementTransaction): OfxTransaction {
  const valor = Number.parseFloat(transaction.TRNAMT);
  const descricao = (transaction.NAME || transaction.MEMO || "Transação sem descrição").trim();

  return {
    fitid: transaction.FITID || null,
    data: parseOfxDate(transaction.DTPOSTED),
    valor: Math.abs(valor),
    descricao,
    tipoSugerido: valor < 0 ? "gasto" : "ganho",
  };
}

function groupingKey(transaction: OfxTransaction) {
  return `${transaction.descricao.trim().toLowerCase()}::${transaction.valor.toFixed(2)}`;
}

/** Lê um arquivo .ofx/.qfx e devolve as transações agrupadas por descrição+valor parecidos. */
export async function parseOfxFile(file: File): Promise<OfxGroup[]> {
  const text = await file.text();
  const parsed = parseStrict(text);

  const statementResponses = asArray(parsed.OFX.BANKMSGSRSV1?.STMTTRNRS);
  const rawTransactions = statementResponses.flatMap((response) => asArray(response.STMTRS?.BANKTRANLIST?.STMTTRN));

  if (rawTransactions.length === 0) {
    throw new Error("Nenhuma transação encontrada nesse arquivo OFX.");
  }

  const transactions = rawTransactions.map(normalizeTransaction);
  const groups = new Map<string, OfxGroup>();

  for (const transaction of transactions) {
    const key = groupingKey(transaction);
    const existing = groups.get(key);

    if (existing) {
      existing.transactions.push(transaction);
    } else {
      groups.set(key, {
        key,
        descricao: transaction.descricao,
        valor: transaction.valor,
        tipoSugerido: transaction.tipoSugerido,
        transactions: [transaction],
      });
    }
  }

  return [...groups.values()].sort((a, b) => b.transactions.length - a.transactions.length);
}
