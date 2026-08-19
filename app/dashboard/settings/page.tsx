"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";

export default function SettingsPage() {
  const { profile, setProfile, isLoading, isSaving, updateProfile } = useProfile();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void updateProfile(profile);
  }

  if (isLoading) {
    return (
      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Conta</p>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Conta</p>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Configurações</h1>
        <p className="mt-2 text-sm text-muted-foreground">Atualize os dados da sua conta.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="settings-name" className="text-[0.72rem] font-semibold">Nome</Label>
            <Input
              id="settings-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={profile.name}
              onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              className="h-11 rounded-md bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-email" className="text-[0.72rem] font-semibold">E-mail</Label>
            <Input
              id="settings-email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              required
              value={profile.email}
              onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
              className="h-11 rounded-md bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-password" className="text-[0.72rem] font-semibold">Nova senha</Label>
            <Input
              id="settings-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={profile.password}
              onChange={(event) => setProfile((current) => ({ ...current, password: event.target.value }))}
              placeholder="Deixe em branco para manter a atual"
              className="h-11 rounded-md bg-background text-sm tracking-[0.14em] placeholder:tracking-normal"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="h-11 px-5 font-bold">
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
