# Edição por linha e filtro de clientes

## Alterações

- Cada linha da tabela de clientes abre o modal de edição ao ser clicada.
- Botões de editar e excluir interrompem a propagação do clique, preservando suas ações específicas.
- Adicionado filtro de status com opções Ativos, Inativos e Todos; o padrão é Ativos.
- Busca textual e filtro de status são aplicados em conjunto.

## Validação

- `npm.cmd run format`, `npm.cmd run format:check`, `npm.cmd run lint` e `npx.cmd tsc --noEmit` concluídos com sucesso.
