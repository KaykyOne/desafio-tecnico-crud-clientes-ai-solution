# Logout após alteração de e-mail ou senha

## Alterações

- O hook `useProfile` detecta alterações de e-mail ou senha após a atualização no Supabase.
- Quando uma dessas credenciais muda, a sessão local é encerrada e o usuário é redirecionado para `/login`.
- Alterações apenas no nome continuam mantendo a sessão ativa.

## Estado atual

O comportamento foi centralizado no hook de perfil para manter a regra consistente com o fluxo client-side de autenticação existente.
