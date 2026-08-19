"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table from "@/components/ui/table";
import { useClients, type ClientRecord } from "@/hooks/use-clients";

import ClientFormDialog from "./_components/client-form-dialog";
import DeleteClientDialog from "./_components/delete-client-dialog";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

function isActive(status: string) {
  return status.toLowerCase() !== "inativo" && status.toLowerCase() !== "inactive";
}

export default function ClientsPage() {
  const { clients, isLoading, isSaving, deletingClientId, createClient, updateClient, deleteClient } = useClients();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientRecord | null>(null);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => [client.name, client.contact, client.status].some((value) => value.toLowerCase().includes(query)));
  }, [clients, search]);

  const activeCount = clients.filter((client) => isActive(client.status)).length;
  const inactiveCount = clients.length - activeCount;

  function openCreateDialog() {
    setEditingClient(null);
    setIsFormOpen(true);
  }

  function openEditDialog(client: ClientRecord) {
    setEditingClient(client);
    setIsFormOpen(true);
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#397563]">Gestão</p>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#183d34]">Clientes</h1>
          <p className="mt-2 text-sm text-[#71837d]">Gerencie os contatos da sua carteira em um só lugar.</p>
        </div>
        <Button type="button" onClick={openCreateDialog} className="h-11 rounded-xl bg-[#183d34] px-4 font-bold text-white shadow-[0_14px_30px_-14px_rgba(24,61,52,0.7)] hover:bg-[#245246]"><Plus />Novo cliente</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de clientes" value={clients.length} icon={<UsersRound />} tone="neutral" />
        <StatCard label="Clientes ativos" value={activeCount} icon={<span className="size-2.5 rounded-full bg-[#258f7e]" />} tone="active" />
        <StatCard label="Clientes inativos" value={inactiveCount} icon={<span className="size-2.5 rounded-full bg-[#b45d4d]" />} tone="inactive" />
      </div>

      <div className="space-y-4 rounded-3xl border border-[#dce8e2] bg-white p-4 shadow-[0_24px_70px_-50px_rgba(24,61,52,0.38)] sm:p-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a9a93]" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar clientes..." aria-label="Buscar clientes" className="h-11 rounded-xl border-[#d8e5df] bg-[#f8faf9] pl-9 text-sm text-[#12231f] placeholder:text-[#94a49d] focus-visible:border-[#397563] focus-visible:ring-[#397563]/20" />
        </div>

        <Table.TableRoot>
          <Table.TableHeader>
            <Table.TableRow className="border-[#e6eee9] hover:bg-transparent">
              <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#8a9a93]">Nome</Table.TableHead>
              <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#8a9a93]">Contato</Table.TableHead>
              <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#8a9a93]">Status</Table.TableHead>
              <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#8a9a93]">Cadastro</Table.TableHead>
              <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#8a9a93]">Ações</Table.TableHead>
            </Table.TableRow>
          </Table.TableHeader>
          <Table.TableBody>
            {isLoading ? (
              <Table.TableRow><Table.TableCell colSpan={5} className="h-32 text-center text-sm text-[#8a9a93]">Carregando clientes...</Table.TableCell></Table.TableRow>
            ) : filteredClients.length === 0 ? (
              <Table.TableRow><Table.TableCell colSpan={5} className="h-40 text-center"><p className="font-semibold text-[#526660]">{search ? "Nenhum cliente encontrado" : "Sua carteira ainda está vazia"}</p><p className="mt-1 text-sm text-[#8a9a93]">{search ? "Tente outro termo de busca." : "Cadastre o primeiro cliente para começar."}</p></Table.TableCell></Table.TableRow>
            ) : (
              filteredClients.map((client) => {
                const active = isActive(client.status);
                return (
                  <Table.TableRow key={client.id} className="border-[#edf2ef] hover:bg-[#f8fbf9]">
                    <Table.TableCell className="px-3 py-4 font-semibold text-[#183d34]">{client.name}</Table.TableCell>
                    <Table.TableCell className="px-3 py-4 text-[#71837d]">{client.contact}</Table.TableCell>
                    <Table.TableCell className="px-3 py-4"><Badge className={active ? "bg-[#e3f5ee] text-[#197967]" : "bg-[#fff0ed] text-[#a25042]"}>{active ? "Ativo" : "Inativo"}</Badge></Table.TableCell>
                    <Table.TableCell className="px-3 py-4 text-[#71837d]">{formatDate(client.created_at)}</Table.TableCell>
                    <Table.TableCell className="px-3 py-4 text-right"><div className="flex justify-end gap-1"><Button type="button" variant="ghost" size="icon-sm" onClick={() => openEditDialog(client)} aria-label={`Editar ${client.name}`} className="text-[#397563] hover:bg-[#e7f2eb] hover:text-[#183d34]"><Pencil /></Button><Button type="button" variant="ghost" size="icon-sm" onClick={() => setDeletingClient(client)} aria-label={`Excluir ${client.name}`} className="text-[#b45d4d] hover:bg-[#fff0ed] hover:text-[#183d34]"><Trash2 /></Button></div></Table.TableCell>
                  </Table.TableRow>
                );
              })
            )}
          </Table.TableBody>
        </Table.TableRoot>
      </div>

      <ClientFormDialog key={`${editingClient?.id ?? "new"}-${isFormOpen}`} open={isFormOpen} client={editingClient} isSaving={isSaving} onOpenChange={setIsFormOpen} onSubmit={(input) => editingClient ? updateClient(editingClient.id, input) : createClient(input)} />
      <DeleteClientDialog open={Boolean(deletingClient)} clientName={deletingClient?.name ?? ""} isDeleting={Boolean(deletingClientId)} onOpenChange={(open) => { if (!open) setDeletingClient(null); }} onConfirm={() => deletingClient ? deleteClient(deletingClient.id) : Promise.resolve(false)} />
    </section>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: "neutral" | "active" | "inactive" }) {
  const styles = { neutral: "border-[#dce8e2] bg-[#f4f8f5] text-[#183d34]", active: "border-[#cce7dc] bg-[#eaf7f0] text-[#197967]", inactive: "border-[#f0d8d3] bg-[#fff4f1] text-[#a25042]" };
  return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><div className="flex items-center justify-between"><p className="text-xs font-semibold opacity-75">{label}</p><span className="flex size-7 items-center justify-center rounded-lg bg-white/70">{icon}</span></div><p className="mt-4 text-3xl font-black tracking-[-0.06em]">{value}</p></div>;
}
