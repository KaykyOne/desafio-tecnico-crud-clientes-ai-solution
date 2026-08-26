# Bloqueio de duplicados na importação de OFX

## Resumo

A importação de extrato OFX agora verifica, antes de cadastrar, se já existe um lançamento com a mesma data, valor e descrição. Se encontrar, abre um passo de revisão (mesmo `DialogRoot` da importação, trocando de conteúdo) listando os duplicados, deixando o usuário escolher quais quer importar mesmo assim, ou ignorar todos de uma vez — os lançamentos que não são duplicados continuam sendo importados normalmente.

## Arquivos alterados

- `hooks/use-financeiro.ts` (nova função `findDuplicates`)
- `app/dashboard/financeiro/_components/import-ofx-dialog.tsx` (novo passo de revisão de duplicados)
- `app/dashboard/financeiro/page.tsx` (passa `findDuplicates` pro diálogo)

## Alterações

- `findDuplicates(inputs)`: busca no Supabase os lançamentos do usuário no intervalo de datas coberto pelo lote a importar (`gte`/`lte` em `data`), monta uma chave `data::valor::descrição normalizada` pros existentes e devolve, por referência, quais itens do lote batem com algum já cadastrado. Precisou ser uma consulta própria (não reaproveitar `records` da tela) porque a listagem principal é filtrada por tipo e não representaria todo o histórico.
- `ImportOfxDialog` ganhou um terceiro passo (além de "selecionar arquivo" e "revisar grupos"): ao clicar em "Importar N lançamentos", primeiro chama `findDuplicates`; se vier algo, mostra a lista de duplicados com checkbox (desmarcado por padrão) e troca o rodapé para "Ignorar duplicados" / "Importar selecionados". Só quando não há duplicado (ou depois de resolvido) é que `onImport` é chamado de fato.
- "Ignorar duplicados" importa só os não-duplicados; se não sobrar nenhum, só fecha o diálogo com um aviso, sem chamar `onImport` à toa.

## Decisões

- Duplicado é definido exatamente como o usuário pediu: mesma data, mesmo valor e mesma descrição (normalizada por trim + minúsculas) — não usa o `fitid` (esse já tinha uma proteção própria, via `unique (user_id, fitid)` no banco, para reimportação do mesmo arquivo).
- A checagem de duplicados é um passo dentro do mesmo diálogo de importação (não um `DialogRoot` aninhado) — mantém consistência com o resto do projeto, que nunca empilha dois `DialogRoot` do Base UI ao mesmo tempo.

## Estado atual

Testado ponta a ponta contra o Supabase real: cadastrei um lançamento manual e importei um OFX de teste com uma transação idêntica e outra nova — a nova entrou direto, a duplicada foi barrada e exigiu confirmação. Testados os três caminhos: ignorar (não duplicou), selecionar e importar (duplicou de propósito) e reimportar o mesmo arquivo depois (as duas agora aparecem como duplicadas, confirmando que a checagem usa o estado real do banco). `tsc --noEmit` e `npm run lint` limpos. Dados de teste apagados ao final.

## Pendências

- Nenhuma.
