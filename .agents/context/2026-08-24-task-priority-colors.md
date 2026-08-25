# Cores das prioridades de tarefas

## Alterações

- Cards do Kanban agora usam fundo preto para `Baixa`, amarelo para `Média` e vermelho para `Urgente`, em ambos os temas.
- Os badges, textos, metadados e divisores internos acompanham cada fundo para preservar o contraste.
- O formulário usa o nome `Urgente` para a prioridade persistida como `high`.

## Decisão

- O valor `high` no banco e nos tipos foi preservado para não exigir migração nem alterar tarefas já salvas; somente o rótulo visual mudou.

## Validação

- `npm.cmd run format`, `npm.cmd run format:check`, `npm.cmd run lint` e `npx.cmd tsc --noEmit` concluídos com sucesso.
