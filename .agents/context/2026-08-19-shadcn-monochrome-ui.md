# Padronização visual monocromática shadcn

## Resumo

A interface foi refinada para usar uma linguagem visual branca, preta e zinc, alinhada aos tokens e variantes padrão dos componentes locais do shadcn.

## Alterações

- Tokens globais de background, foreground, border, muted, accent, primary e ring foram convertidos para uma paleta monocromática.
- `Button` e `Input` deixaram de aplicar padding global artificial e voltaram a dimensões mais próximas do padrão shadcn.
- Landing, login, dashboard, clientes, configurações, dialogs, select e toaster foram alinhados a variantes sem cores de marca.
- Sombras, gradientes coloridos e estados verdes/vermelhos específicos foram removidos das telas.

## Decisões

- A semântica visual vem dos tokens `primary`, `muted`, `accent`, `destructive` e `muted-foreground`.
- O fluxo de autenticação, hooks, Supabase e CRUD não foi alterado.

## Estado atual

Build de produção validado com sucesso em Next.js 16.3.1.
