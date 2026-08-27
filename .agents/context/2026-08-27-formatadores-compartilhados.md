# Formatadores de moeda e data compartilhados

## Resumo

`formatCurrency` estava copiado byte a byte em 5 arquivos e `formatDate` em outros 5. Como as features de saldo e de cronômetro adicionam mais chamadas, os helpers foram extraídos pra `lib/` antes.

## Arquivos alterados

- `lib/format-currency.ts` (novo) — `formatCurrency(value)`.
- `lib/format-date.ts` (novo) — `formatDate(date)`, `formatDateLong(date)`, `formatTimestamp(timestamp)`.
- Cópias locais removidas em: `app/dashboard/financeiro/page.tsx`, `_components/financeiro-grupos.tsx`, `_components/financeiro-grupo-dialog.tsx`, `_components/gastos-fixos-dialog.tsx`, `_components/import-ofx-dialog.tsx`, `app/dashboard/clients/page.tsx`, `lib/financeiro-csv.ts`, `app/dashboard/tasks/_components/task-card.tsx`.

## Decisões

- **`formatDate` e `formatTimestamp` são funções separadas, não uma só.** `formatDate` recebe `"YYYY-MM-DD"` e anexa `T00:00:00` — obrigatório, porque sem isso o JS lê a string como UTC e em fuso negativo a data volta um dia. Já `clients/page.tsx` formata `created_at`, que é um `timestamptz` completo: anexar `T00:00:00` ali produziria `Invalid Date`. Eram duas funções diferentes com o mesmo nome em arquivos diferentes; agora os nomes dizem qual é qual.
- `formatDateLong` é o antigo `formatDueDate` do card de tarefa (variante `dateStyle: "medium"`), movido sem mudança de comportamento.
- `lib/financeiro-csv.ts` não é `"use client"` e continua não sendo — `Intl` funciona nos dois lados.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. Refactor puramente mecânico, sem mudança de comportamento visível.

## Pendências

- Nenhuma.
