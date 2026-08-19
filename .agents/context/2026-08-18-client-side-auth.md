# Autenticação exclusivamente client-side

## Resumo

Organizados os fluxos de login e cadastro como uma aplicação client-side, sem Route Handlers ou Server Actions.

## Arquivos alterados

- `hooks/supabase.ts`
- `hooks/use-login.ts`
- `hooks/use-sign-up.ts`
- `app/_components/auth-brand.tsx`
- `app/login/_components/login-form.tsx`
- `app/cadastro/_components/signup-form.tsx`
- `app/login/page.tsx`
- `app/cadastro/page.tsx`

## Alterações

- A instância compartilhada do Supabase foi marcada explicitamente como client-only.
- Estados dos campos permanecem nos componentes de formulário.
- Os dados dos estados são passados aos hooks no submit.
- Hooks concentram autenticação, validação, loading, toasts e navegação.
- A marca compartilhada foi extraída para um componente próprio.
- Variáveis públicas do Supabase são referenciadas explicitamente para serem incluídas corretamente no bundle do navegador.

## Decisões

- O frontend chama o Supabase Auth diretamente pelo SDK browser, que utiliza fetch internamente.
- Não existem endpoints internos de autenticação, Server Actions ou lógica de autenticação server-side.

## Estado atual

Login e cadastro funcionam integralmente no navegador, com responsabilidades separadas entre UI, hooks e cliente Supabase.

## Pendências

- Nenhuma.
