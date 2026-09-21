import type { Answers, Step } from "./types";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Só libera "Continuar" quando a pergunta obrigatória foi respondida. */
export function isStepValid(step: Step, a: Answers): boolean {
  switch (step.kind) {
    case "pessoal":
      return a.nome.trim().length > 0 && EMAIL_RE.test(a.email.trim());
    case "choice":
      return Boolean(a[step.field]);
    default:
      return true; // instituição e local são opcionais
  }
}

/** Mostra o link sem "https://" para ficar mais limpo na tela. */
export function shortUrl(url: string, max?: number): string {
  const s = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return max && s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/** Primeiro nome com só a inicial maiúscula (MURIEL -> Muriel). */
export function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.charAt(0).toLocaleUpperCase("pt-BR") + first.slice(1).toLocaleLowerCase("pt-BR");
}
