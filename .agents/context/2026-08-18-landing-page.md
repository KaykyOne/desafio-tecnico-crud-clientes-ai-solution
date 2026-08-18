# Landing page de gestão de clientes

## Resumo

Criada a página inicial de apresentação da plataforma de gestão de clientes.

## Arquivos alterados

- `app/page.tsx`
- `app/_components/landing-page.tsx`
- `app/layout.tsx`

## Alterações

- A página inicial agora renderiza o componente `LandingPage` em `app/_components`.
- A landing page apresenta o propósito do sistema e uma prévia visual de clientes.
- Os links de ação direcionam o usuário para `/login`.
- Metadados e idioma padrão foram ajustados para português brasileiro.
- A composição utiliza os componentes locais `Button`, `Card`, `Badge` e `Avatar`.

## Decisões

- O componente foi mantido como Server Component por não exigir estado ou interação no cliente.
- A navegação usa `next/link` para a rota de login.
- Componentes de interface do projeto são priorizados para preservar padrões do shadcn local.

## Estado atual

A rota `/` apresenta a landing page responsiva de gestão de clientes e permite acessar o login.

## Pendências

- Nenhuma.
