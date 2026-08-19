# Feedback para e-mail não verificado no login

## Alterações

- O login identifica o erro `email_not_confirmed` retornado pelo Supabase.
- Também considera mensagens equivalentes para manter o feedback resiliente.
- O toast agora orienta o usuário a verificar a caixa de entrada e confirmar o e-mail.
- Erros de credenciais continuam usando a mensagem genérica de e-mail e senha.
