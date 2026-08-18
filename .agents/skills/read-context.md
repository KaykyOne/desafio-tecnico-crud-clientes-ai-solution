Read Project Context

Objetivo

Antes de iniciar qualquer trabalho no código, recuperar todo o contexto técnico registrado pelos agentes anteriores.

Esta skill é obrigatória antes de qualquer tarefa que envolva código.

Ela existe para evitar:

repetir bugs já resolvidos;

desfazer decisões arquiteturais;

recriar soluções existentes;

ignorar padrões definidos anteriormente;

alterar um lado do projeto sem entender impactos no outro;

perder contexto entre sessões e agentes.

Regra obrigatória

NÃO iniciar código antes de ler todos os arquivos de contexto dos dois projetos.

Sempre ler:

frontend/.agents/context/*
api/.agents/context/*

Isso é obrigatório mesmo quando a tarefa solicitada envolve apenas uma das partes.

Exemplos:

Tarefa somente frontend
→ ler frontend/.agents/context/*
→ ler api/.agents/context/*
→ depois iniciar

Tarefa somente API
→ ler frontend/.agents/context/*
→ ler api/.agents/context/*
→ depois iniciar

Tarefa full stack
→ ler frontend/.agents/context/*
→ ler api/.agents/context/*
→ depois iniciar

O contexto dos dois lados deve ser conhecido antes de qualquer modificação.

Momento de execução

Esta skill deve rodar antes de qualquer ação de implementação.

Ordem obrigatória:

receber tarefa
↓
localizar projeto
↓
ler frontend/.agents/context/*
↓
ler api/.agents/context/*
↓
entender estado atual
↓
somente então inspecionar/alterar código
↓
implementar
↓
validar
↓
registrar novo contexto conforme as regras do projeto

Não inverter essa ordem.

O que significa "antes de iniciar o código"

Antes da leitura completa dos contextos, não deve:

editar arquivos;

criar componentes;

criar Controllers;

criar Services;

criar migrations;

criar hooks;

criar schemas;

criar testes;

executar refatorações;

aplicar patches;

gerar implementação;

remover código;

renomear estruturas;

alterar configuração relacionada à aplicação.

Também não deve assumir a arquitetura atual apenas pela estrutura de pastas.

Primeiro, ler o histórico.

Leitura obrigatória dos dois diretórios

Frontend

Ler todos os arquivos existentes em:

frontend/.agents/context/

Não ler apenas o arquivo mais recente.

Não selecionar apenas arquivos cujo nome pareça relacionado à tarefa.

Ler todos.

API

Ler todos os arquivos existentes em:

api/.agents/context/

Não ler apenas o arquivo mais recente.

Não selecionar apenas arquivos cujo nome pareça relacionado à tarefa.

Ler todos.

Ordem de leitura

Quando possível, ordenar os arquivos pelo nome.

Como o padrão esperado é:

YYYY-MM-DD-descricao.md

isso normalmente resulta em uma leitura cronológica.

Exemplo:

2026-08-08-auth-setup.md
2026-08-09-login-validation.md
2026-08-09-login-session.md

Ler do mais antigo para o mais recente ajuda a entender:

decisão inicial
↓
alterações posteriores
↓
estado atual

Porém, decisões mais recentes têm prioridade quando houver mudança explícita de abordagem.

Conflitos entre contextos

Se dois arquivos apresentarem informações diferentes sobre o mesmo comportamento:

verificar a data;

verificar se o contexto mais recente declara uma mudança;

considerar o estado mais recente como atual;

confirmar no código quando necessário.

Exemplo:

contexto antigo:
login usava mutateAsync

contexto novo:
login foi alterado para mutate

A decisão atual é:

mutate

Não restaurar automaticamente uma decisão antiga.

Contexto não substitui o código

Os arquivos de contexto explicam:

decisões
motivos
bugs
estado esperado
arquitetura
pendências

Mas o código continua sendo a fonte real da implementação atual.

Após ler os contextos:

contexto
↓
orienta a investigação
↓
código confirma o estado real

Se houver diferença entre contexto e código, investigar antes de alterar.

Não assumir silenciosamente que um deles está correto.

Diretório inexistente

Se:

frontend/.agents/context/

ou:

api/.agents/context/

não existir, isso não autoriza ignorar o outro.

Exemplo:

frontend/.agents/context/ existe
api/.agents/context/ não existe

Então:

ler todos os contextos do frontend
↓
registrar mentalmente que não há contexto da API
↓
continuar

Não é necessário criar arquivos vazios apenas para satisfazer esta skill.

Diretório vazio

Se o diretório existir, mas estiver vazio:

frontend/.agents/context/

considerar:

nenhum contexto registrado no frontend

e continuar para o diretório da API.

Tipos de arquivo

Priorizar arquivos de contexto em Markdown:

*.md

Se o diretório possuir outros arquivos claramente destinados a contexto textual, eles também podem ser lidos.

Ignorar arquivos binários, temporários ou irrelevantes.

O que extrair de cada contexto

Durante a leitura, identificar principalmente:

Arquitetura

Exemplo:

Next rewrites fazem proxy para Laravel.
Sanctum usa sessão/cookie.
Controllers permanecem pequenos.

Decisões

Exemplo:

usar mutate em vez de mutateAsync quando Promise manual não é necessária.

Bugs corrigidos

Exemplo:

FormData retornava null porque os inputs não tinham name.

Padrões obrigatórios

Exemplo:

imports devem estar separados por comentários de categoria.

Estado atual

Exemplo:

login funciona e redireciona apenas em onSuccess.

Pendências

Exemplo:

implementar recuperação de senha.

Criar um resumo interno antes de implementar

Após ler todos os arquivos, formar um resumo curto contendo:

estado atual
decisões relevantes
restrições
padrões obrigatórios
riscos
pendências relacionadas

Esse resumo deve orientar a implementação.

Não é necessário criar um novo arquivo apenas para esse resumo prévio.

Exemplo de execução

Tarefa recebida:

Adicionar logout no header.

Execução correta:

1. Ler todos os arquivos de:
   frontend/.agents/context/

2. Ler todos os arquivos de:
   api/.agents/context/

3. Descobrir pelo contexto que:
   - auth usa Sanctum SPA;
   - logout já existe em POST /api/logout;
   - frontend usa auth-service;
   - React Query mantém ["auth", "user"];
   - erros HTTP passam pelo interceptor Axios.

4. Inspecionar os arquivos atuais.

5. Implementar logout respeitando essas decisões.

6. Validar.

7. Criar o contexto correspondente no frontend.
   Se a API não foi modificada, não criar contexto novo na API.

Exemplo incorreto

Tarefa:
Adicionar logout.

Agente:
abre Header.tsx
↓
cria fetch("http://localhost:8000/api/logout")
↓
finaliza

Isso está errado porque o agente não leu o contexto e ignorou decisões existentes como:

Next rewrites
Axios centralizado
Sanctum
auth-service
React Query

Leitura de contexto e escopo da alteração são regras diferentes

É importante distinguir:

Antes de implementar

Sempre ler:

frontend/.agents/context/*
api/.agents/context/*

Depois de implementar

Criar novo contexto somente onde houve modificação.

Exemplo:

leitura:
frontend + API

alteração:
somente frontend

novo contexto:
somente frontend

Portanto:

LER = sempre os dois
ESCREVER = somente onde houve alteração

Essa distinção é obrigatória.

Integração com a regra de registro de contexto

Depois da implementação, aplicar a regra do projeto:

mexeu frontend
→ criar frontend/.agents/context/<novo-contexto>.md

mexeu API
→ criar api/.agents/context/<novo-contexto>.md

mexeu nos dois
→ criar um arquivo em cada diretório

A leitura inicial não substitui o registro final.

Checklist obrigatório

Antes de escrever código:

[ ] Listei os arquivos de frontend/.agents/context/
[ ] Li TODOS os contextos do frontend
[ ] Listei os arquivos de api/.agents/context/
[ ] Li TODOS os contextos da API
[ ] Identifiquei decisões relevantes
[ ] Identifiquei padrões obrigatórios
[ ] Identifiquei bugs anteriores relacionados
[ ] Identifiquei o estado atual

Somente depois:

[ ] Inspecionar código atual
[ ] Implementar
[ ] Validar
[ ] Registrar contexto novo onde houve alteração

Regra absoluta

A tarefa de código não pode começar sem que os contextos existentes dos dois projetos tenham sido lidos.

Sempre:

frontend/.agents/context/*
+
api/.agents/context/*
↓
leitura completa
↓
código

Nunca:

código
↓
contexto

A finalidade desta skill é garantir continuidade técnica entre agentes, sessões e modificações.