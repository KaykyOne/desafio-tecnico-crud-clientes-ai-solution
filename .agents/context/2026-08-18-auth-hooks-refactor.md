# Refatoração da autenticação para hooks

## Resumo

Centralizada a lógica de login e cadastro em hooks reutilizáveis.

## Arquivos alterados

- `hooks/supabase.ts`
- `hooks/use-login.ts`
- `hooks/use-sign-up.ts`
- `app/login/_components/login-form.tsx`
- `app/cadastro/_components/signup-form.tsx`
- `lib/supabase/client.ts`

## Alterações

- Criada uma única instância exportada do cliente Supabase em `hooks/supabase.ts`.
- Movidos para `useLogin` o estado, submit, autenticação, toasts e redirecionamento do login.
- Movidos para `useSignUp` o estado, validação, submit, cadastro, toasts e redirecionamento do registro.
- Componentes ficaram responsáveis apenas pela apresentação e binding dos campos.
- Removida a antiga fábrica de cliente para evitar instanciações duplicadas.

## Decisões

- Os hooks continuam sendo Client Components porque dependem de estado, roteamento e toast.
- A instância Supabase é compartilhada pelos fluxos de autenticação no browser.

## Estado atual

Login e cadastro preservam o comportamento anterior, mas não contêm mais a lógica de autenticação.

## Pendências

- Nenhuma.
