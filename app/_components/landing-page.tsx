"use client";

//* Components Imports
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Collapsible from "@/components/ui/collapsible";
import Separator from "@/components/ui/separator";

import { AuthBrand } from "./auth-brand";
import { SiteFooter } from "./site-footer";

//* Libraries Imports
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Check,
  Clock,
  Code2,
  KanbanSquare,
  Megaphone,
  Palette,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wallet,
  Wallet2,
  Zap,
} from "lucide-react";

type ModuleItem = {
  icon: typeof UsersRound;
  title: string;
  description: string;
  image: string;
  alt: string;
};

const modules: ModuleItem[] = [
  {
    icon: UsersRound,
    title: "Clientes",
    description: "Cadastre, edite e busque sua carteira de clientes, com indicadores de quem está ativo ou inativo.",
    image: "https://images.unsplash.com/photo-1758518730384-be3d205838e8?auto=format&fit=crop&q=80&w=800",
    alt: "Aperto de mão profissional entre dois parceiros de negócio",
  },
  {
    icon: KanbanSquare,
    title: "Tarefas",
    description: "Um Kanban com colunas que você mesmo configura, e arrasta e solta pra acompanhar cada entrega.",
    image: "https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?auto=format&fit=crop&q=80&w=800",
    alt: "Post-its organizados em colunas de tarefa a fazer, em andamento e concluída",
  },
  {
    icon: Wallet,
    title: "Financeiro",
    description:
      "Extrato de gastos, gastos fixos recorrentes e ganhos — inclusive importando o extrato do seu banco em OFX.",
    image: "https://images.unsplash.com/photo-1767424412548-1a1ac7f4b9bc?auto=format&fit=crop&q=80&w=800",
    alt: "Telas com gráficos de análise financeira",
  },
];

type ValueItem = {
  icon: typeof Zap;
  title: string;
  description: string;
};

const values: ValueItem[] = [
  {
    icon: Zap,
    title: "Sem complicação",
    description: "Sem setup de horas, sem curva de aprendizado. Você cria a conta e já sai usando — sem tutorial obrigatório.",
  },
  {
    icon: Wallet2,
    title: "Sem custo, sem pegadinha",
    description: "É grátis e ponto. Não tem plano premium escondido, não tem cobrança por usuário, não tem limite que some do dia pra noite.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados, seu controle",
    description: "Tudo fica no Supabase com criptografia e login pelo Google. Nada de lock-in: seus dados são seus, pra sempre.",
  },
];

type StepItem = {
  number: string;
  title: string;
  description: string;
};

const steps: StepItem[] = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Menos de 1 minuto, com e-mail e senha. Sem cartão de crédito, sem confirmação por telefone.",
  },
  {
    number: "02",
    title: "Cadastre seus clientes",
    description: "Adicione nome, contato e status. A busca e os indicadores de ativo/inativo já estão prontos pra usar.",
  },
  {
    number: "03",
    title: "Organize o resto",
    description: "Suba tarefas pro Kanban, marque compromissos na agenda e controle o financeiro no mesmo lugar.",
  },
];

type PersonaItem = {
  icon: typeof Palette;
  label: string;
};

const personas: PersonaItem[] = [
  { icon: Palette, label: "Designers freelancers" },
  { icon: Code2, label: "Devs e programadores" },
  { icon: Megaphone, label: "Social media e marketing" },
  { icon: Briefcase, label: "Consultores e coaches" },
  { icon: Sparkles, label: "Prestadores de serviço" },
  { icon: UsersRound, label: "Pequenos negócios" },
];

type PlanFeature = {
  label: string;
};

const planFeatures: PlanFeature[] = [
  { label: "Cadastro ilimitado de clientes" },
  { label: "Kanban de tarefas com colunas configuráveis" },
  { label: "Agenda integrada com seus compromissos" },
  { label: "Financeiro com extrato, fixos e importação OFX" },
  { label: "Login seguro com Supabase Auth" },
  { label: "Acesso por qualquer dispositivo" },
];

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "É realmente grátis? Tem alguma pegadinha?",
    answer:
      "É grátis, sem letras miúdas. Não existe plano premium, não existe versão de teste com data pra expirar e não cobramos nada pelo que está no app hoje. O izi Freelas é mantido como projeto independente.",
  },
  {
    question: "Preciso cadastrar cartão de crédito?",
    answer: "Não. Você cria a conta só com e-mail e senha — sem cartão, sem boleto, sem Pix pra liberar acesso.",
  },
  {
    question: "Vai continuar grátis no futuro?",
    answer: "A ideia é manter o núcleo do produto sempre gratuito. Se um dia surgir algo opcional e pago, será algo novo, nunca o que já funciona hoje.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. A autenticação e o banco usam o Supabase, com criptografia em trânsito e em repouso. Você pode editar ou apagar qualquer registro quando quiser — seus dados são seus.",
  },
];

export function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-muted blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-80 w-80 rounded-full bg-muted blur-3xl" />

      <div className="px-6 py-6 sm:px-10 lg:px-16">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <AuthBrand compact />

          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/login" />}
              variant="ghost"
              className="h-9 px-3 text-sm font-semibold"
            >
              Entrar
            </Button>
            <Button
              render={<Link href="/signup" />}
              variant="foreground"
              className="h-9 px-3 text-sm font-semibold"
            >
              Criar conta grátis
            </Button>
          </div>
        </nav>
      </div>

      <section className="px-6 pt-6 sm:px-10 lg:px-16">
        <div className="mx-auto grid min-h-[calc(100vh-220px)] max-w-6xl items-center gap-14 pb-20 lg:grid-cols-[1.04fr_0.96fr] lg:pb-24">
          <div className="max-w-xl">
            <Badge
              variant="default"
              className="mb-7 h-7 gap-1.5 rounded-full px-3 text-[0.7rem] font-bold uppercase tracking-[0.12em]"
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              100% grátis · Sem cartão de crédito
            </Badge>

            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
              Menos planilha, mais trabalho entregue.
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-muted-foreground">
              O izi Freelas reúne clientes, tarefas, agenda e financeiro num só lugar — feito pra quem toca o negócio
              sozinho e não quer pagar mensalidade de ferramenta corporativa.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                render={<Link href="/signup" />}
                variant="foreground"
                size="lg"
                className="h-12 rounded-md px-6 text-sm font-bold shadow-sm transition duration-200 hover:-translate-y-0.5"
              >
                Criar conta grátis
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
              </Button>
              <Button
                render={<Link href="/login" />}
                variant="outline"
                size="lg"
                className="h-12 rounded-md px-6 text-sm font-bold"
              >
                Já tenho conta
              </Button>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Check className="size-3.5" strokeWidth={3} />
              Sem mensalidade. Sem data de validade. Sem letras miúdas.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-3 rounded-[2rem] border border-foreground/10 bg-muted/40 -rotate-3" />
            <Card.CardRoot className="relative gap-0 overflow-hidden rounded-xl border bg-card py-0 shadow-sm">
              <Card.CardHeader className="mb-3 px-5 pt-5 sm:px-7 sm:pt-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Seus clientes
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">Visão geral</p>
                </div>
                <Card.CardAction>
                  <Badge variant="secondary" className="h-auto px-3 py-1.5 text-xs font-bold">
                    128 ativos
                  </Badge>
                </Card.CardAction>
              </Card.CardHeader>

              <Card.CardContent className="space-y-3 px-5 pb-5 sm:px-7 sm:pb-7">
                {["Marina Costa", "Lucas Almeida", "Ana Beatriz"].map((name) => (
                  <div key={name} className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Avatar.AvatarRoot size="lg" className="rounded-md bg-background">
                      <Avatar.AvatarFallback className="rounded-md bg-background text-sm font-bold">
                        {name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </Avatar.AvatarFallback>
                      <Avatar.AvatarBadge className="bg-foreground" />
                    </Avatar.AvatarRoot>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Cliente cadastrado</p>
                    </div>
                  </div>
                ))}
              </Card.CardContent>
            </Card.CardRoot>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Tudo o que você precisa num só lugar
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: UsersRound, label: "Clientes" },
              { icon: KanbanSquare, label: "Tarefas" },
              { icon: CalendarDays, label: "Agenda" },
              { icon: Wallet, label: "Financeiro" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-full border bg-card px-4 py-2 text-sm font-bold shadow-sm"
              >
                <span className="grid size-7 place-items-center rounded-full bg-foreground text-background">
                  <Icon className="size-3.5" strokeWidth={2.5} />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Por que escolher o izi Freelas
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              Feito pra quem toca o negócio sozinho.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              A maioria das ferramentas obriga você a escolher entre pagar caro, perder horas configurando ou aceitar um
              app raso demais. Aqui, a proposta é simples: tudo que importa, sem custo e sem barreira.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-muted/40"
              >
                <span className="mb-5 flex size-10 items-center justify-center rounded-md bg-foreground text-background">
                  <Icon className="size-4" strokeWidth={2.3} />
                </span>
                <p className="text-base font-bold tracking-tight text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Como funciona</p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              Em três passos você já está usando.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ number, title, description }) => (
              <div
                key={number}
                className="relative rounded-xl border bg-card p-6 shadow-sm"
              >
                <span className="block text-5xl font-bold leading-none tracking-tight text-foreground/15">
                  {number}
                </span>
                <Separator className="my-5 bg-foreground/15" />
                <p className="text-base font-bold tracking-tight text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              O que você organiza aqui
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              Três módulos, um só login.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {modules.map(({ icon: Icon, title, description, image, alt }) => (
              <div
                key={title}
                className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:bg-muted/20"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover grayscale transition duration-300 group-hover:grayscale-0"
                  />
                </div>
                <div className="p-5">
                  <span className="mb-3 flex size-9 items-center justify-center rounded-md bg-muted text-foreground">
                    <Icon className="size-4" />
                  </span>
                  <p className="font-bold text-foreground">{title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Feito pra quem é
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
                Pra quem toca o negócio sozinho.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Se você cobra por projeto, atende cliente final e responde por tudo — do orçamento à entrega —, o izi
                Freelas foi pensado pra você.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {personas.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-foreground">
                    <Icon className="size-4" strokeWidth={2.2} />
                  </span>
                  <span className="text-sm font-bold leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="grid items-start gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-6 bg-foreground p-8 text-background sm:p-10">
                <Badge
                  variant="default"
                  className="h-7 w-fit gap-1.5 rounded-full bg-background px-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-foreground"
                >
                  <Sparkles className="size-3" strokeWidth={2.5} />
                  Plano único
                </Badge>
                <div>
                  <p className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold leading-none tracking-tight">R$ 0</span>
                    <span className="text-sm font-semibold opacity-70">/para sempre</span>
                  </p>
                  <p className="mt-3 text-sm leading-6 opacity-80">
                    Sem cartão de crédito. Sem cobrança escondida. Sem data de expiração.
                  </p>
                </div>

                <Button
                  render={<Link href="/signup" />}
                  variant="secondary"
                  size="lg"
                  className="h-12 w-full rounded-md px-6 text-sm font-bold"
                >
                  Criar conta grátis
                  <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                </Button>
              </div>

              <div className="flex flex-col gap-4 p-8 sm:p-10">
                <p className="text-base font-bold tracking-tight text-foreground">O que está incluso</p>
                <ul className="flex flex-col gap-3">
                  {planFeatures.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3 text-sm leading-6 text-foreground">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-background">
                        <Check className="size-3" strokeWidth={3.5} />
                      </span>
                      <span className="font-medium">{feature.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Perguntas frequentes
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              Ainda tem dúvida? Sem stress.
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqItems.map((item) => (
              <Collapsible.CollapsibleRoot
                key={item.question}
                className="group overflow-hidden rounded-xl border bg-card shadow-sm data-[open]:bg-muted/30"
              >
                <Collapsible.CollapsibleTrigger className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left text-sm font-bold text-foreground outline-none sm:px-6 sm:py-5 sm:text-base group-data-[open]:[&>svg]:rotate-45">
                  {item.question}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border bg-background text-foreground transition-transform duration-200 group-data-[open]:rotate-45">
                    <svg
                      className="size-3.5"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M6 1.5v9M1.5 6h9" />
                    </svg>
                  </span>
                </Collapsible.CollapsibleTrigger>
                <Collapsible.CollapsibleContent className="overflow-hidden text-sm leading-6 text-muted-foreground transition-all data-[starting-style]:h-0 data-[ending-style]:h-0 data-[open]:animate-none">
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">{item.answer}</div>
                </Collapsible.CollapsibleContent>
              </Collapsible.CollapsibleRoot>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 rounded-[2rem] bg-foreground px-8 py-14 text-center text-background sm:px-16">
            <Badge
              variant="default"
              className="h-7 gap-1.5 rounded-full bg-background px-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-foreground"
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              100% grátis
            </Badge>
            <h2 className="max-w-xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Pronto para parar de pular entre planilhas?
            </h2>
            <p className="max-w-md text-sm leading-6 opacity-80">
              Crie sua conta em menos de 1 minuto e veja como é ter clientes, tarefas, agenda e financeiro no mesmo
              lugar — sem pagar nada por isso.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                render={<Link href="/signup" />}
                variant="secondary"
                size="lg"
                className="h-12 rounded-md px-6 text-sm font-bold"
              >
                Criar conta grátis
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
              </Button>
              <Button
                render={<Link href="/login" />}
                variant="outline"
                size="lg"
                className="h-12 rounded-md border-background/30 bg-transparent px-6 text-sm font-bold text-background hover:bg-background/10 hover:text-background"
              >
                Entrar
              </Button>
            </div>
            <p className="flex items-center gap-2 text-xs font-semibold opacity-80">
              <Clock className="size-3.5" strokeWidth={2.5} />
              Menos de 1 minuto para começar
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
