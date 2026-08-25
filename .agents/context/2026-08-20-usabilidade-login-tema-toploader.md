# Melhorias de usabilidade: salvar login, tema escuro e barra de carregamento

## Resumo

Adicionadas três melhorias de qualidade de uso: opção "salvar login" (persistindo e-mail/senha em `localStorage`, marcada por padrão), sistema de temas com tema escuro via `next-themes` e barra de progresso no topo da página durante navegações, usando `nextjs-toploader`.

## Arquivos alterados

- `app/login/_components/login-form.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/dashboard/_components/dashboard-sidebar.tsx`
- `components/theme-provider.tsx` (novo)
- `app/dashboard/_components/theme-toggle.tsx` (novo)
- `package.json` (nova dependência `nextjs-toploader`)
- `.claude/launch.json` (novo, configuração local para preview do dev server)

## Alterações

- Checkbox "Salvar login neste dispositivo" no formulário de login, marcada por padrão. Ao enviar o formulário, e-mail e senha são gravados em `localStorage` (`clienteapp:remember-login`); ao desmarcar, os dados salvos são removidos. No próximo acesso, os campos são pré-preenchidos a partir do `localStorage`.
- `components/theme-provider.tsx` encapsula `ThemeProvider` do `next-themes` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`), agora usado em `app/layout.tsx` envolvendo o `body`.
- `app/dashboard/_components/theme-toggle.tsx`: switch com ícones sol/lua na sidebar, alternando entre os temas claro e escuro via `useTheme()`.
- `NextTopLoader` adicionado em `app/layout.tsx`, cor ligada a `var(--foreground)` para acompanhar o tema ativo.
- **Correção necessária em `app/globals.css`**: o bloco `@theme inline` só registrava `--color-background` e `--color-foreground`. Como resultado, todas as demais classes semânticas (`bg-primary`, `bg-card`, `bg-secondary`, `bg-muted`, `bg-accent`, `bg-destructive`, `border-input`, `ring-ring` etc.) não geravam nenhuma regra CSS em nenhum lugar do app — confirmado via inspeção do `computed style` do botão de login antes da correção (`background-color` resolvia para `transparent`). Foram registrados todos os tokens de cor faltantes no `@theme inline`, adicionado bloco `.dark { ... }` com a paleta escura (mesma base monocromática zinc) e adicionado `@custom-variant dark (&:where(.dark, .dark *));`, exigido pelo Tailwind v4 para que as classes `dark:` já usadas nos componentes (`button.tsx`, `checkbox.tsx`, `switch.tsx` etc.) respondam à classe `.dark` do `next-themes` em vez de apenas `prefers-color-scheme`.

## Decisões

- Credenciais do "salvar login" ficam em `localStorage` em texto puro, por pedido explícito do usuário — é um risco real caso haja XSS na aplicação; não foi adicionada nenhuma camada de ofuscação/criptografia porque uma chave gerada no próprio cliente não mitigaria o risco de verdade.
- Tema escuro reaproveita a mesma paleta monocromática (zinc) já usada no tema claro, apenas invertendo os papéis de `background`/`foreground` e derivados — mantém a identidade visual "monocromática" descrita no README.
- Preferência de tema é persistida automaticamente pelo `next-themes` (via `localStorage`, chave padrão `theme`), sem necessidade de lógica adicional.
- Adicionado `.claude/launch.json` para permitir preview do `npm run dev` durante a verificação; não é uma decisão de produto, apenas tooling local.

## Estado atual

- Login salva e recupera e-mail/senha do dispositivo quando a opção está marcada (padrão); testado end-to-end no navegador.
- Alternância de tema funciona e persiste entre reloads; testado via inspeção de `computed style` em modo claro e escuro.
- Barra de progresso aparece durante navegações entre páginas.
- Todas as classes de cor semânticas (`bg-primary`, `bg-card` etc.) agora geram CSS corretamente em ambos os temas — isso também corrige a aparência de componentes que já existiam antes desta tarefa (botões, badges, cards, dialogs) e que provavelmente estavam renderizando sem cor de fundo.

## Pendências

- Nenhuma relacionada às três funcionalidades pedidas. A tabela `tasks`/Kanban planejada em `task/kanban-tasks.md` continua pendente de implementação.
