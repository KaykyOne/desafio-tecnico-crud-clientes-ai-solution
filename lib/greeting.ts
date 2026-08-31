export type GreetingPeriod = "madrugada" | "manha" | "tarde" | "noite";

/** Três variações por período, pra saudação não ficar repetitiva entre visitas. */
const greetingsByPeriod: Record<GreetingPeriod, ((name: string) => string)[]> = {
  madrugada: [
    (name) => `Ainda de pé, ${name}?`,
    (name) => `Boa madrugada, ${name}`,
    (name) => `Silêncio bom pra trabalhar, ${name}?`,
  ],
  manha: [(name) => `Bom dia, ${name}`, (name) => `Hora do café, ${name}?`, (name) => `Começando o dia, ${name}?`],
  tarde: [
    (name) => `Boa tarde, ${name}`,
    (name) => `Como vai a tarde, ${name}?`,
    (name) => `De volta ao trabalho, ${name}?`,
  ],
  noite: [(name) => `Boa noite, ${name}`, (name) => `Fechando o dia, ${name}?`, (name) => `Últimos ajustes, ${name}?`],
};

export function getGreetingPeriod(date: Date): GreetingPeriod {
  const hour = date.getHours();
  if (hour < 5) return "madrugada";
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

/**
 * Monta a saudação a partir de um sorteio já feito.
 *
 * `seed` (0 a 1) entra como parâmetro em vez de a função sortear por conta própria pra ela ficar
 * pura: o sorteio acontece uma vez só, num inicializador de `useState`. Se fosse sorteado aqui, a
 * frase trocaria a cada re-render.
 */
export function buildGreeting(name: string, seed: number, date: Date) {
  const options = greetingsByPeriod[getGreetingPeriod(date)];
  const index = Math.min(options.length - 1, Math.floor(seed * options.length));
  return options[index](name);
}
