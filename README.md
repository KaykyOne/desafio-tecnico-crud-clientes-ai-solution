# ClienteApp

ClienteApp é uma aplicação web para gerenciamento de clientes. A plataforma permite autenticar usuários, cadastrar e organizar contatos, acompanhar o status da carteira e atualizar os dados da conta.

## Funcionalidades

- Landing page de apresentação.
- Login com Supabase Auth e feedback por toasts.
- Proteção da área autenticada.
- Dashboard com navegação lateral.
- CRUD de clientes: criar, listar, editar e excluir.
- Kanban de tarefas: criar, editar, excluir, mover entre colunas configuráveis e gerenciar as próprias colunas.
- Busca por nome, contato ou status.
- Indicadores de clientes ativos e inativos.
- Configurações de nome, e-mail e senha.
- Logout automático após alteração de e-mail ou senha.
- Interface responsiva em estilo shadcn, com paleta monocromática.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Apresentação do projeto |
| `/login` | Login do usuário |
| `/dashboard` | Visão geral da área autenticada |
| `/dashboard/clients` | Gerenciamento de clientes |
| `/dashboard/tasks` | Board Kanban para gerenciamento de tarefas |
| `/dashboard/settings` | Configurações da conta |

## Stack

- Next.js 16 com App Router.
- React 19 e TypeScript.
- Supabase Auth e banco de dados.
- Tailwind CSS 4.
- Componentes locais baseados em shadcn/ui.
- Base UI para primitives acessíveis.
- Sonner para notificações.

## Como executar

### Pré-requisitos

- Node.js 20 ou superior.
- Um projeto Supabase configurado.

### Instalação

```bash
npm install
```

Crie um arquivo `.env` a partir do `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=seu_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa o ESLint |

## Organização do código

```text
app/                 Rotas e páginas do App Router
app/dashboard/       Área autenticada e telas do CRUD
components/ui/       Primitives reutilizáveis inspiradas no shadcn/ui
hooks/               Autenticação, perfil, logout e clientes
lib/                 Utilitários e configuração compartilhada
public/               Arquivos estáticos
```

## Pacotes utilizados

### Dependências de aplicação

| Pacote | Uso resumido |
| --- | --- |
| `@base-ui/react` | Primitives acessíveis para botões, inputs, dialogs e outros componentes de UI. |
| `@dnd-kit/core` e `@dnd-kit/sortable` | Drag-and-drop acessível para o board de tarefas. |
| `@supabase/ssr` | Suporte do Supabase para cenários SSR e integração com frameworks. |
| `@supabase/supabase-js` | Cliente JavaScript usado para autenticação e operações no Supabase. |
| `class-variance-authority` | Criação de variantes tipadas para componentes como Button e Badge. |
| `clsx` | Composição condicional de classes CSS. |
| `cmdk` | Base para interfaces de comandos e busca rápida. |
| `dotenv` | Carregamento de variáveis de ambiente. |
| `embla-carousel-react` | Motor de carrossel para React. |
| `input-otp` | Componentes para entrada de códigos OTP. |
| `lucide-react` | Biblioteca de ícones React. |
| `next` | Framework principal da aplicação. |
| `next-themes` | Gerenciamento de tema para componentes compatíveis. |
| `react` | Biblioteca de construção da interface. |
| `react-day-picker` | Seletor de datas. |
| `react-dom` | Renderização do React no navegador. |
| `react-resizable-panels` | Painéis redimensionáveis. |
| `recharts` | Gráficos e visualizações de dados. |
| `sonner` | Toasts de sucesso, erro e aviso. |
| `tailwind-merge` | Mesclagem inteligente de classes Tailwind. |
| `zod` | Validação e definição de schemas TypeScript/JavaScript. |

### Dependências de desenvolvimento

| Pacote | Uso resumido |
| --- | --- |
| `@tailwindcss/postcss` | Integração do Tailwind CSS com PostCSS. |
| `@types/node` | Tipos TypeScript para APIs do Node.js. |
| `@types/react` | Tipos TypeScript para React. |
| `@types/react-dom` | Tipos TypeScript para React DOM. |
| `eslint` | Linter para identificar problemas no código. |
| `eslint-config-next` | Regras do ESLint específicas para Next.js. |
| `tailwindcss` | Framework utilitário de estilos. |
| `typescript` | Tipagem estática e compilação TypeScript. |

> O projeto usa componentes locais inspirados no shadcn/ui. Por isso, `shadcn/ui` não aparece como uma dependência única no `package.json`; os componentes ficam versionados em `components/ui`.
