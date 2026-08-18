Regra Obrigatória de Contexto por Modificação

Este documento define uma regra obrigatória para registrar, de forma resumida e clara, todas as modificações realizadas no projeto.

A regra vale separadamente para:

frontend/
api/

O objetivo é permitir que qualquer agente, desenvolvedor ou nova sessão consiga entender rapidamente o que foi alterado sem precisar reconstruir todo o histórico do projeto.

1. Regra principal

Toda modificação relevante no código deve gerar um arquivo de contexto.

Esses arquivos devem ser criados dentro de:

frontend/agents/context/

ou:

api/agents/context/

dependendo de onde a alteração foi realizada.

Essa regra é obrigatória.

2. Frontend e API são independentes

Os históricos de contexto devem ser separados.

Se a alteração foi apenas no frontend

Criar somente:

frontend/agents/context/<arquivo>.md

Não criar nenhum arquivo na API.

Se a alteração foi apenas na API

Criar somente:

api/agents/context/<arquivo>.md

Não criar nenhum arquivo no frontend.

Se a alteração envolveu frontend e API

Criar dois arquivos separados.

Exemplo:

frontend/agents/context/2026-08-09-login-flow.md
api/agents/context/2026-08-09-login-flow.md

Cada arquivo deve explicar somente as alterações daquela parte do projeto.

Não criar um único arquivo compartilhado entre frontend e API.

3. Nunca misturar responsabilidades

Errado:

frontend/agents/context/login.md

com conteúdo como:

- Alterado LoginForm no Next.
- Criado LoginRequest no Laravel.
- Ajustado LoginController.

O arquivo do frontend não deve documentar implementação interna da API.

O correto é separar.

Frontend:

frontend/agents/context/2026-08-09-login-flow.md

- Ajustado LoginForm.
- Adicionados `name` aos inputs.
- Login passou a redirecionar somente após sucesso.
- Hook `useLogin` continua responsável pela mutation.

API:

api/agents/context/2026-08-09-login-flow.md

- Login validado através de `LoginRequest`.
- Credenciais inválidas retornam 401.
- Sessão é regenerada após autenticação.

4. Quando criar um arquivo de contexto

Criar um arquivo quando houver qualquer alteração relevante em código da aplicação.

Exemplos:

nova funcionalidade
correção de bug
refatoração
alteração de arquitetura
alteração em fluxo
alteração de autenticação
nova integração
mudança em validação
alteração de banco
nova migration
alteração em service
alteração em controller
alteração em hook
alteração em componente
alteração em schema
alteração em regra de negócio
alteração relevante em testes

5. Alterações pequenas também devem ser registradas

Mesmo uma alteração pequena deve gerar contexto quando ela modificar comportamento ou estrutura.

Exemplo:

Adicionado `name="email"` e `name="password"` aos inputs do LoginForm.

Isso parece pequeno, mas corrigiu o envio do formulário.

Portanto, deve ser registrado.

6. O arquivo deve ser resumido, mas claro

O arquivo de contexto não deve ser:

um changelog gigantesco
uma cópia do código
uma transcrição da conversa
um relatório excessivamente detalhado

Ele deve responder rapidamente:

O que foi alterado?
Por que foi alterado?
Quais arquivos principais foram afetados?
Como ficou o comportamento?
Existe alguma decisão importante para manter?
Existe algo pendente?

7. Estrutura obrigatória do arquivo

Todo arquivo de contexto deve seguir esta estrutura:

# <Título da alteração>

## Resumo

Explicação curta do que foi feito.

## Arquivos alterados

- `caminho/do/arquivo`
- `caminho/do/outro-arquivo`

## Alterações

- Alteração 1.
- Alteração 2.
- Alteração 3.

## Decisões

- Decisão arquitetural ou técnica importante.
- Padrão que deve continuar sendo seguido.

## Estado atual

Explicar como a funcionalidade ficou após a alteração.

## Pendências

- Pendência, se existir.

Se não houver pendências:

- Nenhuma.

8. Exemplo de contexto do frontend

Arquivo:

frontend/agents/context/2026-08-09-login-form.md

Conteúdo:

# Correção do formulário de login

## Resumo

Corrigido o envio das credenciais no formulário de login.

## Arquivos alterados

- `components/auth/login-form.tsx`

## Alterações

- Adicionado `name="email"` ao input de email.
- Adicionado `name="password"` ao input de senha.
- Mantido o uso de `FormData` para leitura dos campos.
- Mantido o redirecionamento para `/dashboard` somente no `onSuccess` da mutation.

## Decisões

- O formulário continuará usando `FormData`.
- Erros HTTP continuam sendo tratados globalmente pelo interceptor Axios.
- O formulário não deve redirecionar quando a mutation falhar.

## Estado atual

O frontend envia corretamente `email` e `password` para `/api/login`.

## Pendências

- Nenhuma.

9. Exemplo de contexto da API

Arquivo:

api/agents/context/2026-08-09-login-validation.md

Conteúdo:

# Validação do login

## Resumo

Organizado o fluxo de validação e autenticação do login.

## Arquivos alterados

- `app/Http/Requests/Auth/LoginRequest.php`
- `app/Http/Controllers/Auth/LoginController.php`

## Alterações

- `LoginRequest` valida email e password.
- Email deve ser obrigatório e válido.
- Password deve ser obrigatório e string.
- Credenciais inválidas retornam HTTP 401.
- Sessão é regenerada após login bem-sucedido.

## Decisões

- Validação permanece no FormRequest.
- Controller não deve duplicar regras de validação.
- Autenticação continua utilizando sessão/cookies com Sanctum.

## Estado atual

Login válido autentica o usuário e retorna seus dados.

Credenciais inválidas retornam 401.

Dados inválidos retornam 422 antes de chegar ao `Auth::attempt`.

## Pendências

- Nenhuma.

10. Padrão de nome dos arquivos

Usar preferencialmente:

YYYY-MM-DD-descricao-curta.md

Exemplos:

2026-08-09-login-form.md
2026-08-09-auth-service.md
2026-08-09-user-registration.md
2026-08-10-dashboard-query.md
2026-08-10-clinic-policy.md

Utilizar:

kebab-case

Evitar:

contexto.md
alteracoes.md
teste.md
novo.md
final.md
final-2.md

O nome deve permitir identificar rapidamente o assunto.

11. Mais de uma alteração no mesmo dia

Se houver alterações distintas no mesmo dia, criar arquivos separados.

Exemplo:

2026-08-09-login-form.md
2026-08-09-register-form.md
2026-08-09-query-provider.md

Se for continuação direta da mesma tarefa, pode ser utilizado o mesmo assunto com um sufixo claro:

2026-08-09-login-form.md
2026-08-09-login-form-toast.md

Não sobrescrever contexto anterior importante apenas para manter um único arquivo.

12. Alterações relacionadas podem usar um único arquivo

Se várias modificações fazem parte da mesma tarefa, elas podem ser documentadas juntas.

Exemplo:

frontend/
├── components/auth/login-form.tsx
├── hooks/auth/use-login.ts
└── services/auth-service.ts

Se todos foram alterados para o mesmo fluxo de login, pode existir:

frontend/agents/context/2026-08-09-login-flow.md

Não é necessário criar um arquivo de contexto para cada arquivo de código.

A unidade do contexto é a modificação/tarefa, não cada arquivo individual.

13. Não criar contexto vazio

Não criar arquivos como:

# Alterações

Nada importante.

Se nenhum código daquela parte foi alterado, não criar arquivo de contexto nela.

Exemplo:

Mudança somente no frontend

Resultado:

frontend/agents/context/...  ✅
api/agents/context/...       ❌

14. Contexto deve representar o estado final

O arquivo deve registrar o resultado final da modificação.

Não documentar tentativas descartadas como se ainda fossem parte da arquitetura.

Exemplo ruim:

- Tentamos usar axios diretamente.
- Depois tentamos fetch.
- Depois voltamos para axios.

Se o estado final é:

Axios centralizado com interceptor

registrar isso.

Tentativas só devem ser mencionadas quando explicarem uma decisão importante.

15. Registrar decisões importantes

O contexto deve preservar decisões que poderiam ser perdidas em uma nova sessão.

Exemplos:

- Não usar JWT; autenticação SPA usa sessão/cookies com Sanctum.
- Browser não chama Laravel diretamente.
- `/api/*` passa pelo rewrite do Next.
- Mutations utilizam TanStack Query.
- Toast de erro HTTP é centralizado no interceptor Axios.
- Validação Laravel fica em FormRequest.
- Controllers devem permanecer pequenos.

Não é necessário repetir todas as decisões globais em todos os arquivos.

Registrar apenas as que forem relevantes para a modificação atual.

16. Registrar bugs corrigidos

Quando a alteração corrige um bug, informar:

sintoma
causa
correção
estado final

Exemplo:

## Bug corrigido

Sintoma:

O login retornava 422 informando que email e password eram obrigatórios.

Causa:

Os inputs não possuíam atributo `name`, portanto `FormData` retornava `null`.

Correção:

Foram adicionados:

- `name="email"`
- `name="password"`

Estado final:

O payload agora é enviado corretamente ao Laravel.

Essa informação é especialmente útil para futuras sessões.

17. Alterações de banco

Quando houver migration ou alteração estrutural de banco, registrar claramente:

tabela
coluna
tipo
nullable
default
índices
foreign keys
efeito esperado

Exemplo:

## Alterações

- Adicionada coluna `clinic_id` em `users`.
- Coluna possui foreign key para `clinics.id`.
- Exclusão da clínica utiliza `nullOnDelete`.
- Coluna permanece nullable.

18. Alterações de API

Quando um endpoint for criado ou modificado, registrar:

método HTTP
rota
request
response
status codes importantes
autenticação/autorização

Exemplo:

## Endpoint

`POST /api/login`

Possíveis respostas:

- `200`: login realizado.
- `401`: credenciais inválidas.
- `422`: dados inválidos.

Proteção:

- CSRF via Sanctum SPA.

19. Alterações de frontend

Quando houver mudança em componente, hook ou fluxo, registrar:

componente afetado
hook/service utilizado
comportamento anterior
comportamento atual
dependências importantes

Não é necessário documentar detalhes puramente visuais sem relevância futura, a menos que façam parte da tarefa.

20. Arquivos de configuração

Alterações puramente automáticas ou geradas por ferramentas podem ser ignoradas quando não representam uma decisão do projeto.

Porém, se um arquivo de configuração for alterado manualmente e isso mudar o comportamento da aplicação, a mudança deve ser registrada no contexto da parte correspondente.

Exemplo:

frontend/next.config.ts

Se o rewrite da API for alterado, isso é uma mudança arquitetural e deve gerar contexto no frontend.

21. Fluxo obrigatório após uma modificação

Ao concluir uma tarefa:

1. Identificar quais partes do projeto foram modificadas.
2. Se houve mudança no frontend, criar contexto no frontend.
3. Se houve mudança na API, criar contexto na API.
4. Se houve mudança nos dois, criar dois contextos.
5. Registrar o estado final.
6. Registrar decisões relevantes.
7. Registrar pendências.

22. Matriz de decisão

Alteração

Frontend context

API context

Somente Next.js

Sim

Não

Somente Laravel

Não

Sim

Next.js + Laravel

Sim

Sim

Somente componente

Sim

Não

Somente Controller

Não

Sim

Hook + endpoint

Sim

Sim

Migration

Não

Sim

Schema Zod

Sim

Não

FormRequest

Não

Sim

Fluxo completo full stack

Sim

Sim

23. Regra para agentes

Qualquer agente que modificar o projeto deve considerar a criação do contexto como parte da própria tarefa.

A tarefa não está concluída enquanto o arquivo de contexto obrigatório não tiver sido criado.

Fluxo:

modificar código
↓
validar alteração
↓
criar contexto
↓
finalizar tarefa

Nunca:

modificar código
↓
finalizar tarefa
↓
esquecer contexto

24. Regra final

Sempre aplicar:

mexeu somente no frontend
→ frontend/agents/context/

mexeu somente na API
→ api/agents/context/

mexeu nos dois
→ um arquivo em frontend/agents/context/
→ outro arquivo em api/agents/context/

Os arquivos devem ser:

curtos
claros
úteis
específicos
baseados no estado final

O histórico de contexto faz parte obrigatória da manutenção do projeto.