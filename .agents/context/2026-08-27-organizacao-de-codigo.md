# Organização de código: um componente por arquivo, imports padronizados e camada de dados genérica

## Resumo

Refactor estrutural em quatro frentes, sem mudança de comportamento:

1. **Um componente por arquivo** — os 5 arquivos que tinham mais de um componente foram divididos, e cada `_components/` ganhou um barrel `index.ts`.
2. **Convenção de export/import** — componente do projeto vira *named export* (import com chaves); componente do shadcn vira *default import* (namespace quando agrupa peças).
3. **Imports agrupados e comentados** em todos os arquivos da aplicação, na ordem definida em `.agents/skills/imports.md`.
4. **Acesso a dados centralizado** numa camada genérica com Axios: nenhum hook fala com o banco diretamente.

Criado `CONVENTIONS.md` na raiz com essas regras.

## Arquivos alterados

**Novos:**
- `CONVENTIONS.md` — as regras, na raiz.
- `lib/http.ts` — instância Axios apontada pra API REST do Supabase, com interceptors de token e de erro.
- `services/api-service.ts` — `get`, `getOne`, `post`, `upsert`, `upsertIgnoring`, `patch`, `remove`, `rpc`.
- `services/auth-service.ts` — `getAuthenticatedUserId`.
- `lib/api-error.ts` — `getApiErrorMessage`, `isUniqueViolation`, `isForeignKeyViolation`.
- `lib/task-filters.ts` — a lógica pura de filtro que estava dentro do componente.
- Componentes extraídos: `draggable-task-card.tsx`, `kanban-column.tsx`, `sortable-column.tsx`, `faceted-filter.tsx`, `week-filter.tsx` (tasks), `ofx-group-card.tsx` (financeiro), `stat-card.tsx` (clients).
- 9 arquivos `_components/index.ts`.

**Alterados:** 61 arquivos tiveram imports reagrupados; 41 tiveram imports do shadcn convertidos; 40 componentes viraram named export; os 10 hooks de dados foram migrados pra camada genérica.

## Decisões

- **Named export pro projeto, default pro shadcn.** É o critério que o usuário pediu, e ele carrega informação: pelo formato do import já se sabe se aquilo é código nosso (chaves) ou peça de fora (default). `page.tsx`/`layout.tsx` e afins continuam com default — é exigência do Next, não escolha.
- **Barrel só pra quem está de fora da pasta.** Um componente de `_components/` importa o irmão direto (`./task-card`), nunca pelo `index.ts`. Passar pelo barrel criaria import circular, porque o barrel reexporta o próprio arquivo que está importando.
- **A divisão do kanban segue uma direção só de dependência**: `KanbanBoard → KanbanColumn → DraggableTaskCard`. O tipo compartilhado dos callbacks (`TaskCardHandlers`) foi declarado no arquivo mais profundo justamente pra evitar que os três se importassem em ciclo — antes ele era derivado de `KanbanBoardProps` com `Omit`, o que só funcionava por estarem no mesmo arquivo.
- **A lógica de filtro saiu do componente pra `lib/task-filters.ts`.** Não é UI: são tipos, predicados e matemática de semana. Fora do componente ela fica testável e reaproveitável.
- **O refactor mecânico foi feito por codemod, não à mão.** Três scripts (conversão de import do shadcn, named exports, reagrupamento) rodaram sobre a árvore com backup prévio e `tsc` como rede de segurança. Fazer 60+ arquivos à mão introduziria erro humano justamente onde não há teste automatizado pra pegar.

### Sobre a camada de dados

- **Axios fala com o PostgREST**, que é a API REST que o Supabase já expõe. `services/api-service.ts` traduz uma intenção simples (`{ select, filters, order, limit }`) para o dialeto de query string do PostgREST. O fluxo agora é `Componente → Hook → Service → HTTP → Supabase`, e trocar o backend depois é mexer em dois arquivos.
- **O `supabase-js` continua no projeto, mas só pra autenticação** — sessão, login, refresh de token e `onAuthStateChange`. Isso não é REST e reimplementar sobre Axios seria reescrever gerenciamento de sessão sem ganho. Ele é a fonte do access token que o interceptor injeta em toda requisição. Auditado: `supabase` só aparece em `use-login`, `use-logout`, `use-signup`, `use-profile`, `dashboard-auth-guard`, e nos dois arquivos da camada que leem a sessão.
- **O erro é normalizado preservando o `code` do Postgres.** `HttpError` carrega `code`/`details`/`hint`/`status` extraídos do corpo da resposta, porque os hooks decidem a mensagem ao usuário a partir dele (`23505` = "já cadastrado", `23503` = "coluna com tarefas"). Sem isso, esses tratamentos teriam virado mensagem genérica em silêncio.
- **Filtro aceita dois operadores na mesma coluna.** `serializeFilter` devolve uma lista de parâmetros, não um só — é o que permite `data: { gte, lte }` virar `data=gte.X&data=lte.Y`. Numa primeira versão o limite superior era filtrado no cliente, o que traria de volta o problema do corte de 1000 linhas da API: o período pegaria linhas demais e descartaria as certas.
- **`upsert` e `upsertIgnoring` são funções separadas** porque resolvem conflitos de formas opostas (`merge-duplicates` para a reordenação de colunas, `ignore-duplicates` para a importação de OFX). Unificar num parâmetro booleano deixaria a chamada ambígua na leitura.
- Os helpers `getAuthenticatedUserId` e `getSupabaseErrorMessage` estavam **copiados em cada hook**; agora vivem num lugar só.

## Estado atual

`tsc --noEmit`, `npm run lint` e `npm run format` limpos. **`npm run build` completo passou**, gerando as 12 páginas estáticas — verificação mais forte que o typecheck para um refactor deste tamanho.

**Não verificado no navegador contra o Supabase real.** É a pendência que mais importa: a camada de dados foi inteiramente reescrita, e só o uso real confirma que cada operação (listar, criar, editar, excluir, importar OFX, reordenar colunas, cronômetro) continua funcionando.

## Pendências

- **Testar cada tela logado.** Prioridade para o que usa operação menos trivial: importação de OFX (`upsertIgnoring` com `on_conflict`), reordenar colunas do Kanban (`upsert` com merge), filtro por período do financeiro (dois operadores na mesma coluna) e o cronômetro (RPC + busca da entrada ativa).
- Conferir se as mensagens de erro específicas ainda aparecem — cadastrar um banco com nome repetido deve dizer "Esse banco já está cadastrado", e excluir coluna com tarefas deve dizer "Não é possível excluir uma coluna com tarefas". São os dois casos que dependem do `code` sobreviver à normalização.
