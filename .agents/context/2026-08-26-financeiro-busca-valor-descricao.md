# Busca por valor aproximado e descrição no extrato

## Resumo

O extrato financeiro ganhou dois campos de busca acima da tabela: um por descrição (ignora acento e maiúscula/minúscula) e um por valor aproximado (±10%). Os dois filtram a tabela, o saldo, a seleção em lote e a exportação juntos — e funcionam em conjunto (é um "E", não "OU").

## Arquivos alterados

- `lib/normalize-text.ts` (novo — normalização compartilhada)
- `app/dashboard/financeiro/page.tsx` (os dois campos de busca + `filteredRecords`)
- `app/dashboard/financeiro/_components/financeiro-grupos.tsx` (passou a usar `normalizeText` também, no lugar do `.toLowerCase()` que já tinha)

## Alterações

- `normalizeText(value)`: `NFD` + remove os diacríticos (intervalo Unicode `̀`-`ͯ`, marcas de acentuação combinantes) + minúsculas + trim. Testado manualmente via Node: `"Pizzaría São Paulo ÀÉÎÕÜ ção"` vira `"pizzaria sao paulo aeiou cao"`.
- `parseValorBusca(value)`: extrai o número de qualquer coisa digitada tipo `"50"`, `"50 reais"` ou `"R$ 50,00"` (remove tudo que não é dígito/vírgula/ponto, troca vírgula por ponto).
- `filteredRecords` (`useMemo` em `page.tsx`): aplica os dois filtros em cima de `records` (que já vem filtrado por período e tipo do hook) — descrição via `normalizeText(...).includes(...)`, valor via `record.valor >= alvo*0.9 && record.valor <= alvo*1.1`. Essa lista substitui `records` em tudo que já existia na tela: tabela, saldo, seleção em lote, exportação.
- Os cards de palavra-chave (`FinanceiroGrupos`) continuam usando `allRecords` (todos os tipos do período) direto do hook, sem passar pelos novos campos de busca — são dois mecanismos de agrupamento independentes, um pra criar cards fixos, outro pra busca pontual na lista.

## Decisões

- Filtro é 100% client-side (`useMemo` sobre o array já carregado), sem round-trip ao Supabase — o volume de lançamentos por período de um freelancer é pequeno, e a lógica (fuzzy por %, normalização de acento) não é trivial de expressar direto numa query.
- `normalizeText` virou um helper compartilhado (`lib/normalize-text.ts`) e também substituiu a normalização mais simples (só `.toLowerCase()`) que já existia nos cards de palavra-chave — sem isso, o card "pizzaria" não bateria com "Pizzaría" acentuado, inconsistente com o que foi pedido agora pra busca da lista.
- Fronteira do ±10% é inclusiva (`>=`/`<=`): buscar "50" pega de 45,00 até 55,00 exatamente.

## Estado atual

Testado ponta a ponta contra o Supabase real: cadastrei três lançamentos ("Pizzaría São Paulo" R$50, "Aluguel" R$45, "Internet" R$30). Buscar `pizzaria` (sem acento) achou só a pizzaria; buscar `50 reais` achou pizzaria (R$50) e aluguel (R$45, na borda dos 10%) e excluiu a internet (R$30); combinar `PIZZA` + `50` juntos (maiúsculo, sem acento) resultou só na pizzaria, confirmando que os dois filtros se combinam com E. `tsc --noEmit` e `npm run lint` limpos. Dados de teste apagados ao final.

## Pendências

- Nenhuma.
