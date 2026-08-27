# Saldo acumulado e quebra por banco

## Resumo

O financeiro só sabia somar o período filtrado. Agora tem um card de **saldo até o momento** (ganhos, saídas e o saldo resultante, acumulados desde o início até hoje, somando todos os bancos), e clicar nele abre um modal com a quebra por banco: ganhos, saídas e saldo de cada banco cadastrado, mais o balde "Sem banco" pros lançamentos sem banco atribuído, e o total geral.

## Arquivos alterados

- `hooks/use-financeiro-saldo.ts` (novo) — chama a RPC de totais.
- `app/dashboard/financeiro/_components/financeiro-saldo-card.tsx` (novo) — o card clicável + helpers `resumirLinhas` / `agruparPorBanco` exportados.
- `app/dashboard/financeiro/_components/financeiro-saldo-dialog.tsx` (novo) — o modal de quebra por banco.
- `app/dashboard/financeiro/page.tsx` — grid do topo, wrappers de refresh, montagem do modal.

## SQL (rodar no Supabase)

**Pré-requisito:** esta feature depende do bloco pendente de `bancos` + `financeiro.banco_id` ([2026-08-26-financeiro-bancos.md](2026-08-26-financeiro-bancos.md)). Sem ele a RPC nem compila (não existe a coluna `banco_id`).

Antes de aplicar, vale conferir o que já existe:

```sql
select policyname, tablename from pg_policies where tablename in ('financeiro_grupos','bancos');
select proname from pg_proc where pronamespace = 'public'::regnamespace;
```

Depois:

```sql
create index if not exists financeiro_user_banco_tipo_idx
  on public.financeiro (user_id, banco_id, tipo);

drop function if exists public.financeiro_totais_por_banco();

create function public.financeiro_totais_por_banco()
returns table (banco_id uuid, tipo text, total numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select f.banco_id, f.tipo::text, sum(f.valor)::numeric
  from public.financeiro f
  where f.user_id = auth.uid()
    and f.data <= (now() at time zone 'America/Sao_Paulo')::date
  group by f.banco_id, f.tipo;
$$;

grant execute on function public.financeiro_totais_por_banco() to authenticated;
```

## Decisões

- **RPC em vez de buscar tudo no cliente.** `useFinanceiro` não serve: ele busca com `.gte("data", start).lte("data", end)` e sua dep é `[periodFilter]`, então `allRecords` é estruturalmente incapaz de guardar histórico — e alargá-lo quebraria a página inteira, porque tabela, grupos, seleção e CSV são todos construídos em cima de "allRecords = a fatia do período". Uma segunda query sem limite também está errada: **o PostgREST corta a resposta em 1000 linhas por padrão**, então quem importa OFX todo mês bate nisso dentro de um ano e o saldo passa a mentir em silêncio — o pior modo de falha possível pra um número de dinheiro. A RPC agrupa no banco e devolve no máximo `(nº bancos + 1) × 3` linhas, pra sempre.
- **`security invoker`, não `definer`.** A RLS de `financeiro` já restringe ao dono; invoker garante que a função não vaze linhas de outro usuário nem se o `where` for editado depois. O `where user_id = auth.uid()` explícito fica como cinto e suspensório, e ajuda o planner a usar o índice.
- **`f.data <= hoje`** implementa a decisão de escopo: um lançamento agendado pro futuro não derruba o saldo de hoje. O corte usa o fuso de São Paulo, não UTC.
- **Sem filtro de `banco_id` na query.** Linhas com `banco_id is null` voltam naturalmente como grupo `null`, que já *é* o balde "sem banco" — nenhum caso especial no SQL.
- **`sum` chega como string.** `numeric` do Postgres é serializado como string pelo supabase-js, por isso o `Number(linha.total)` no hook. Sem isso, `+` concatenaria em vez de somar.
- **Helpers puros exportados do card**, como já era feito em `financeiro-grupos.tsx` — o modal importa `resumirLinhas`/`agruparPorBanco` e recalcula, em vez de receber tudo pronto por prop e duplicar a regra.
- **Saídas juntam `gasto` e `gasto_fixo`.** `valor` é sempre positivo no banco; o sinal vem só do `tipo`, mesma regra do saldo do período e dos cards de palavra-chave.
- **Bancos cadastrados aparecem no modal mesmo com zero lançamento** (foto completa), mas o balde "Sem banco" só aparece se tiver algo dentro.
- **O card existente foi relabelado.** Com dois saldos lado a lado, "Saldo do período filtrado" vs "Saldo até o momento · todos os bancos" é o que evita confusão; o novo ganhou o fundo destacado (`bg-muted`) e o antigo passou a `bg-background`.
- **Refresh após escrita, sem `await`.** A RPC fica velha a cada lançamento criado/importado/excluído, então `createRecord`, `importRecords`, `deleteRecord` e o bulk delete foram envolvidos em wrappers que disparam `refreshSaldo()`. O refresh não é aguardado de propósito: o toast da operação não deve esperar um segundo round trip.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. **Não testado contra o banco**: o SQL acima ainda não foi rodado e a sessão do preview estava deslogada.

## Pendências

- Rodar o bloco pendente de `bancos`/`banco_id` e depois o SQL acima.
- Verificar o card contra uma soma manual, e criar um lançamento com data futura pra confirmar que ele *não* entra no saldo.
- **A conferir no dashboard:** o tipo da coluna `financeiro.valor`. Se for `double precision` em vez de `numeric`, a soma acumula erro de ponto flutuante ao longo de milhares de linhas — seria um bug pré-existente que a RPC apenas torna visível.
