# Cards de agrupamento com múltiplas palavras-chave, nome e edição

## Resumo

Os cards de agrupamento do financeiro (criados em [2026-08-26-financeiro-cards-palavra-chave.md](2026-08-26-financeiro-cards-palavra-chave.md)) passaram por duas rodadas de revisão nesta sessão até chegar no formato final:

1. Aceitam **várias palavras-chave por card** (ex.: card "Assinaturas" juntando `netflix`, `spotify`, `icloud` — soma todo lançamento que bater com **qualquer uma**, um OR entre os termos).
2. Ganharam **nome** e **edição**: o fluxo de criação virou "escreve a palavra → clica no + → entra numa lista local → repete", em vez de salvar a cada clique. Com mais de uma palavra na lista, aparece um campo pra nomear o card (obrigatório nesse caso); com uma palavra só, ela vira o nome sozinha, sem precisar digitar nada. Clicar num card já existente abre um modal mostrando o total, a lista dos lançamentos que entraram no cálculo, e as palavras-chave editáveis (adicionar/remover) com o total recalculando ao vivo antes de salvar.

Como o SQL original ainda não foi rodado no Supabase com esse formato (a tabela existe hoje só com a coluna antiga `termo` — confirmado via erro real do Supabase durante teste desta feature), o bloco abaixo já é a definição final da tabela, sem precisar de uma segunda migração depois.

## Arquivos alterados

- `hooks/use-financeiro-grupos.ts` — `FinanceiroGrupoRecord` ganhou `nome: string | null`. `createGrupo(termos, nome)` e novo `updateGrupo(id, termos, nome)`, ambos validados por `normalizeGrupoInput` (nome obrigatório só quando `termos.length > 1`).
- `app/dashboard/financeiro/_components/financeiro-grupos.tsx` — formulário de criação reescrito: input + botão "+" só adiciona a palavra numa lista local (chips), pode repetir várias vezes; com mais de uma palavra aparece o campo "Nome do card"; um botão "Criar card" separado é que salva de fato. Os cards do grid agora são clicáveis (abrem o modal de edição) além do "x" de exclusão no hover. `matchGrupoRecords`/`sumGrupoRecords` foram extraídos como funções exportadas (reusadas pelo modal).
- `app/dashboard/financeiro/_components/financeiro-grupo-dialog.tsx` (novo) — modal aberto ao clicar num card: mostra total e lançamentos usados no cálculo (ao vivo, recalculado conforme os termos são editados antes de salvar), chips de palavras-chave editáveis, campo de nome (se >1 palavra), botão "Salvar alterações" (chama `updateGrupo`) e "Excluir card".
- `app/dashboard/financeiro/page.tsx` — passa `updateGrupo` pro componente.

## SQL (rodar no Supabase)

Se a tabela **ainda não existe**:

```sql
create table public.financeiro_grupos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text,
  termos text[] not null check (array_length(termos, 1) > 0),
  created_at timestamptz not null default now()
);

create index financeiro_grupos_user_id_idx on public.financeiro_grupos (user_id);

alter table public.financeiro_grupos enable row level security;
alter table public.financeiro_grupos force row level security;
create policy "Financeiro grupos are viewable by owner" on public.financeiro_grupos for select to authenticated using (user_id = auth.uid());
create policy "Financeiro grupos are insertable by owner" on public.financeiro_grupos for insert to authenticated with check (user_id = auth.uid());
create policy "Financeiro grupos are updatable by owner" on public.financeiro_grupos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Financeiro grupos are deletable by owner" on public.financeiro_grupos for delete to authenticated using (user_id = auth.uid());
```

Se a tabela **antiga (só com a coluna `termo` singular) já existe**, rode esta migração no lugar do CREATE TABLE acima:

```sql
alter table public.financeiro_grupos add column if not exists nome text;
alter table public.financeiro_grupos add column if not exists termos text[];
update public.financeiro_grupos set termos = array[termo] where termos is null and termo is not null;
alter table public.financeiro_grupos alter column termos set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'financeiro_grupos_termos_check'
  ) then
    alter table public.financeiro_grupos add constraint financeiro_grupos_termos_check check (array_length(termos, 1) > 0);
  end if;
end $$;

alter table public.financeiro_grupos drop column if exists termo;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'financeiro_grupos' and policyname = 'Financeiro grupos are updatable by owner'
  ) then
    create policy "Financeiro grupos are updatable by owner" on public.financeiro_grupos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;
```

Esse bloco é idempotente (pode rodar de novo sem quebrar) — foi reescrito depois que a versão anterior (sem os `if not exists`) deu erro `column "termos" already exists`, porque a etapa de migrar `termo` → `termos` já tinha sido rodada numa tentativa anterior, mas `nome` e a policy de `update` ainda não.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. Testado no dev server: chip input, botão "+", campo de nome condicional e submit funcionam; erro gracioso via toast confirmado contra o Supabase real (`Could not find the 'termos' column`). O modal de edição/detalhe não foi testado contra dados reais porque não há lançamentos nem cards persistidos ainda (schema pendente).

## Pendências

- Rodar o SQL acima (bloco de migração, já que a tabela antiga existe) no Supabase antes de usar a feature.
