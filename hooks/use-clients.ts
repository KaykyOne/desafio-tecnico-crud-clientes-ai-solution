"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "./supabase";

export type ClientStatus = "active" | "inactive";

export type ClientRecord = {
  id: string;
  user_id: string;
  name: string;
  contact: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ClientInput = {
  name: string;
  contact: string;
  status: ClientStatus;
};

function getSupabaseErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    const code = "code" in error && error.code ? ` (${String(error.code)})` : "";
    return `${message}${code}`;
  }

  return fallback;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  return data.user.id;
}

export function useClients() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { data, error } = await supabase
        .from("clients")
        .select("id, user_id, name, contact, status, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data ?? []);
    } catch (error) {
      toast.error("Não foi possível carregar os clientes", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchClients.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchClients();
  }, [fetchClients]);

  async function createClient(input: ClientInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase
        .from("clients")
        .insert({ ...input, user_id: userId });

      if (error) throw error;
      await fetchClients();
      toast.success("Cliente cadastrado");
      return true;
    } catch (error) {
      toast.error("Não foi possível cadastrar o cliente", {
        description: getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao cadastrar cliente:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateClient(id: string, input: ClientInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase
        .from("clients")
        .update(input)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      await fetchClients();
      toast.success("Cliente atualizado");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar o cliente", {
        description: getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao atualizar cliente:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteClient(id: string) {
    setDeletingClientId(id);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setClients((current) => current.filter((client) => client.id !== id));
      toast.success("Cliente excluído");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir o cliente", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir cliente:", error);
      return false;
    } finally {
      setDeletingClientId(null);
    }
  }

  return {
    clients,
    isLoading,
    isSaving,
    deletingClientId,
    createClient,
    updateClient,
    deleteClient,
    refreshClients: fetchClients,
  };
}
