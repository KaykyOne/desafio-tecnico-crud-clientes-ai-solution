# Dashboard (visão geral)

## Resumo

A primeira tela após o login deixou de ser um painel estático de boas-vindas e virou um resumo do negócio: saudação personalizada que varia por período do dia, ganhos e gastos dos últimos 7 dias (clicáveis, abrindo lista detalhada), novos clientes dos últimos 7 dias (mesmo tratamento) e a contagem de tarefas para hoje, para amanhã e pendentes. Visual minimalista, bastante respiro, tipografia leve.

## Arquivos alterados

- `app/dashboard/page.tsx` — reescrito (era estático, 16 linhas, sem hooks).
- `app/dashboard/_components/overview-metric-card.tsx` (novo) — card de métrica, clicável quando tem dado.
- `app/dashboard/_components/overview-detail-dialog.tsx` (novo) — modal genérico de lista.
- `lib/greeting.ts` (novo) — as 12 saudações (3 por período) e a montagem.
- `hooks/use-financeiro.ts` — passou a aceitar um período inicial opcional + `getLastDaysPeriod(days)`.

Sem SQL. Tudo derivado do que os hooks já carregam.

## Alterações

- **Saudação:** 3 variações por período — madrugada (0–5h), manhã (5–12h), tarde (12–18h) e noite (18h+) — usando o primeiro nome do usuário (`user_metadata.full_name`, via `useProfile`).
- **Últimos 7 dias:** cards de Ganhos, Gastos e Novos clientes. Cada um abre um modal com a lista detalhada. Sem dado, o card mostra "Sem ganhos" / "Sem gastos" / "Sem novos clientes" e deixa de ser clicável.
- **Tarefas:** para hoje, para amanhã e pendentes.
- `useFinanceiro` ganhou parâmetro opcional de período inicial, pra esta tela buscar direto a janela de 7 dias em vez de carregar o mês e refazer a consulta.

## Decisões

- **"Pendentes" = entrega hoje ou antes** (`due_date <= hoje`). Definição pedida pelo usuário depois que a alternativa apareceu: a tabela `tasks` **não tem estado de concluída** — a tarefa só muda de coluna, e as colunas são configuráveis, então não dá pra assumir que a última coluna significa "feito". Contar por data é a única regra que não inventa semântica que o schema não tem.
- **Relógio e sorteio ficam num inicializador de `useState`, nunca no render.** São duas impurezas: `new Date()` e `Math.random()`. No corpo do render a frase trocaria sozinha a cada re-renderização, e o `eslint-plugin-react-hooks` barra as duas coisas (`react-hooks/purity`). No inicializador é permitido e roda uma vez só.
- **Sem risco de hydration mismatch**, apesar de o app ser `output: "export"` (a página é pré-renderizada no build): a saudação só é exibida quando `profile.name` já carregou, e isso é assíncrono. Na hidratação o nome ainda está vazio nos dois lados, então nada é renderizado ali e não há o que divergir. O inicializador do `useState` roda também no cliente, então a hora usada é a real do usuário — não a do build.
- **Comparação de cliente por data:** `created_at` é `timestamptz` (timestamp completo), então o filtro compara `created_at.slice(0, 10)` com a data ISO em vez de instanciar `Date` — evita o deslocamento de fuso que faria um cliente cadastrado à noite cair no dia errado.
- **`OverviewDetailDialog` é genérico** (`primary` / `secondary` / `trailing`), então serve tanto pra lançamento financeiro quanto pra cliente, e serve pro próximo card que precisar de detalhe sem componente novo.
- **Card sem dado não é clicável** — abrir um modal vazio seria um beco sem saída.
- O modal segue o mesmo padrão já usado no resto do app: montado condicionalmente com `open` fixo, fechando ao anular o estado no pai.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos; a rota `/dashboard` compila e responde 200 no dev server.

**Não verificado no navegador** — a sessão do preview estava deslogada e a tela fica atrás de autenticação.

## Pendências

- Verificar visualmente: a saudação com nome real, os três estados vazios, e os modais de ganhos/gastos/clientes.
- Conferir se a saudação sorteia variações diferentes entre recarregamentos.
