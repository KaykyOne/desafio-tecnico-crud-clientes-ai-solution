# Cadastro de usuários

## Resumo

Criada a rota `/cadastro` para registrar usuários usando o Supabase Auth.

## Arquivos alterados

- `app/cadastro/page.tsx`
- `app/cadastro/signup-form.tsx`
- `app/login/login-form.tsx`

## Alterações

- Adicionado formulário de cadastro com nome, e-mail, senha e confirmação de senha.
- Cadastro usa `supabase.auth.signUp` e envia `full_name` como metadado do usuário.
- Incluídas mensagens para erro, senhas divergentes e confirmação de e-mail.
- Layout da nova rota espelha horizontalmente o login: formulário à esquerda e apresentação à direita.
- Adicionados links entre login e cadastro.

## Decisões

- Quando o Supabase retornar uma sessão imediatamente, o usuário segue para `/dashboard`.
- Quando a confirmação de e-mail estiver habilitada, o usuário recebe uma mensagem orientando a confirmação antes do login.

## Estado atual

A rota `/cadastro` ocupa a tela inteira, mantém a identidade visual da landing page e registra novos usuários no Supabase Auth.

## Pendências

- Nenhuma.
