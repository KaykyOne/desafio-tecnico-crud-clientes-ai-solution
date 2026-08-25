"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClientInput, ClientRecord, ClientStatus } from "@/hooks/use-clients";

type ClientFormDialogProps = {
  open: boolean;
  client: ClientRecord | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ClientInput) => Promise<boolean>;
};

const emptyForm: ClientInput = { name: "", contact: "", status: "active" };

export default function ClientFormDialog({
  open: isOpen,
  client,
  isSaving,
  onOpenChange,
  onSubmit,
}: ClientFormDialogProps) {
  const [form, setForm] = useState<ClientInput>(() =>
    client
      ? {
          name: client.name,
          contact: client.contact,
          status: client.status.toLowerCase() === "inactive" ? "inactive" : "active",
        }
      : emptyForm,
  );
  const isEditing = Boolean(client);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const saved = await onSubmit({
      name: form.name.trim(),
      contact: form.contact.trim(),
      status: form.status,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-lg p-10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">
            {isEditing ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription className="px-0">
            {isEditing
              ? "Atualize os dados deste cliente."
              : "Cadastre um cliente para começar a organizar sua carteira."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="client-name">Nome</Label>
            <Input
              id="client-name"
              name="name"
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome completo"
              className="h-11 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-contact">Contato</Label>
            <Input
              id="client-contact"
              name="contact"
              required
              value={form.contact}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contact: event.target.value,
                }))
              }
              placeholder="E-mail ou telefone"
              className="h-11 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <SelectRoot
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as ClientStatus,
                }))
              }
            >
              <SelectTrigger className="h-11 w-full rounded-md bg-background">
                <SelectValue>{form.status === "active" ? "Ativo" : "Inativo"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>

          <DialogFooter className="mt-6 border-t-0 bg-transparent p-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
