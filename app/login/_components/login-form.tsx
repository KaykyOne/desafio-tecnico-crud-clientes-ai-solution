"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-login";

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
        <h1 className="text-[1.65rem] font-bold tracking-[-0.04em] text-foreground">
          Entrar
        </h1>
        <p className="text-[0.78rem] leading-5 text-muted-foreground">
          Acesse sua conta para continuar.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[0.72rem] font-semibold">
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
            className="h-11 rounded-md bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[0.72rem] font-semibold">
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
            className="h-11 rounded-md bg-background text-sm tracking-[0.18em]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full px-4 text-sm font-bold"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
