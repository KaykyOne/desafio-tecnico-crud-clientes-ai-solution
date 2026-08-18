import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LoginForm, { LoginBrand } from "./login-form";

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#f5f7f6] px-6 py-6 text-[#12231f] sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[#d8efe5] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-80 w-80 rounded-full bg-[#f7dfbd] blur-3xl" />

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <LoginBrand compact />
        <Button
          render={<Link href="/" />}
          variant="ghost"
          className="h-9 gap-2 px-3 text-sm font-semibold text-[#12231f] hover:bg-[#e6f4ed] hover:text-[#245246]"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:py-16">
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#397563]">
            Acesso à plataforma
          </p>
          <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-[#12231f] sm:text-6xl">
            De volta ao controle dos seus clientes.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#526660]">
            Entre para acompanhar sua operação, organizar contatos e manter sua equipe em movimento.
          </p>
          <div className="mt-9">
            <LoginBrand />
          </div>
        </div>

        <Card.CardRoot className="w-full max-w-md justify-self-center rounded-[1.7rem] border-white/80 bg-white p-7 shadow-[0_30px_60px_-28px_rgba(23,56,48,0.35)] sm:p-9 lg:justify-self-end">
          <LoginForm />
        </Card.CardRoot>
      </section>
    </main>
  );
}
