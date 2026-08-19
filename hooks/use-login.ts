"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "./supabase";

type LoginCredentials = {
  email: string;
  password: string;
};

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function login(credentials: LoginCredentials) {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        toast.error("Não foi possível entrar", {
          description: "Confira seu e-mail e senha e tente novamente.",
        });
        console.error("Erro ao fazer login:", error.message);
        return;
      }

      toast.success("Login realizado", {
        description: "Você será direcionado para a sua área.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Não foi possível entrar", {
        description: "Verifique sua conexão e tente novamente.",
      });
      console.error("Erro inesperado ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading };
}
