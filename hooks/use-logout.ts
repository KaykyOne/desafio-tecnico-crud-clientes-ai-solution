"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "./supabase";

export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        toast.error("Não foi possível sair", {
          description: "Tente novamente em alguns instantes.",
        });
        console.error("Erro ao sair:", error.message);
        return;
      }

      toast.success("Sessão encerrada");
      router.replace("/login");
    } catch (error) {
      toast.error("Não foi possível sair", {
        description: "Verifique sua conexão e tente novamente.",
      });
      console.error("Erro inesperado ao sair:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return { logout, isLoading };
}
