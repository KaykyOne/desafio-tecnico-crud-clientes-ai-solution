"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";

//* Libraries Imports
import { useEffect, useState } from "react";
import Link from "next/link";

//* Hooks Imports
import { useLogin } from "@/hooks/use-login";

//* Types Imports
import type { FormEvent } from "react";

const REMEMBER_LOGIN_KEY = "clienteapp:remember-login";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading } = useLogin();

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_LOGIN_KEY);
    if (!stored) return;

    try {
      const { email: storedEmail, password: storedPassword } = JSON.parse(stored);
      // Prefilling the form from a previous "remember me" session is the effect's whole purpose.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (typeof storedEmail === "string") setEmail(storedEmail);
      if (typeof storedPassword === "string") setPassword(storedPassword);
    } catch {
      localStorage.removeItem(REMEMBER_LOGIN_KEY);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rememberMe) {
      localStorage.setItem(REMEMBER_LOGIN_KEY, JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem(REMEMBER_LOGIN_KEY);
    }

    void login({ email, password });
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h1 className="text-[1.65rem] font-bold tracking-[-0.04em] text-foreground">Entrar</h1>
        <p className="text-[0.78rem] leading-5 text-muted-foreground">Acesse sua conta para continuar.</p>
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

        <div className="flex items-center gap-2">
          <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={setRememberMe} />
          <Label htmlFor="remember-me" className="text-[0.72rem] font-medium text-muted-foreground">
            Salvar login neste dispositivo
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="h-11 w-full px-4 text-sm font-bold">
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-[0.78rem] text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
