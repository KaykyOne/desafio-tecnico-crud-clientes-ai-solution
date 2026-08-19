"use client";

//* Components Imports
import {
  AvatarBadge,
  AvatarFallback,
  AvatarRoot,
} from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

//* Libraries Imports

import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5f7f6] px-6 py-6 text-[#12231f] sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[#d8efe5] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-80 w-80 rounded-full bg-[#f7dfbd] blur-3xl" />

      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#183d34] text-white">
            <UsersRound className="size-4" strokeWidth={2.5} />
          </span>
          Clientes
        </div>

        <Button
          render={<Link href="/login" />}
          variant="ghost"
          className="h-9 px-3 text-sm font-semibold text-[#12231f] hover:bg-[#e6f4ed] hover:text-[#245246]"
        >
          Entrar
        </Button>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-14 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#397563]">
            Gestão de clientes
          </p>
          <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-[#12231f] sm:text-6xl lg:text-7xl">
            Clientes em ordem. Negócio em movimento.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#526660]">
            Centralize os dados dos seus clientes e encontre rapidamente as
            informações que sua equipe precisa para atender melhor.
          </p>

          <Button
            render={<Link href="/login" />}
            variant="foreground"
            size="lg"
            className="mt-10 h-12 rounded-full bg-[#183d34] px-6 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(24,61,52,0.7)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#245246]"
          >
            Acessar plataforma
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
          </Button>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
          <div className="absolute -inset-3 rounded-[2rem] border border-white/70 bg-white/35 -rotate-3" />
          <Card.CardRoot className="relative gap-0 overflow-hidden rounded-[1.7rem] border border-white/80 bg-white py-0 shadow-[0_30px_60px_-28px_rgba(23,56,48,0.35)]">
            <Card.CardHeader className="mb-3 px-5 pt-5 sm:px-7 sm:pt-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#769088]">
                  Seus clientes
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">Visão geral</p>
              </div>
              <Card.CardAction>
                <Badge className="h-auto rounded-full bg-[#e6f4ed] px-3 py-1.5 text-xs font-bold text-[#397563] hover:bg-[#e6f4ed]">
                  128 ativos
                </Badge>
              </Card.CardAction>
            </Card.CardHeader>

            <Card.CardContent className="space-y-3 px-5 pb-5 sm:px-7 sm:pb-7">
              {["Marina Costa", "Lucas Almeida", "Ana Beatriz"].map((name, index) => (
                <div key={name} className="flex items-center gap-3 rounded-2xl bg-[#f5f7f6] p-3">
                  <AvatarRoot size="lg" className="rounded-xl bg-[#d8efe5]">
                    <AvatarFallback className="rounded-xl bg-[#d8efe5] text-sm font-bold text-[#245246]">
                      {name.split(" ").map((part) => part[0]).join("")}
                    </AvatarFallback>
                    <AvatarBadge className={index === 1 ? "bg-[#f0ad58]" : "bg-[#5ebc8e]"} />
                  </AvatarRoot>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{name}</p>
                    <p className="mt-0.5 text-xs text-[#71837d]">Cliente cadastrado</p>
                  </div>
                </div>
              ))}
            </Card.CardContent>
          </Card.CardRoot>
        </div>
      </section>
    </main>
  );
}
