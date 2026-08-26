# Módulo Agenda (react-big-calendar) + fix do warning do Button

## Resumo

Nova seção `/dashboard/agenda`: calendário de eventos usando `react-big-calendar`, com um reskin completo pra ficar na paleta monocromática do app (light/dark), toolbar customizado com os componentes já existentes, e CRUD de eventos por clique/arraste no calendário. Também corrigido um warning de acessibilidade do `Button` que aparecia em toda a navegação por `Link`.

## Arquivos alterados

- `hooks/use-eventos.ts` (novo)
- `app/dashboard/agenda/page.tsx` (novo)
- `app/dashboard/agenda/_components/evento-form-dialog.tsx` (novo)
- `app/dashboard/agenda/_components/delete-evento-dialog.tsx` (novo)
- `app/dashboard/agenda/_components/calendar-toolbar.tsx` (novo)
- `app/dashboard/agenda/_components/calendar-theme.css` (novo)
- `app/dashboard/agenda/_components/types.ts` (novo)
- `app/dashboard/_components/dashboard-sidebar.tsx` (nova entrada "Agenda")
- `components/ui/button.tsx` (fix do `nativeButton`)
- `package.json` (`react-big-calendar`, `date-fns`, `@types/react-big-calendar`)

## SQL (rodar no Supabase)

```sql
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null check (char_length(trim(titulo)) > 0),
  descricao text,
  local text,
  data_inicio timestamptz not null,
  data_fim timestamptz not null,
  dia_inteiro boolean not null default false,
  cliente_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eventos_periodo_check check (data_fim >= data_inicio)
);

create index eventos_user_id_idx on public.eventos (user_id);
create index eventos_user_data_inicio_idx on public.eventos (user_id, data_inicio);
create index eventos_cliente_id_idx on public.eventos (cliente_id);

create extension if not exists moddatetime;

create trigger set_eventos_updated_at
  before update on public.eventos
  for each row execute function extensions.moddatetime (updated_at);

alter table public.eventos enable row level security;
alter table public.eventos force row level security;
create policy "Eventos are viewable by owner" on public.eventos for select to authenticated using (user_id = auth.uid());
create policy "Eventos are insertable by owner" on public.eventos for insert to authenticated with check (user_id = auth.uid());
create policy "Eventos are updatable by owner" on public.eventos for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Eventos are deletable by owner" on public.eventos for delete to authenticated using (user_id = auth.uid());
```

## Alterações

- `hooks/use-eventos.ts` no mesmo padrão de `clients`/`tasks`/`financeiro`: `fetchEventos`, `createEvento`, `updateEvento`, `deleteEvento`.
- `AgendaPage` usa o `Calendar` do `react-big-calendar` com `dateFnsLocalizer` (`date-fns` + `date-fns/locale/pt-BR`), `messages` traduzidas, `selectable` + `popup`. Clique/arraste numa célula vazia abre o formulário de novo evento já com o período preenchido (`onSelectSlot`); clicar num evento existente abre o mesmo formulário em modo edição (`onSelectEvent`), que tem um botão "Excluir" que abre o diálogo de confirmação.
- Toolbar 100% customizado (`calendar-toolbar.tsx`) usando o `Button` do projeto em vez do toolbar padrão do react-big-calendar — não foi preciso reskinar `.rbc-toolbar`.
- `calendar-theme.css`: reskin das classes `.rbc-*` usando as mesmas CSS custom properties do resto do app (`--border`, `--card`, `--muted`, `--primary`, `--accent` etc.), então funciona em claro e escuro automaticamente sem duplicar cores. Verificado nos dois temas via inspeção de `computed style`.
- Campo `local` foi adicionado ao schema além do que foi pedido — é um campo padrão de qualquer evento de agenda e o custo de incluir é baixo.

## Bug corrigido (fora do escopo do pedido, mas achado no caminho)

**Sintoma:** todo `Button` renderizado com `render={<Link .../>}` (usado em toda a navegação — sidebar, landing, login) disparava um warning do Base UI no console: *"A component that acts as a button expected a native `<button>` because the `nativeButton` prop is true"*.

**Causa:** `components/ui/button.tsx` fixava `nativeButton={true}` incondicionalmente, mesmo quando `render` trocava o elemento renderizado para uma `<a>` (via `next/link`).

**Correção:** `nativeButton` agora é `false` por padrão sempre que `render` é passado (`nativeButton ?? !render`), continuando `true` (padrão anterior) quando não há `render`. Continua podendo ser sobrescrito manualmente se algum caso precisar.

**Estado final:** confirmado sem warnings em nenhuma página (landing, login, sidebar) numa aba nova e limpa. O elemento continua sendo uma `<a href>` de verdade — o Base UI agora só anota `role="button"` nela em vez de forçar semântica de botão nativo.

## Estado atual

Testado no dev server contra o Supabase real (sem a tabela `eventos` ainda): a UI inteira funciona — toolbar, navegação de mês, drilldown pro dia ao clicar na data, seleção de período por clique numa célula vazia abrindo o formulário pré-preenchido, envio do formulário chamando o Supabase e mostrando o erro de forma amigável (tabela não existe ainda) sem quebrar a tela. `tsc --noEmit` e `npm run lint` limpos.

## Pendências

- Rodar o SQL acima no Supabase antes de usar a aba de verdade.
