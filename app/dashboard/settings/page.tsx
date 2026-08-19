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
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#397563]">Conta</p>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#183d34]">Configurações</h1>
        <p className="text-sm text-[#71837d]">Carregando seus dados...</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl space-y-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#397563]">Conta</p>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#183d34]">Configurações</h1>
        <p className="mt-2 text-sm text-[#71837d]">Atualize os dados da sua conta.</p>
      </div>

      <div className="rounded-3xl border border-[#dce8e2] bg-white p-6 shadow-[0_24px_70px_-50px_rgba(24,61,52,0.38)] sm:p-8">
        <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="settings-name" className="text-[0.72rem] font-semibold text-[#526660]">Nome</Label>
            <Input
              id="settings-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={profile.name}
              onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              className="h-11 rounded-xl border-[#d8e5df] bg-[#f8faf9] px-3 text-sm text-[#12231f] placeholder:text-[#94a49d] focus-visible:border-[#397563] focus-visible:ring-[#397563]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-email" className="text-[0.72rem] font-semibold text-[#526660]">E-mail</Label>
            <Input
              id="settings-email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              required
              value={profile.email}
              onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
              className="h-11 rounded-xl border-[#d8e5df] bg-[#f8faf9] px-3 text-sm text-[#12231f] placeholder:text-[#94a49d] focus-visible:border-[#397563] focus-visible:ring-[#397563]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-password" className="text-[0.72rem] font-semibold text-[#526660]">Nova senha</Label>
            <Input
              id="settings-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={profile.password}
              onChange={(event) => setProfile((current) => ({ ...current, password: event.target.value }))}
              placeholder="Deixe em branco para manter a atual"
              className="h-11 rounded-xl border-[#d8e5df] bg-[#f8faf9] px-3 text-sm tracking-[0.14em] text-[#12231f] placeholder:text-[#94a49d] placeholder:tracking-normal focus-visible:border-[#397563] focus-visible:ring-[#397563]/20"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="h-11 rounded-xl bg-[#183d34] px-5 font-bold text-white shadow-[0_14px_30px_-14px_rgba(24,61,52,0.7)] hover:bg-[#245246]">
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
