# Cronômetro de execução de tarefas

## Resumo

Cada card do Kanban ganhou um botão de play: iniciar marca a tarefa como em execução, e finalizar grava quanto tempo levou. O tempo registrado aparece no próprio card (separado da estimativa) e é somado em três cards no topo da página: trabalhado hoje, nesta semana e neste mês. Só um cronômetro roda por vez.

## Arquivos alterados

- `hooks/use-task-timer.ts` (novo) — estado do cronômetro, totais e as operações.
- `lib/format-duration.ts` (novo) — `formatDuration`, `formatStopwatch`, `secondsSince`.
- `app/dashboard/tasks/_components/task-timer-display.tsx` (novo) — o número que tica.
- `app/dashboard/tasks/_components/task-time-summary.tsx` (novo) — os três cards de total.
- `app/dashboard/tasks/page.tsx`, `_components/task-card.tsx`, `_components/kanban-board.tsx`, `_components/task-quick-edit-sheet.tsx`, `_components/delete-task-dialog.tsx`, `_components/task-form-dialog.tsx` (só o rótulo).

`hooks/use-tasks.ts` e `hooks/use-task-columns.ts` ficaram intocados.

## Precisa de websocket? Não.

Foi a pergunta que originou a feature, então fica registrada. Websocket serve pra *empurrar mudança pra um cliente conectado*. Um cronômetro não é dado que muda — é **um timestamp** mais aritmética contra o relógio atual:

1. Iniciar insere uma linha com `started_at = now()` avaliado pelo **Postgres**.
2. Enquanto roda, o navegador desenha o tempo com `setInterval` de 1s, puramente visual — nada trafega por tick, e cada tick **recalcula** `Date.now() - started_at`.
3. Finalizar grava `ended_at = now()` (servidor de novo) e o Postgres calcula as durações na leitura.

A consequência que importa: **o cronômetro sobrevive a refresh, fechar a aba, travar o navegador e trocar de dispositivo**, porque o decorrido é derivado de um timestamp guardado, não acumulado por uma conexão viva. Um cronômetro por websocket seria estritamente pior — pararia de contar assim que a conexão caísse.

Dois efeitos colaterais bons: o navegador estrangula `setInterval` em aba de fundo, mas como cada tick recalcula em vez de incrementar, isso só reduz a taxa de atualização e o número volta certo no tick seguinte; e se o relógio da máquina estiver errado, só o número *exibido* erra — todo valor persistido vem do `now()` do Postgres nas duas pontas.

**Supabase Realtime (que é websocket) foi descartado na v1.** Ele só sincronizaria um cronômetro rodando entre várias abas/dispositivos abertos ao mesmo tempo. Seria o primeiro uso de Realtime no repo (nova superfície de falha), exigiria `setAuth()` no refresh de token senão o canal morre calado, e exigiria publicar a tabela no dashboard — mais uma migration manual. O que se perde: com duas abas abertas, a aba B mostra estado velho até recarregar. Mitigado por (a) o índice único parcial, que torna **impossível** criar um segundo cronômetro — os dados nunca corrompem, só a *visão* fica velha; e (b) o refetch no `visibilitychange`, que resincroniza exatamente quando o usuário volta pra aba. Adicionar Realtime depois é aditivo e mexe só em `use-task-timer.ts`.

## SQL (rodar no Supabase)

```sql
create table if not exists public.task_time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint task_time_entries_periodo_valido check (ended_at is null or ended_at >= started_at)
);

create index if not exists task_time_entries_user_started_idx on public.task_time_entries (user_id, started_at desc);
create index if not exists task_time_entries_task_idx on public.task_time_entries (task_id);

-- Só UM cronômetro rodando por usuário
create unique index if not exists task_time_entries_um_ativo_idx
  on public.task_time_entries (user_id) where ended_at is null;

alter table public.task_time_entries enable row level security;
alter table public.task_time_entries force row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='task_time_entries' and policyname='Task time entries are viewable by owner') then
    create policy "Task time entries are viewable by owner" on public.task_time_entries for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='task_time_entries' and policyname='Task time entries are insertable by owner') then
    create policy "Task time entries are insertable by owner" on public.task_time_entries for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='task_time_entries' and policyname='Task time entries are updatable by owner') then
    create policy "Task time entries are updatable by owner" on public.task_time_entries for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='task_time_entries' and policyname='Task time entries are deletable by owner') then
    create policy "Task time entries are deletable by owner" on public.task_time_entries for delete to authenticated using (user_id = auth.uid());
  end if;
end $$;

-- Finalizar sempre pelo servidor (ver Decisões)
drop function if exists public.task_time_finalizar();

create function public.task_time_finalizar()
returns public.task_time_entries
language sql volatile security invoker set search_path = ''
as $$
  update public.task_time_entries set ended_at = now()
  where user_id = auth.uid() and ended_at is null
  returning *;
$$;

grant execute on function public.task_time_finalizar() to authenticated;

-- Totais dia / semana (domingo) / mês, no fuso local
drop function if exists public.task_time_totais(text);

create function public.task_time_totais(p_timezone text default 'America/Sao_Paulo')
returns table (hoje_segundos bigint, semana_segundos bigint, mes_segundos bigint)
language sql stable security invoker set search_path = ''
as $$
  with entradas as (
    select ((e.started_at at time zone p_timezone))::date as dia_local,
           extract(epoch from (coalesce(e.ended_at, now()) - e.started_at))::bigint as segundos
    from public.task_time_entries e
    where e.user_id = auth.uid()
  ),
  ref as (select ((now() at time zone p_timezone))::date as hoje)
  select
    coalesce(sum(segundos) filter (where dia_local = (select hoje from ref)), 0)::bigint,
    -- Semana começa DOMINGO: extract(dow) devolve 0=domingo, então subtrair dow dá o domingo daquela semana
    coalesce(sum(segundos) filter (
      where dia_local - (extract(dow from dia_local)::int) * interval '1 day'
          = (select hoje from ref) - (extract(dow from (select hoje from ref))::int) * interval '1 day'
    ), 0)::bigint,
    coalesce(sum(segundos) filter (where date_trunc('month', dia_local) = date_trunc('month', (select hoje from ref))), 0)::bigint
  from entradas;
$$;

grant execute on function public.task_time_totais(text) to authenticated;

-- Tempo por tarefa (pro card)
drop function if exists public.task_time_por_tarefa();

create function public.task_time_por_tarefa()
returns table (task_id uuid, segundos bigint, entradas integer)
language sql stable security invoker set search_path = ''
as $$
  select e.task_id,
         coalesce(sum(extract(epoch from (coalesce(e.ended_at, now()) - e.started_at))), 0)::bigint,
         count(*)::integer
  from public.task_time_entries e
  where e.user_id = auth.uid()
  group by e.task_id;
$$;

grant execute on function public.task_time_por_tarefa() to authenticated;
```

## Decisões

- **Índice único parcial (`where ended_at is null`) é o ponto central.** Torna impossível, no nível do banco, dois cronômetros rodando ao mesmo tempo — então o cliente nunca precisa arbitrar e o total de horas nunca conta em dobro. Sem ele o agregado ficaria silenciosamente errado e ninguém perceberia. Na prática ele quase nunca dispara, porque `startTimer` finaliza o anterior antes; um `23505` é tratado como sinal de *corrida entre abas* (toast + refetch), não como caminho normal.
- **Finalizar passa por RPC, iniciar não.** Assimetria proposital: `started_at` já tem `default now()`, então um insert que simplesmente omite a coluna ganha o relógio do servidor de graça. Já parar pelo cliente usaria o relógio do *navegador* — se estiver atrasado pra antes do `started_at`, o check constraint rejeita com erro opaco; se adiantado, a duração fica errada em silêncio.
- **Duração calculada na leitura, não em coluna gerada.** `generated always as (extract(epoch from …)) stored` exige expressão `IMMUTABLE`, e a volatilidade do `extract` mudou entre versões do Postgres — receber `generation expression is not immutable` no meio de uma migration rodada à mão não vale o risco. Além disso a coluna seria `null` pra toda entrada rodando, que é justamente o caso que interessa ao vivo. As RPCs já calculam com `coalesce(ended_at, now())` sem custo.
- **Fuso convertido antes de truncar.** `started_at` é `timestamptz`, guardado em UTC; `date_trunc('day', started_at)` agruparia em UTC e tudo que se trabalha depois das 21h cairia no balde de *amanhã*. Não é arredondamento, é "meu trabalho da noite sumiu de hoje".
- **Semana começa domingo**, seguindo o calendário brasileiro — daí o `extract(dow)` explícito em vez do `date_trunc('week')`, que é ISO/segunda-feira.
- **Entrada que cruza a meia-noite conta inteira no dia em que começou.** É como se fala de uma virada de noite, e evita uma query de `generate_series` fatiando dias.
- **`TaskTimerDisplay` é componente folha, com o intervalo próprio.** Se o contador morasse no `useTaskTimer` (montado no nível da página), um setState por segundo re-renderizaria o quadro inteiro — inclusive no meio de um arrasto, brigando com a contabilidade de transform do dnd-kit. Não precisa de intervalo compartilhado porque a restrição de um cronômetro só garante no máximo um display montado. Ele é usado com `key={startedAt}` pra remontar num cronômetro novo, o que mantém o estado inicial correto sem sincronizar via efeito.
- **`average_duration_minutes` continua intocado.** É a estimativa do usuário, e o valor inteiro da feature é comparar estimado vs. real — sobrescrever destruiria a comparação e reescreveria em silêncio o que a pessoa digitou. Só o rótulo do formulário mudou pra "Tempo estimado (minutos)", e o card mostra "Est.: 45 min" e "Real: 1h 12min" separados.
- **`on delete cascade` no `task_id`**, porque uma entrada de tempo sem tarefa é insignificante — não dá pra renderizar nem rotular. O custo (excluir uma tarefa reduz retroativamente o total do mês) é avisado no diálogo de exclusão quando há tempo registrado.
- **Linha de ações forçada a ficar visível com cronômetro rodando** (`isRunning && "sm:opacity-100"`): ela é `sm:opacity-0` com hover, então sem isso, no desktop, não haveria como parar um cronômetro sem passar o mouse por cima.
- **"Descartar cronômetro"** no Sheet existe porque "Finalizar" não resolve o caso de esquecer rodando o fim de semana — finalizar *salvaria* as 60 horas.
- **Card em execução fica azul**, ignorando a cor da prioridade, pra identificar de longe o que está rodando. Como o azul é fundo escuro com texto branco, os detalhes (badge, texto secundário, divisória) reaproveitam as variantes da prioridade `low`, que já foram feitas pra esse contraste — daí o `detailPriority` no componente.
- **Os três cards de total ticam ao vivo enquanto há cronômetro rodando**, e mostram `HH:MM:SS` em vez de "1h 12min" nesse estado. Detalhe que importa: a RPC **já embute** o tempo do cronômetro em curso (via `coalesce(ended_at, now())`), então somar o decorrido inteiro contaria o mesmo tempo duas vezes. O hook expõe `totaisAtualizadosEm` — o momento em que os totais eram exatos — e a UI soma só o que passou daí pra frente. Esse baseline é redefinido em dois momentos: quando os totais são relidos do servidor, e quando um cronômetro novo começa (aí ele tem zero decorrido, então os totais estão exatos).
- O tick mora dentro do `TaskTimeSummary` (não no hook) pela mesma razão do `TaskTimerDisplay`: senão a página inteira re-renderizaria a cada segundo. E o baseline é guardado junto do valor no estado, pra que uma troca de baseline não exiba por um instante a sobra do ciclo anterior.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. **Nada foi testado contra o banco**: o SQL acima ainda não foi rodado e a sessão do preview estava deslogada.

## Pendências

- Rodar o SQL acima no Supabase.
- Testar: iniciar um cronômetro e **recarregar a página** confirmando que ele continua contando do ponto certo (é a prova de que o desenho sem websocket funciona); iniciar um segundo e ver o primeiro finalizar sozinho; conferir o total de "hoje" após finalizar.
- **Comportamento a saber:** `coalesce(ended_at, now())` faz um cronômetro esquecido inflar o total de hoje *ao vivo*, antes mesmo de ser finalizado.
