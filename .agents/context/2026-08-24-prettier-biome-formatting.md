# Prettier e Biome

## Resumo

O projeto passou a ter formatação automática padronizada por Prettier e Biome.

## Alterações

- Adicionados `prettier` e `@biomejs/biome` às dependências de desenvolvimento.
- Criados `.prettierrc.json`, `.prettierignore` e `biome.json`.
- Criados os scripts `format`, `format:check` e `biome` no `package.json`.
- O comando `npm run format` executa Prettier e, depois, Biome em modo de escrita.
- Biome foi configurado para usar diretivas do Tailwind CSS v4 e processar somente os diretórios de código do projeto.

## Convenções

- Formatação usa 2 espaços, aspas duplas, ponto e vírgula, vírgulas finais e largura de linha de 120 caracteres.
- `.agents/skills` é ignorado pelo Prettier por conter recursos de agentes protegidos, fora do código da aplicação.

## Validação

- `npm.cmd run format`, `npm.cmd run format:check`, `npm.cmd run biome`, `npm.cmd run lint` e `npx.cmd tsc --noEmit` concluídos com sucesso.
