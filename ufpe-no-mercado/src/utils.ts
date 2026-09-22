import type { Answers, Step } from "./types";

/** Só libera "Continuar" quando a pergunta obrigatória foi respondida. */
export function isStepValid(step: Step, a: Answers): boolean {
  switch (step.kind) {
    case "choice":
      return Boolean(a[step.field]);
    default:
      // A localização pode ficar vazia; uma cidade precisa do UF para evitar homônimos.
      return !a.cidade.trim() || Boolean(a.uf);
  }
}

/** Mostra o link sem "https://" para ficar mais limpo na tela. */
export function shortUrl(url: string, max?: number): string {
  const s = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return max && s.length > max ? s.slice(0, max - 1) + "…" : s;
}
