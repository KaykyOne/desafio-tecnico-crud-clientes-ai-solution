# Rework visual da landing page focado em conversão do "grátis"

## Resumo

A landing page foi reescrita de ponta a ponta para vender o izi Freelas como SaaS gratuito: copy orientada a benefício (não a feature), "100% grátis" repetido em selo no hero, no botão principal, na seção de Plano único, no FAQ e no CTA final. A página saiu de 4 seções para 9, com nova arquitetura de informação e uso de `Collapsible` (Base UI) no FAQ. Tudo dentro da paleta monocromática e com os componentes shadcn locais — sem testemunhos, números ou marcas inventadas.

## Arquivos alterados

- `app/_components/landing-page.tsx`

## Alterações

- Adicionado selo "100% grátis · Sem cartão de crédito" no hero, dentro de um `Badge variant="default"` (escuro, com `Sparkles`). O mesmo selo reaparece no CTA final invertido (escuro no fundo claro → claro no fundo escuro).
- Headline trocada de descritiva ("Clientes, tarefas e financeiro. Tudo em um só lugar.") para dor/desejo ("Menos planilha, mais trabalho entregue."). Subhead refoca no freelancer solo e na ausência de mensalidade.
- Microcopy de confiança logo abaixo dos CTAs: "Sem mensalidade. Sem data de validade. Sem letras miúdas." com ícone `Check`.
- Strip "Tudo o que você precisa num só lugar" — 4 pílulas com os módulos (Clientes, Tarefas, Agenda, Financeiro), usando os mesmos ícones do sidebar (`UsersRound`, `KanbanSquare`, `CalendarDays`, `Wallet`) pra coerência de marca entre o site e o app logado. Reforça a tese "tudo num só" sem repetir cards.
- Seção "Por que escolher o izi Freelas" — 3 valores (Sem complicação / Sem custo, sem pegadinha / Seus dados, seu controle), cada um com ícone em pílula `bg-foreground text-background`. Diferencia "o que faz" de "por que vale".
- Seção "Como funciona" — 3 passos numerados (01/02/03), com número gigante em `text-foreground/15` e separador horizontal entre número e texto. Reduz a barreira mental de começar.
- Mantida a seção de 3 cards de módulos com foto, mas com hover-state mais suave (`hover:bg-muted/20` em vez de só `grayscale-0` na imagem).
- Nova seção "Feito pra quem é" — grid de 6 personas (Designers, Devs, Social media, Consultores, Prestadores, Pequenos negócios) com ícones representativos.
- Nova seção de Plano único — card bicolor com `bg-foreground` à esquerda (preço "R$ 0 /para sempre" + selo "Plano único" + CTA) e checklist de funcionalidades à direita. Mata a objeção "será que é realmente grátis?" antes do FAQ.
- Nova seção de FAQ — 4 perguntas em `Collapsible` (Base UI), com ícone `+` que rotaciona 45° quando aberto. Perguntas: "É realmente grátis?", "Preciso cadastrar cartão?", "Vai continuar grátis no futuro?", "Meus dados estão seguros?".
- CTA final — faixa `bg-foreground` com selo, título ("Pronto para parar de pular entre planilhas?"), dois botões (criar + entrar) e microcopy "Menos de 1 minuto para começar" com ícone `Clock`.

## Decisões

- **Mantida a paleta monocromática** do app (`bg-foreground` + `bg-background` + `bg-muted` + bordas `ring-foreground/10`). Nenhum chip verde/azul, mesmo onde o tema "free" convidaria (os checks são pretos no círculo preto, em vez de verde).
- **Reaproveitados os componentes locais** do shadcn: `Button` (variants `foreground`, `outline`, `secondary`, `ghost`), `Card` (namespace), `Badge` (default e secondary, com override de cores no fundo escuro), `Avatar` (namespace), `Separator`, `Collapsible` (novo, do Base UI).
- **`Collapsible` do Base UI usa `data-open` no Root/Panel e `data-panel-open` no Trigger** (verificado lendo `node_modules/@base-ui/react/collapsible/{root,panel,trigger,utils/collapsibleOpenStateMapping}.js`). Classes de animação usam `data-[starting-style]:` e `data-[ending-style]:`. A rotação do `+` no trigger foi feita com `group-data-[open]:rotate-45` (e não `data-[panel-open]`, que é só do trigger, não do root).
- **Sem testemunhos, sem números, sem logos** — a regra de não inventar social proof do contexto `2026-08-26-landing-page-redesign.md` foi mantida. A confiança é construída por (a) copy direta sobre ser grátis, (b) FAQ que responde as objeções literalmente, (c) lista de features concretas no plano único.
- **Mantidas as 3 fotos do Unsplash já verificadas** (aperto de mão, post-its, gráficos) e o tratamento `grayscale` com `hover:grayscale-0` nos cards de módulo. A foto da "pessoa no laptop" da seção "Sobre o sistema" foi removida — a página está mais limpa sem ela e o espaço foi absorvido pelas seções de valor/FAQ.
- **Adicionado o ícone `CalendarDays` no strip de módulos** porque o app tem agenda (ver `app/dashboard/agenda/page.tsx`), mas a landing anterior não mencionava — agora o usuário descobre esse módulo na própria apresentação.
- **Hero usa `min-h-[calc(100vh-220px)]`** pra considerar a altura do nav (que é menor que antes) e ainda preencher a primeira dobra sem causar scroll horizontal. A dobra inferior das seções subsequentes (com `py-20`/`py-24`) gera a respiração.

## Estado atual

`npx tsc --noEmit` limpo, `npm run lint` limpo (0 errors, 0 warnings) e `npm run build` gerou as 12 páginas estáticas com sucesso. Página responsiva em 3 breakpoints (sm/md/lg), com a hierarquia tipográfica escalando de `text-5xl` no mobile para `text-7xl` no lg no hero, e de `text-3xl` para `text-4xl` nos h2.

## Pendências

- Verificar visualmente no dev server contra o comportamento real dos accordions (a animação de altura depende do Base UI medindo o conteúdo — pode haver leve jitter no primeiro frame, mas o fallback `data-[open]:animate-none` cobre o caso). Não foi possível testar com a ferramenta de browser headless nesta sessão.
