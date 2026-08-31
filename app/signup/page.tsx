"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

import { SignupForm } from "./_components/signup-form";

//* Libraries Imports
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthBrand } from "@/app/_components/auth-brand";
import { SiteFooter } from "@/app/_components/site-footer";

export default function SignupPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background px-6 py-6 text-foreground sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-muted blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-80 w-80 rounded-full bg-muted blur-3xl" />

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <AuthBrand compact />
        <Button render={<Link href="/" />} variant="ghost" className="h-9 gap-2 px-3 text-sm font-semibold">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:py-16">
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Comece agora</p>
          <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-foreground sm:text-6xl">
            Sua operação freelance, em um só lugar.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-muted-foreground">
            Clientes, tarefas e financeiro organizados numa única plataforma, feita para quem toca o negócio sozinho.
          </p>
          <div className="mt-9">
            <AuthBrand />
          </div>
        </div>

        <Card.CardRoot className="w-full max-w-md justify-self-center rounded-xl border bg-card p-7 shadow-sm sm:p-9 lg:justify-self-end">
          <SignupForm />
        </Card.CardRoot>
      </section>

      <SiteFooter />
    </main>
  );
}
