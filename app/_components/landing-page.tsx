"use client";

//* Components Imports
import { AvatarBadge, AvatarFallback, AvatarRoot } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

//* Libraries Imports
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, KanbanSquare, UsersRound, Wallet } from "lucide-react";

import AuthBrand from "./auth-brand";
import SiteFooter from "./site-footer";

const features = [
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
    description: "Extrato de gastos, gastos fixos recorrentes e ganhos — inclusive importando o extrato do seu banco em OFX.",
    image: "https://images.unsplash.com/photo-1767424412548-1a1ac7f4b9bc?auto=format&fit=crop&q=80&w=800",
    alt: "Telas com gráficos de análise financeira",
  },
];

export default function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background px-6 py-6 text-foreground sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-muted blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-80 w-80 rounded-full bg-muted blur-3xl" />

      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <AuthBrand compact />

        <div className="flex items-center gap-2">
          <Button render={<Link href="/login" />} variant="ghost" className="h-9 px-3 text-sm font-semibold">
            Entrar
          </Button>
          <Button render={<Link href="/signup" />} variant="secondary" className="h-9 px-3 text-sm font-semibold">
            Cadastrar
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-14 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Gestão para freelancers</p>
          <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
            Clientes, tarefas e financeiro. Tudo em um só lugar.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-muted-foreground">
            Feito para quem toca o negócio sozinho: organize sua carteira de clientes, acompanhe entregas num Kanban
            e controle gastos e ganhos sem precisar de planilha.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              render={<Link href="/signup" />}
              variant="foreground"
              size="lg"
              className="h-12 rounded-md px-6 text-sm font-bold shadow-sm transition duration-200 hover:-translate-y-0.5"
            >
              Começar agora
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
            </Button>
            <Button render={<Link href="/login" />} variant="outline" size="lg" className="h-12 rounded-md px-6 text-sm font-bold">
              Entrar
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
          <div className="absolute -inset-3 rounded-[2rem] border border-white/70 bg-white/35 -rotate-3" />
          <Card.CardRoot className="relative gap-0 overflow-hidden rounded-xl border bg-card py-0 shadow-sm">
            <Card.CardHeader className="mb-3 px-5 pt-5 sm:px-7 sm:pt-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Seus clientes</p>
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
                  <AvatarRoot size="lg" className="rounded-md bg-background">
                    <AvatarFallback className="rounded-md bg-background text-sm font-bold">
                      {name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </AvatarFallback>
                    <AvatarBadge className="bg-foreground" />
                  </AvatarRoot>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Cliente cadastrado</p>
                  </div>
                </div>
              ))}
            </Card.CardContent>
          </Card.CardRoot>
        </div>
      </section>

      <section className="mx-auto max-w-6xl py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] border border-white/70 bg-white/35" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-sm ring-1 ring-foreground/10">
              <Image
                src="https://images.unsplash.com/photo-1689579209518-5276c5fb1a2e?auto=format&fit=crop&q=80&w=1200"
                alt="Pessoa trabalhando concentrada em um laptop"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover grayscale"
              />
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Sobre o sistema</p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              Um sistema feito por quem também trabalha sozinho.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              O izi Freelas nasceu pra resolver um problema comum de quem é freelancer ou toca um negócio pequeno: os
              dados ficam espalhados entre planilhas, apps de notas e extratos de banco. Aqui, clientes, entregas e
              financeiro moram no mesmo lugar — sem mensalidade de ferramenta corporativa, sem complicação.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">O que você organiza aqui</p>
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Três módulos, um só login.</h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description, image, alt }) => (
            <div key={title} className="group overflow-hidden rounded-xl border bg-card shadow-sm">
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
      </section>

      <section className="mx-auto max-w-6xl py-6 lg:py-10">
        <div className="flex flex-col items-center gap-6 rounded-[2rem] bg-foreground px-8 py-14 text-center text-background sm:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">Comece agora</p>
          <h2 className="max-w-xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Pronto para organizar seu negócio?</h2>
          <p className="max-w-md text-sm leading-6 opacity-80">Crie sua conta e comece a usar o izi Freelas em poucos minutos.</p>
          <Button render={<Link href="/signup" />} variant="secondary" size="lg" className="h-12 rounded-md px-6 text-sm font-bold">
            Criar conta grátis
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
