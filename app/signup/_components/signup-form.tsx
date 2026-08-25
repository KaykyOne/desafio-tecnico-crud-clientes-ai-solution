"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "@/hooks/use-signup";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signup, isLoading } = useSignup();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    void signup({ name: name.trim(), email, password });
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h1 className="text-[1.65rem] font-bold tracking-[-0.04em] text-foreground">Criar conta</h1>
        <p className="text-[0.78rem] leading-5 text-muted-foreground">Comece a organizar seu negócio freelance.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[0.72rem] font-semibold">Nome</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 rounded-md bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-[0.72rem] font-semibold">E-mail</Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password" className="text-[0.72rem] font-semibold">Senha</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-md bg-background text-sm tracking-[0.18em]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirm-password" className="text-[0.72rem] font-semibold">Confirmar senha</Label>
          <Input
            id="signup-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11 rounded-md bg-background text-sm tracking-[0.18em]"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="h-11 w-full px-4 text-sm font-bold">
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-[0.78rem] text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
