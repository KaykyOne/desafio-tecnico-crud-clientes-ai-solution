/** Normaliza texto pra comparação: minúsculas, sem acento, sem espaços nas pontas. */
export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
