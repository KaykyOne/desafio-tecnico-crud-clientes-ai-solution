# Correção de renderização da landing page

## Resumo

Corrigido o erro de runtime que impedia a rota `/` de renderizar.

## Arquivos alterados

- `app/_components/landing-page.tsx`

## Alterações

- Substituído o acesso por namespace `Avatar.AvatarRoot` pelos imports nomeados `AvatarRoot`, `AvatarFallback` e `AvatarBadge`.
- Mantido o uso dos componentes locais de UI.

## Decisões

- Componentes exportados por módulos Client devem ser importados nominalmente quando usados em Server Components, evitando referências `undefined` no RSC payload do Next.

## Estado atual

A landing page pode renderizar seus avatares sem gerar o erro `Element type is invalid`.

## Pendências

- Nenhuma.
