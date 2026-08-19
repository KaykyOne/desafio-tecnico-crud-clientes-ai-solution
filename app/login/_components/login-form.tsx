"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-login";
import { toast } from "sonner";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void login({ email, password });
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
