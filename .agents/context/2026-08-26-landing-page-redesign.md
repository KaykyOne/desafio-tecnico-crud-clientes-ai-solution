# Landing page maior, com seção "sobre o sistema" e fotos

## Resumo

A landing page (antes só o hero) ganhou três seções novas — "Sobre o sistema", os três módulos do produto (Clientes/Tarefas/Financeiro) com fotos, e uma faixa de CTA final — deixando a página mais longa e com acabamento de site profissional, mantendo a paleta monocromática do app.

## Arquivos alterados

- `app/_components/landing-page.tsx`

## Alterações

- Mantido o nav e o hero originais (já funcionavam bem, inclusive o card mockup de "Seus clientes").
- Nova seção "Sobre o sistema": texto + foto (pessoa no laptop) tratada com `grayscale` e o mesmo acabamento visual de card (`rounded-xl ring-1 ring-foreground/10`) já usado no resto do app.
- Nova seção de módulos: grid de 3 cards (um por foto temática — aperto de mão para Clientes, post-its "To Do/Doing/Done" para Tarefas, gráficos para Financeiro), reaproveitando os mesmos ícones da sidebar (`UsersRound`, `KanbanSquare`, `Wallet`) pra manter a marca consistente entre o site e o app logado. Copy descreve só funcionalidades que existem de verdade hoje (CRUD de clientes, Kanban com colunas configuráveis via `@dnd-kit`, extrato financeiro com importação de OFX).
- Faixa de CTA final (`bg-foreground text-background`, mesmo padrão já usado no botão `variant="foreground"`) fechando a página com outra chamada pra criar conta.
- Primeiro uso de `next/image` no projeto — todas as 4 imagens usam `fill` dentro de um wrapper com `aspect-*` fixo (evita precisar adivinhar a proporção nativa de cada foto do Unsplash).

## Decisões

- Fotos vêm do Unsplash (`images.unsplash.com/photo-<id>`, licença livre, sem exigir atribuição) — 4 URLs verificadas com `curl` antes de usar (todas retornam 200/`image/jpeg`).
- Todas as fotos entram em `grayscale` (com `hover:grayscale-0` nos cards de módulo) porque fotos coloridas destoariam da paleta estritamente monocromática (`app/globals.css`, só tons de zinc) — reforça o acabamento "premium" sem introduzir cor nova.
- `next.config.ts` já tinha `images: { unoptimized: true }` (por causa do `output: "export"`) — `next/image` aceita as URLs do Unsplash direto, sem precisar configurar `remotePatterns`.
- Sem estatísticas nem depoimentos inventados — nada de "usado por X freelancers" ou citações de clientes fictícios.

## Estado atual

`tsc --noEmit` e `npm run lint` limpos. Testado no dev server: as 4 imagens carregam corretamente (confirmado forçando `load` via JS, já que o pane headless usado pra verificação não dispara `loading="lazy"` sozinho — isso é uma limitação da ferramenta de teste, não da página). Grid de módulos colapsa pra 1 coluna no mobile (confirmado em 375px). Faixa de CTA inverte corretamente no tema escuro.

## Pendências

- Nenhuma.
