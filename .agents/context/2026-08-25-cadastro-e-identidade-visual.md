# Cadastro de usuários e identidade visual de freelancer

## Resumo

Implementado o fluxo de cadastro de usuários (`/signup`) via Supabase Auth, e reposicionada a identidade visual do app como um sistema para freelancers/autônomos, com crédito e link para o portfólio (https://kayky.dev.br/) no rodapé das páginas públicas e na sidebar do dashboard.

## Arquivos alterados

- `hooks/use-signup.ts` (novo)
- `app/signup/page.tsx` (novo)
- `app/signup/_components/signup-form.tsx` (novo)
- `app/login/_components/login-form.tsx` (link para `/signup`)
- `app/_components/site-footer.tsx` (novo)
- `app/_components/landing-page.tsx` (copy, CTA de cadastro, footer)
- `app/login/page.tsx`, `app/signup/page.tsx` (footer)
- `app/dashboard/_components/dashboard-sidebar.tsx` (crédito compacto no rodapé da sidebar)
- `app/layout.tsx` (título/descrição da página)

## Alterações

- `useSignup` segue o padrão de `useLogin`: `supabase.auth.signUp` com `full_name` nos metadados; se a sessão vier imediata (confirmação de e-mail desligada), redireciona para `/dashboard`; senão, pede para confirmar o e-mail e manda para `/login`. Mensagem específica para e-mail já cadastrado.
- `SignupForm` valida senha/confirmação no cliente antes de enviar.
- Landing page: nav agora reaproveita `AuthBrand` (antes duplicava o mesmo bloco de marca manualmente) e ganhou botão "Cadastrar"; copy trocado para refletir os três módulos (clientes, tarefas, financeiro) com discurso de "quem toca o negócio sozinho".
- `SiteFooter` (crédito "Desenvolvido por Kayky" com link para `https://kayky.dev.br/`, `target="_blank"` + `rel="noopener noreferrer"`) adicionado na landing, login e signup; versão compacta equivalente foi adicionada no rodapé da sidebar do dashboard (que não tem footer de página).
- Título da aba trocado de "Clientes | Gestão de clientes" para "ClienteApp | Gestão para freelancers".

## Decisões

- Não houve rebranding do nome do produto (continua "ClienteApp") — só reposicionamento de copy/mensagem, por não ter sido pedido explicitamente.
- Rota escolhida foi `/signup` (não `/cadastro`) para simetria com `/login`, já que é o padrão de nomeação das rotas de autenticação (as rotas do dashboard usam nomes variados, mas login/signup formam um par).

## Estado atual

Testado ponta a ponta contra o Supabase real do projeto: cadastro criou o usuário, sessão veio imediata (confirmação de e-mail está desligada nesse projeto), redirecionou para `/dashboard`, toast e crédito no rodapé da sidebar confirmados. `tsc --noEmit` e `npm run lint` limpos.

## Pendências

- Fica no Supabase Auth um usuário de teste criado durante a verificação (`teste-signup@exemplo.com`) — remover manualmente se quiser.
