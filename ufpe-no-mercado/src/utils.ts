import type { Answers, Step } from "./types";

/** Só libera "Continuar" quando a pergunta obrigatória foi respondida. */
export function isStepValid(step: Step, a: Answers): boolean {
  switch (step.kind) {
    case "choice":
      return Boolean(a[step.field]);
    default:
      return true; // local é opcional
  }
}

/** Mostra o link sem "https://" para ficar mais limpo na tela. */
export function shortUrl(url: string, max?: number): string {
  const s = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return max && s.length > max ? s.slice(0, max - 1) + "…" : s;
}
