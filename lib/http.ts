"use client";

//* Libraries Imports
import axios from "axios";

//* Services Imports
import { supabase } from "@/hooks/supabase";

//* Types Imports
import type { AxiosError, AxiosInstance } from "axios";

//* Utils Imports
import env from "@/lib/env";

/**
 * Instância única de HTTP do app, apontada pra API REST do Supabase (PostgREST).
 *
 * Tudo que fala com o banco passa por aqui — trocar de backend depois é mexer neste arquivo e nos
 * serviços de `services/`, sem tocar em hook nem em tela.
 *
 * O `supabase-js` continua no projeto, mas **só pra autenticação** (sessão, login, refresh de
 * token). Ele é a fonte do access token que o interceptor injeta abaixo.
 */
export const http: AxiosInstance = axios.create({
  baseURL: `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  config.headers.set("apikey", env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  // Sem sessão, a chave pública vale como bearer e a RLS barra tudo que exige `auth.uid()`.
  config.headers.set("Authorization", `Bearer ${token ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`);

  return config;
});

/**
 * Erro normalizado da API.
 *
 * Preserva o `code` do Postgres (ex.: `23505` de violação de unicidade, `42703` de coluna
 * inexistente) porque os hooks decidem a mensagem ao usuário a partir dele.
 */
export class HttpError extends Error {
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;
  readonly status?: number;

  constructor(message: string, options: { code?: string; details?: string; hint?: string; status?: number } = {}) {
    super(message);
    this.name = "HttpError";
    this.code = options.code;
    this.details = options.details;
    this.hint = options.hint;
    this.status = options.status;
  }
}

type PostgrestErrorBody = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<PostgrestErrorBody>) => {
    const body = error.response?.data;

    throw new HttpError(body?.message ?? error.message ?? "Falha na comunicação com o servidor", {
      code: body?.code,
      details: body?.details,
      hint: body?.hint,
      status: error.response?.status,
    });
  },
);

export default http;
