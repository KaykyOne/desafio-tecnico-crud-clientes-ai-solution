# Skeletons de carregamento

## Resumo

Estados de carregamento das telas de clientes, configurações e Kanban agora usam skeletons visuais no formato do conteúdo final.

## Alterações

- Criados `components/card-skeleton.tsx` e `components/label-skeleton.tsx` como composições reutilizáveis do primitive `Skeleton`.
- Clientes renderiza `ClientsSkeleton` para os cards de estatística, busca e cinco linhas da tabela enquanto o hook carrega.
- Configurações mantém o cabeçalho e renderiza `SettingsSkeleton` para os campos dinâmicos e o botão de salvar.
- O placeholder inline do Kanban foi extraído para `TaskCardSkeleton`, que reaproveita `CardSkeleton` e representa título, prioridade e metadados.

## Decisões

- Os skeletons específicos permanecem nos `_components` da rota correspondente; somente as composições genéricas ficam em `components/`.
- Os placeholders usam os tokens existentes (`card`, `muted`, `border` e `foreground`) para continuarem consistentes nos temas claro e escuro.

## Validação

- `npm.cmd run lint` concluído com sucesso.
- A build de produção foi iniciada, mas o ambiente sem acesso à rede não conseguiu baixar as fontes Geist já importadas por `app/layout.tsx`.
