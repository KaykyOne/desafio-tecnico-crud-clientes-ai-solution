"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";

//* Libraries Imports
import { useState, type FormEvent } from "react";

//* Types Imports
import type { ClientInput, ClientRecord, ClientStatus } from "@/hooks/use-clients";

type ClientFormDialogProps = {
  open: boolean;
  client: ClientRecord | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ClientInput) => Promise<boolean>;
};

const emptyForm: ClientInput = { name: "", contact: "", status: "active" };

export function ClientFormDialog({ open: isOpen, client, isSaving, onOpenChange, onSubmit }: ClientFormDialogProps) {
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
    <Dialog.DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="bg-background sm:max-w-lg p-10">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">
            {isEditing ? "Editar cliente" : "Novo cliente"}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription className="px-0">
            {isEditing
              ? "Atualize os dados deste cliente."
              : "Cadastre um cliente para começar a organizar sua carteira."}
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

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
            <Select.SelectRoot
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as ClientStatus,
                }))
              }
            >
              <Select.SelectTrigger className="h-11 w-full rounded-md bg-background">
                <Select.SelectValue>{form.status === "active" ? "Ativo" : "Inativo"}</Select.SelectValue>
              </Select.SelectTrigger>
              <Select.SelectContent>
                <Select.SelectItem value="active">Ativo</Select.SelectItem>
                <Select.SelectItem value="inactive">Inativo</Select.SelectItem>
              </Select.SelectContent>
            </Select.SelectRoot>
          </div>

          <Dialog.DialogFooter className="mt-6 border-t-0 bg-transparent p-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
          </Dialog.DialogFooter>
        </form>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
