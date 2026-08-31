/**
 * Leitura de erro da API, compartilhada por todos os hooks.
 *
 * Antes cada hook tinha sua própria cópia destas duas funções; agora a regra de "como um erro vira
 * texto pro usuário" mora num lugar só.
 */

/** Códigos do Postgres que os hooks tratam de forma específica. */
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    const code = "code" in error && error.code ? ` (${String(error.code)})` : "";
    return `${message}${code}`;
  }

  return fallback;
}

function hasCode(error: unknown, code: string) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === code);
}

export function isUniqueViolation(error: unknown) {
  return hasCode(error, PG_UNIQUE_VIOLATION);
}

export function isForeignKeyViolation(error: unknown) {
  return hasCode(error, PG_FOREIGN_KEY_VIOLATION);
}
