# Implementação do login

## Resumo

Criada a tela de login seguindo o layout de referência e conectada ao Supabase Auth.

## Arquivos alterados

- `app/login/page.tsx`
- `app/login/login-form.tsx`
- `lib/supabase/client.ts`

## Alterações

- Adicionada composição responsiva com moldura escura, barra superior, painel roxo de marca e formulário grafite.
- Reutilizados os componentes shadcn locais `Button`, `Input` e `Label`.
- Formulário conectado a `signInWithPassword`, com estado de carregamento, mensagem de erro e redirecionamento para `/dashboard`.
- Criado cliente Supabase para uso no navegador com a chave pública do ambiente.

## Decisões

- A autenticação permanece no Supabase Auth e não expõe nenhuma chave secreta no frontend.
- O redirecionamento ocorre apenas após login bem-sucedido.

## Estado atual

A rota `/login` apresenta o layout solicitado em desktop e empilha os painéis em telas menores. O formulário envia e-mail e senha ao Supabase.

## Pendências

- Nenhuma.
