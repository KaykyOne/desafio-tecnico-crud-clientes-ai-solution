# Aba Financeiro (gastos fixos, extrato e importação de OFX)

## Resumo

Nova seção `/dashboard/financeiro`: extrato de gastos/gastos fixos/ganhos com filtro por tipo, cadastro/exclusão manual, gestão de gastos fixos recorrentes e importação de extrato bancário `.ofx` com revisão agrupada antes de importar.

## Arquivos alterados

- `hooks/use-financeiro.ts` (novo)
- `hooks/use-gastos-fixos.ts` (novo)
- `lib/ofx.ts` (novo)
- `app/dashboard/financeiro/page.tsx` (novo)
- `app/dashboard/financeiro/_components/financeiro-form-dialog.tsx` (novo)
- `app/dashboard/financeiro/_components/delete-financeiro-dialog.tsx` (novo)
- `app/dashboard/financeiro/_components/gastos-fixos-dialog.tsx` (novo)
- `app/dashboard/financeiro/_components/import-ofx-dialog.tsx` (novo)
- `app/dashboard/financeiro/_components/financeiro-skeleton.tsx` (novo)
- `app/dashboard/_components/dashboard-sidebar.tsx` (nova entrada "Financeiro" na navegação)
- `package.json` (nova dependência `ofx-js`)

## Alterações

- Duas tabelas novas no Supabase (SQL entregue ao usuário, não versionado no repo): `gastos_fixos` (descrição, valor, dia de cobrança 1-31, data início/fim opcional, ativo) e `financeiro` (data, `tipo` como enum nativo `gasto`/`gasto_fixo`/`ganho`, valor, descrição opcional, `cliente_id` opcional, `gasto_fixo_id` opcional, `fitid` opcional único por usuário).
- Geração mensal automática via `pg_cron` rodando **dentro do Postgres** (`public.gerar_lancamentos_gastos_fixos()`, agendada diariamente) — necessário porque o app é `output: "export"` (estático), sem API route/server action que pudesse rodar isso no lado do app.
- `tipo = 'gasto_fixo'` só é atribuído pelo cron; cadastro manual e importação de OFX só oferecem `gasto`/`ganho`.
- `financeiro` não tem policy de `update` no banco (só select/insert/delete) — extrato não se edita.
- Importação de OFX usa `ofx-js` (parsing 100% client-side, sem dependência de Node), agrupa transações por descrição+valor parecidos para revisão em lote, e usa `fitid` com `upsert(..., { onConflict: "user_id,fitid", ignoreDuplicates: true })` para não duplicar ao reimportar o mesmo extrato.

## Decisões

- `gasto_fixo_id`/`cliente_id` em `financeiro` usam `on delete set null` — apagar um gasto fixo ou cliente não apaga o histórico do extrato.
- Apagar um lançamento `gasto_fixo` do mês não impede a geração do mês seguinte (o cron confere existência por mês via `gasto_fixo_id` + `date_trunc('month', data)`, não por uma flag "já gerado para sempre").
- Agrupamento na importação de OFX não funde valores: cada transação do extrato ainda vira uma linha própria em `financeiro`; o grupo só serve para revisar (tipo/cliente) uma vez em vez de item por item.

## Estado atual

Código compila limpo (`tsc --noEmit` e `npm run lint` sem erros) e o Turbopack builda a rota `/dashboard/financeiro` sem erro. **Ainda não testado ponta a ponta com dados reais**: o SQL (tabelas, RLS, função e `cron.schedule`) precisa ser rodado no Supabase pelo usuário antes de qualquer teste funcional — não há acesso a essa instância do Supabase a partir daqui. Plano completo com o SQL fica em `C:\Users\kayky\.claude\plans\planeja-essa-implementa-o-quero-fuzzy-scone.md`.

## Pendências

- Rodar o SQL no Supabase (tabelas `gastos_fixos`/`financeiro`, enum `financeiro_tipo`, RLS, `pg_cron`).
- Testar ponta a ponta com login real: criar/excluir lançamento, criar gasto fixo e disparar `select public.gerar_lancamentos_gastos_fixos();` manualmente, importar um `.ofx` de teste.
