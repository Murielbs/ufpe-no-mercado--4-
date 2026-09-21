import type { FormEvent } from "react";
import { ESTADOS_BR } from "../data";
import type { Answers, SetAnswer, Step } from "../types";
import { isStepValid } from "../utils";
import { AreaIcon, CheckIcon } from "./Icons";

interface Props {
  step: Step;
  answers: Answers;
  setAnswer: SetAnswer;
  isLast: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function Quiz({ step, answers, setAnswer, isLast, onNext, onBack }: Props) {
  const valid = isStepValid(step, answers);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onNext();
  };

  const pick = (value: string) => {
    if (step.kind !== "choice") return;
    setAnswer(step.field, value);
  };

  return (
    <form className="card step" onSubmit={submit} noValidate>
      <h2 className="step__title">{step.title}</h2>

      {step.kind === "choice" && (
        <div className={`choices choices--${step.layout}`} role="radiogroup" aria-label={step.title}>
          {step.options.map((o) => {
            const selected = answers[step.field] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`choice ${selected ? "is-selected" : ""}`}
                onClick={() => pick(o.value)}
              >
                {o.icon && (
                  <span className="choice__icon">
                    <AreaIcon name={o.icon} />
                  </span>
                )}
                <span className="choice__text">
                  <span className="choice__label">{o.label}</span>
                  {o.description && <span className="choice__desc">{o.description}</span>}
                </span>
                <span className="choice__mark" aria-hidden="true">
                  {selected && <CheckIcon />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {step.kind === "local" && (
        <div className="local-grid">
          <div className="field">
            <label className="field__label" htmlFor="uf">Estado (UF)</label>
            <select id="uf" className="input" value={answers.uf} onChange={(e) => setAnswer("uf", e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="cidade">Cidade</label>
            <input
              id="cidade" className="input" type="text" autoComplete="address-level2" enterKeyHint="next"
              placeholder="Ex: Recife"
              value={answers.cidade} onChange={(e) => setAnswer("cidade", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Voltar
        </button>
        <button type="submit" className="btn btn--primary" disabled={!valid}>
          {isLast ? "Ver resultado" : "Continuar"}
        </button>
      </div>
    </form>
  );
}

