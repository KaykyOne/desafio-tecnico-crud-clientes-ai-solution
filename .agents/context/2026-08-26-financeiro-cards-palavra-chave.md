# Cards de agrupamento por palavra-chave no financeiro

## Resumo

No extrato financeiro, o usuário pode criar "cards" que agrupam automaticamente todo lançamento cuja descrição contenha uma palavra-chave (ex.: criar o card "pizza" soma todo lançamento com "pizza" na descrição, tipo "Pizzaria X" ou "Pizza Hut", sem diferenciar maiúsculas/minúsculas). Cada card mostra a soma líquida (ganhos - gastos) e a contagem de lançamentos, escopados ao período filtrado na tela. Os cards ficam salvos no banco, atrelados ao usuário.

## Arquivos alterados

- `hooks/use-financeiro-grupos.ts` (novo)
- `app/dashboard/financeiro/_components/financeiro-grupos.tsx` (novo)
- `hooks/use-financeiro.ts` (refatorado — ver decisão abaixo)
- `app/dashboard/financeiro/page.tsx` (integra os cards)

## SQL (rodar no Supabase)

```sql
create table public.financeiro_grupos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  termo text not null check (char_length(trim(termo)) > 0),
  created_at timestamptz not null default now()
);

create index financeiro_grupos_user_id_idx on public.financeiro_grupos (user_id);

alter table public.financeiro_grupos enable row level security;
alter table public.financeiro_grupos force row level security;
create policy "Financeiro grupos are viewable by owner" on public.financeiro_grupos for select to authenticated using (user_id = auth.uid());
create policy "Financeiro grupos are insertable by owner" on public.financeiro_grupos for insert to authenticated with check (user_id = auth.uid());
create policy "Financeiro grupos are deletable by owner" on public.financeiro_grupos for delete to authenticated using (user_id = auth.uid());
```

Sem policy de `update` — renomear não foi pedido; pra trocar a palavra-chave hoje é apagar e criar de novo.

## Alterações

- `computeGrupoTotal` (dentro de `financeiro-grupos.tsx`): filtra os lançamentos com `descricao?.toLowerCase().includes(termo.toLowerCase())` e soma ganho - gasto/gasto_fixo, exatamente o `include` do JS que foi pedido.
- **Refatorado `hooks/use-financeiro.ts`**: antes, o filtro por tipo (`gasto`/`ganho`/`gasto_fixo`) ia direto pra query do Supabase, então a lista `records` já vinha sem os outros tipos. Isso quebraria os cards de palavra-chave: se o usuário estivesse com o filtro em "Gasto", o card "pizza" só somaria os gastos, escondendo um eventual ganho relacionado. Troquei pra buscar todos os tipos do período (`allRecords`) e filtrar por tipo no cliente via `useMemo` — `records` (usado na tabela) continua igual pra quem já usava o hook, mas agora existe `allRecords` (todos os tipos do período) que os cards usam. Efeito colateral bom: trocar o filtro de tipo não dispara mais uma nova consulta ao Supabase, só refiltra em memória.
- `FinanceiroGrupos`: grid de cards + um card-formulário no final pra adicionar um novo (input + botão), e um botão "×" que aparece no hover pra remover.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. Testado no dev server: a tela carrega normalmente mesmo sem a tabela existir ainda no Supabase (erro tratado com toast, sem quebrar a página), o formulário de adicionar card aparece corretamente. Não deu pra testar criação/soma de verdade contra o banco porque a tabela ainda não existe — mesma situação de toda feature nova de tabela nesse projeto (Agenda, Financeiro em si etc.).

## Pendências

- Rodar o SQL acima no Supabase antes de usar a feature de verdade.
