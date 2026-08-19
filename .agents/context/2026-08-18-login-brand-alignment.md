# Alinhamento visual do login

## Resumo

Adaptado o login para compartilhar a identidade visual da landing page e ocupar toda a tela.

## Arquivos alterados

- `app/login/page.tsx`
- `app/login/login-form.tsx`

## Alterações

- Removida a moldura escura e a barra que simulava uma aba do navegador.
- Aplicado fundo claro, paleta verde, formas suaves e card branco consistentes com a rota `/`.
- Adicionada navegação superior com marca ClienteApp e link de retorno para a landing page.
- Mantida a autenticação Supabase e os componentes shadcn do formulário.

## Decisões

- O login usa a mesma linguagem visual da apresentação, mas mantém contraste e foco próprios para a tarefa de autenticação.

## Estado atual

A rota `/login` ocupa a viewport inteira, é responsiva e não contém elementos de aba ou moldura de navegador.

## Pendências

- Nenhuma.
