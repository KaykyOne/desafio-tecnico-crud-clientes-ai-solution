# Build de PR e deploy estático no GitHub Pages

## Resumo

O workflow do Next.js foi ajustado para validar pull requests destinados à `main` e publicar o site estático somente após push ou merge na `main`.

## Arquivos alterados

- `.github/workflows/nextjs.yml`

## Alterações

- Pull requests para `main` executam instalação e build, sem publicar no GitHub Pages.
- Pushes na `main` e execuções manuais geram o diretório `out`, enviam o artefato e fazem o deploy.
- O build recebe `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pelos Actions Secrets.
- O workflow valida a presença das variáveis sem exibir seus valores.
- A instalação usa `npm ci`, cache do npm e cache incremental do Next.js com Node.js 22.
- As permissões de escrita do GitHub Pages ficam restritas ao job de deploy.

## Decisões

- As variáveis `NEXT_PUBLIC_` são incorporadas ao bundle no momento do build; portanto, os Secrets devem estar configurados antes da validação do PR e do deploy.
- Pull requests originados de forks não recebem Actions Secrets e falharão na validação do ambiente por segurança do GitHub.
- O deploy continua usando a exportação estática existente em `next.config.ts` e o diretório `out`.

## Estado atual

O mesmo build valida PRs e, quando executado para a `main`, alimenta o deploy estático no GitHub Pages.

## Pendências

- Cadastrar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em Settings > Secrets and variables > Actions.
- Garantir que a origem do GitHub Pages esteja configurada como GitHub Actions.
