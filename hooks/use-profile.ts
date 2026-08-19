"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "./supabase";

export type ProfileFormData = {
  name: string;
  email: string;
  password: string;
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Tente novamente em alguns instantes.";
}

export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileFormData>({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error || !data.user) {
        toast.error("Não foi possível carregar seus dados", {
          description: error?.message ?? "Sua sessão pode ter expirado.",
        });
        setIsLoading(false);
        return;
      }

      setProfile({
        name: data.user.user_metadata?.full_name ?? "",
        email: data.user.email ?? "",
        password: "",
      });
      setIsLoading(false);
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateProfile(input: ProfileFormData) {
    const name = input.name.trim();
    const email = input.email.trim();
    const password = input.password.trim();

    if (!name || !email) {
      toast.error("Preencha nome e e-mail");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Digite um e-mail válido", {
        description: "Exemplo: nome@empresa.com",
      });
      return false;
    }

    if (password && password.length < 6) {
      toast.error("A nova senha é muito curta", {
        description: "Use pelo menos 6 caracteres.",
      });
      return false;
    }

    setIsSaving(true);

    try {
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser.user) throw userError ?? new Error("Sessão expirada.");

      const attributes: {
        data: { full_name: string };
        email?: string;
        password?: string;
      } = {
        data: { full_name: name },
      };

      if (email !== (currentUser.user.email ?? "")) attributes.email = email;
      if (password) attributes.password = password;
      const requiresNewLogin = Boolean(attributes.email || attributes.password);

      const { error } = await supabase.auth.updateUser(attributes);
      if (error) throw error;

      setProfile((current) => ({ ...current, name, email, password: "" }));

      if (requiresNewLogin) {
        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });

        if (signOutError) {
          console.error("Erro ao encerrar a sessão após alteração sensível:", signOutError.message);
        }

        toast.success("Dados atualizados", {
          description: "Por segurança, entre novamente com seus novos dados.",
        });
        router.replace("/login");
        return true;
      }

      toast.success("Dados atualizados", {
        description: attributes.email
          ? "Confira seu e-mail para confirmar a alteração do endereço."
          : "Suas informações foram salvas com sucesso.",
      });
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar seus dados", {
        description: getErrorMessage(error),
      });
      console.error("Erro ao atualizar perfil:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { profile, setProfile, isLoading, isSaving, updateProfile };
}
