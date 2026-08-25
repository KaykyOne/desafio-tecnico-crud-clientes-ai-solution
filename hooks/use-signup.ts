"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "./supabase";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export function useSignup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function signup({ name, email, password }: SignupInput) {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (error) {
        const isAlreadyRegistered = error.message.toLowerCase().includes("already registered");
        toast.error(isAlreadyRegistered ? "Esse e-mail já está cadastrado" : "Não foi possível criar sua conta", {
          description: isAlreadyRegistered ? "Tente entrar ou recuperar sua senha." : "Confira os dados e tente novamente.",
        });
        console.error("Erro ao cadastrar usuário:", error.message);
        return;
      }

      if (data.session) {
        toast.success("Conta criada", { description: "Bem-vindo! Você já está conectado." });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      toast.success("Conta criada", { description: "Confirme seu e-mail para poder entrar." });
      router.push("/login");
    } catch (error) {
      toast.error("Não foi possível criar sua conta", {
        description: "Verifique sua conexão e tente novamente.",
      });
      console.error("Erro inesperado ao cadastrar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return { signup, isLoading };
}
