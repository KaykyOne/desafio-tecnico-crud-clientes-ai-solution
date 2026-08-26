# Rebrand: ClienteApp → izi Freelas

## Resumo

Trocado o nome do produto de "ClienteApp" para "izi Freelas" em toda a interface (logo, título da aba, textos de marca) e no README. A pasta do projeto e o `name` em `package.json` (já era genérico, "meu-app", nunca refletiu "ClienteApp") não foram alterados.

## Arquivos alterados

- `app/dashboard/_components/dashboard-sidebar.tsx` — badge do logo (`CA` → `iF`), texto da marca (2x), avatar da conta (`CA` → `iF`) e rótulo da conta.
- `app/_components/auth-brand.tsx` — nome da marca nas versões compacta e completa.
- `app/layout.tsx` — `<title>` da página.
- `app/dashboard/page.tsx` — badge do card de boas-vindas (`CA` → `iF`) e texto "Bem-vindo ao...".
- `app/_components/landing-page.tsx` — seção "Sobre o sistema" e faixa de CTA final.
- `README.md` — título e parágrafo de abertura (também atualizado pra mencionar os módulos atuais — tarefas, financeiro, agenda — já que o texto antigo só falava de clientes).

## Decisões

- Iniciais do logo trocadas de `CA` para `iF` (izi Freelas).
- Não mexi no `favicon.ico` (arquivo binário, fora do alcance de edição de texto) nem no `name` do `package.json` (já era um identificador genérico, nunca representou "ClienteApp").
- Não editei os arquivos antigos em `.agents/context/*.md` que mencionam "ClienteApp" — são registros históricos do estado em cada data, não documentação viva.
- Só troquei o nome/marca — não reescrevi a copy de marketing além do necessário para encaixar o novo nome nas frases existentes.

## Estado atual

Testado no dev server, logado: `<title>` da aba, logo da sidebar, avatar da conta, card de boas-vindas do dashboard e landing page todos mostram "izi Freelas"/"iF" corretamente, em claro e sem nenhuma sobra de "ClienteApp" no código-fonte fora dos logs históricos. `tsc --noEmit` e `npm run lint` limpos.

## Pendências

- Nenhuma.
