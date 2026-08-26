# Bancos no financeiro

## Resumo

Cada lançamento do financeiro (manual ou importado via OFX) pode agora ser anexado a um **banco**. Os bancos são cadastrados por usuário numa tela própria ("Bancos", botão novo no topo do Financeiro): o usuário escolhe um dos 30 bancos brasileiros mais usados (combobox com valor pré-codificado, código COMPE) ou digita o nome se não estiver na lista. Esses bancos cadastrados aparecem depois como opção (opcional) tanto no formulário de novo lançamento quanto na importação de OFX — nesse último caso, é uma escolha única pra todo o arquivo importado ("Esses dados são de qual banco?"), podendo deixar sem banco.

## Arquivos alterados

- `lib/bancos-brasileiros.ts` (novo) — lista fixa dos 30 bancos mais usados no Brasil, `{ codigo, nome }`, ordenada alfabeticamente.
- `hooks/use-bancos.ts` (novo) — CRUD (`bancos`, `createBanco`, `deleteBanco`) na tabela `bancos`, mesmo padrão dos outros hooks do projeto (`getAuthenticatedUserId`/`getSupabaseErrorMessage`/toasts).
- `app/dashboard/financeiro/_components/bancos-dialog.tsx` (novo) — tela de cadastro/gestão: select com os 30 bancos + input de nome customizado (usa o customizado se preenchido, senão o selecionado), lista dos bancos já cadastrados com botão de excluir.
- `hooks/use-financeiro.ts` — `FinanceiroRecord`/`FinanceiroInput` ganharam `banco_id: string | null`; incluído no `SELECT_COLUMNS`.
- `app/dashboard/financeiro/_components/financeiro-form-dialog.tsx` — novo select "Banco (opcional)" ao lado do de Cliente.
- `app/dashboard/financeiro/_components/import-ofx-dialog.tsx` — novo select "Esses dados são de qual banco? (opcional)" acima do resumo de ganhos/saídas, aplicado a todas as transações do arquivo importado.
- `app/dashboard/financeiro/page.tsx` — hook `useBancos`, botão "Bancos" no cabeçalho, coluna "Banco" na tabela do extrato, `bancos` passado pros dois dialogs.
- `lib/financeiro-csv.ts` — coluna "Banco" adicionada na exportação CSV.

## SQL (rodar no Supabase)

```sql
create table public.bancos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (char_length(trim(nome)) > 0),
  created_at timestamptz not null default now(),
  unique (user_id, nome)
);

create index bancos_user_id_idx on public.bancos (user_id);

alter table public.bancos enable row level security;
alter table public.bancos force row level security;
create policy "Bancos are viewable by owner" on public.bancos for select to authenticated using (user_id = auth.uid());
create policy "Bancos are insertable by owner" on public.bancos for insert to authenticated with check (user_id = auth.uid());
create policy "Bancos are deletable by owner" on public.bancos for delete to authenticated using (user_id = auth.uid());

alter table public.financeiro add column banco_id uuid references public.bancos (id) on delete set null;
```

Sem policy de `update` em `bancos` — mesmo padrão de `financeiro_grupos`, pra renomear hoje precisa apagar e cadastrar de novo (e os lançamentos que apontavam pra ele ficam com `banco_id` nulo pelo `on delete set null`, não voltam a "sem banco" silenciosamente errado).

## Decisões

- `banco_id` é FK opcional pra `bancos`, resolvida no cliente contra a lista carregada por `useBancos()` — mesmo padrão já usado pra `cliente_id`/`clients` nessa página, em vez de fazer join embutido no Supabase.
- Na importação de OFX, o banco é escolhido **uma vez pro arquivo inteiro**, não por transação/grupo — um extrato OFX é de um banco só, não faz sentido pedir por grupo.
- `unique (user_id, nome)` evita cadastrar o mesmo banco duas vezes; a tela mostra um toast de erro amigável nesse caso (mesmo tratamento de `fitid` duplicado no financeiro).
- Lista dos 30 bancos é só uma conveniência de UI pra pré-preencher o cadastro — o que fica salvo em `bancos` é sempre só o nome (o código COMPE não é persistido, só usado como `value` único de cada item do select).

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. Testado no dev server: tela de Bancos abre, combobox lista os 30 bancos, campo de nome customizado funciona, formulário de lançamento e diálogo de importação OFX mostram o select de banco. Não deu pra testar cadastro/seleção de verdade contra o Supabase porque a tabela `bancos` ainda não existe — mesma situação de toda feature nova de tabela nesse projeto.

## Pendências

- Rodar o SQL acima no Supabase antes de usar a feature de verdade.
