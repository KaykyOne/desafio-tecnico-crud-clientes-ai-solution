"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Não foi possível entrar. Confira seu e-mail e senha.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h1 className="text-[1.65rem] font-bold tracking-[-0.04em] text-[#12231f]">
          Entrar
        </h1>
        <p className="text-[0.78rem] leading-5 text-[#71837d]">
          Acesse sua conta para continuar.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[0.72rem] font-semibold text-[#526660]">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl border-[#d8e5df] bg-[#f8faf9] px-3 py-2 text-sm text-[#12231f] placeholder:text-[#94a49d] focus-visible:border-[#397563] focus-visible:ring-[#397563]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[0.72rem] font-semibold text-[#526660]">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-xl border-[#d8e5df] bg-[#f8faf9] px-3 py-2 text-sm tracking-[0.18em] text-[#12231f] placeholder:text-[#94a49d] focus-visible:border-[#397563] focus-visible:ring-[#397563]/20"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-xl bg-[#183d34] px-4 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(24,61,52,0.7)] hover:bg-[#245246] focus-visible:ring-[#397563]/30"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

export function LoginBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 font-semibold tracking-tight text-[#12231f]">
        <span className="grid size-9 place-items-center rounded-xl bg-[#183d34] text-white">
          <UsersRound className="size-4" strokeWidth={2.5} />
        </span>
        ClienteApp
      </div>
    );
  }

  return (
    <div className="flex max-w-[22rem] flex-col items-start">
      <div className="mb-5 grid size-10 place-items-center rounded-xl bg-[#d8efe5] text-[#245246]">
        <UsersRound className="size-5" strokeWidth={2.3} />
      </div>
      <p className="text-[1.25rem] font-bold tracking-[-0.04em] text-[#12231f]">ClienteApp</p>
      <p className="mt-3 max-w-[17rem] text-[0.78rem] font-semibold leading-5 text-[#526660]">
        A plataforma simples para gerenciar seus clientes com clareza e eficiência.
      </p>
      <div className="mt-6 text-[0.68rem] leading-4 text-[#71837d]">
        <p className="font-semibold text-[#397563]">“Organize. Gerencie. Cresça.”</p>
        <p>Soluções simples para equipes reais.</p>
      </div>
    </div>
  );
}
