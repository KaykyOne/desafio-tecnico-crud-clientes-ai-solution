# Kanban usável no celular

## Resumo

O quadro de tarefas era praticamente inutilizável no celular por duas causas somadas: as colunas empilhavam na vertical (o `grid auto-fit minmax(18rem,1fr)` vira uma coluna só a 375px, gerando ~2000px de rolagem antes de ver qualquer coisa) e o card sequestrava o toque, deixando a página quase impossível de rolar. Agora o quadro rola horizontalmente com encaixe (snap) no mobile, arrastar por toque exige segurar o card por um instante, e existe um caminho pra mover a tarefa sem arrastar nada.

## Arquivos alterados

- `app/dashboard/tasks/_components/kanban-board.tsx` — container e colunas com classes de carrossel no mobile.
- `app/dashboard/tasks/page.tsx` — sensores do dnd-kit, texto de ajuda por plataforma, novas props do Sheet.
- `app/dashboard/tasks/_components/task-card.tsx` — remoção do `touch-none`, botão de mover, `stopPropagation` explícito.
- `app/dashboard/tasks/_components/task-quick-edit-sheet.tsx` — seletor de coluna.

Sem SQL e sem mudança nos hooks.

## Alterações

- **Layout:** o container é `flex overflow-x-auto` em **qualquer tamanho** — as colunas nunca quebram pra uma linha de baixo, nem no desktop. O snap é só no mobile (`snap-x snap-mandatory md:snap-none`), porque no desktop ele brigaria com a rolagem por trackpad/shift+scroll.
  - Coluna no mobile: `w-[min(85vw,20rem)] shrink-0 snap-start`. Os `85vw` são de propósito — a próxima coluna "espia" na borda direita, que é a dica visual de que o quadro rola de lado.
  - Coluna no desktop: `md:w-auto md:min-w-[18rem] md:flex-1 md:shrink`. O `flex-1` faz as colunas crescerem pra preencher a largura quando há poucas (então com 3 ou 4 colunas a tela continua parecendo a de antes), e o `min-w-[18rem]` é o piso que, quando não cabem todas, empurra o transbordo e liga a rolagem lateral.
- **Sensores:** `PointerSensor { distance: 6 }` virou `MouseSensor { distance: 6 }` + `TouchSensor { delay: 220, tolerance: 6 }`.
- **`touch-none` removido** do card (virou `touch-manipulation`).
- **Seletor "Coluna"** no Sheet de edição rápida, ligado ao `updateTaskColumn` que já existia.
- **Botão de mover** (`ArrowRightLeft`) na linha de ações do card, que já é sempre visível no mobile.

## Decisões

- **Rolagem horizontal em vez de abas.** As abas eram tentadoras (`components/ui/tabs.tsx` existe e estava sem uso), mas o `Panel` do base-ui desmonta os painéis inativos — os alvos de drop das outras colunas sumiriam do DOM e arrastar entre colunas ficaria estruturalmente impossível no celular. Além disso, como as colunas são configuráveis em número, a própria lista de abas teria que rolar horizontalmente: o mesmo problema, sem a adjacência entre colunas. Também segue o idioma que o app já usa no menu lateral (`overflow-x-auto` que vira coluna no `lg`).
- **Breakpoint `md` (768px), não o `lg` do shell.** O shell quebra no `lg` porque é quando a sidebar cabe ao lado. Aqui a restrição é outra — a partir de ~600px já cabem duas colunas de 18rem, então tablet merece o comportamento de desktop. A divergência é intencional.
- **O grid `auto-fit` foi abandonado também no desktop** (decisão do usuário, numa segunda passada): ele quebrava as colunas pra uma linha de baixo quando havia muitas, o que num Kanban é pior que rolar de lado — cada linha nova empurra o quadro pra fora da tela verticalmente e as colunas deixam de estar lado a lado. Com `flex-1` + `min-w`, o caso de poucas colunas continua idêntico ao grid (elas preenchem a largura) e o caso de muitas vira rolagem lateral em vez de quebra.
- **Mouse e toque em sensores separados, em vez de um `delay` no PointerSensor.** O PointerSensor atende os dois pelo mesmo caminho, então um `delay` ali obrigaria o desktop a segurar o mouse parado 220ms antes de todo arrasto — regressão clara. Separando, o mouse mantém `distance: 6` (comportamento de desktop idêntico ao anterior) e o atraso vale só pro dedo. Bônus: a escolha passa a ser por *tipo de entrada* e não por largura de tela, então um notebook com touchscreen recebe os dois comportamentos corretamente — coisa que media query nunca faria.
- **`touch-none` era a causa direta da página não rolar.** `touch-action: none` diz ao navegador "nunca role a partir deste elemento", e como os listeners de arrasto ficam no `<article>` inteiro, os cards cobriam quase todo o quadro. Com o sensor por atraso a classe não é só desnecessária, é contraproducente: o sensor *precisa* que o navegador seja dono do gesto até a ativação. Não foi trocada por `touch-pan-y` porque agora o quadro também rola na horizontal.
- **Nenhum `useMediaQuery` foi criado.** O app é `output: "export"`: o HTML é gerado no build sem `window`, então render condicional por largura causaria mismatch de hidratação ou um flash de layout na primeira pintura do quadro. Tudo aqui é breakpoint CSS ou tipo de entrada.
- **O botão de mover não é opcional.** O Sheet só abria clicando no Badge de prioridade, e nada sinalizava isso. Sem uma porta visível, o caminho sem-arrastar não existiria na prática.

## Trade-off assumido

`delay: 220` + `tolerance: 6` significa que o dedo precisa ficar 220ms dentro de 6px pra iniciar o arrasto; mover antes disso cancela a ativação e a página rola normalmente. O custo é ~1/4 de segundo de espera e um arrasto falho ocasional quando o dedo escorrega. O ganho é a página voltar a rolar, que era o problema todo. 220ms fica na janela convencional de 200–250ms: abaixo de ~150ms voltam os arrastos acidentais ao folhear o quadro, acima de ~400ms passa a parecer travado.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. **Não verificado no navegador**: a sessão do preview estava deslogada e o Kanban fica atrás de autenticação. Falta confirmar num viewport de celular: (a) que a página rola verticalmente com um deslize normal — este é o teste principal; (b) que o quadro rola de lado com encaixe; (c) que segurar ~250ms inicia o arrasto; (d) que o desktop ficou idêntico.

## Pendências

- Verificação visual no celular/viewport mobile.
- **Risco conhecido a olhar no aparelho real:** a alça `GripVertical` de reordenar colunas usa `rectSortingStrategy`, que assume um grid; dentro de um scroller horizontal o transform durante o reorder pode ficar estranho. É interação secundária (o diálogo "Gerenciar colunas" já é o caminho principal). Se atrapalhar, esconder a alça abaixo de `md` e deixar o diálogo cuidar disso no celular.
