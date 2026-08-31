"use client";

//* Services Imports
import { supabase } from "@/hooks/supabase";

/**
 * Id do usuário logado.
 *
 * Autenticação continua no `supabase-js`: ele cuida de sessão, refresh de token e persistência —
 * coisas que não são REST e que não faria sentido reimplementar sobre o Axios.
 */
export async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  return data.user.id;
}
