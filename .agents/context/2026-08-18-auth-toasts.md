# Feedback visual da autenticação

## Resumo

Adicionado feedback global com Sonner nas telas de login e cadastro.

## Arquivos alterados

- `app/layout.tsx`
- `app/login/login-form.tsx`
- `app/cadastro/signup-form.tsx`

## Alterações

- Montado o `Toaster` shadcn no layout raiz.
- Login exibe toast de erro para credenciais inválidas e toast de sucesso após autenticação.
- Cadastro exibe toast para senhas divergentes, falhas de registro, criação imediata de sessão e confirmação de e-mail.
- Removidas as mensagens inline duplicadas dos formulários.

## Decisões

- O feedback de autenticação usa Sonner como canal único para manter o comportamento consistente entre as rotas.
- O Toaster fica no layout raiz para funcionar em todas as páginas sem duplicar configuração.

## Estado atual

Login e cadastro apresentam feedback toast para os principais estados de sucesso e erro.

## Pendências

- Nenhuma.
