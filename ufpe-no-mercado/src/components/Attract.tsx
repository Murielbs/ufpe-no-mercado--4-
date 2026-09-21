import type { CSSProperties } from "react";
import { STEPS } from "../data";
import { BatteryArt } from "./Icons";

const CHIPS = [
  "Comercial & Vendas", "Logística", "Produção Fabril", "Administrativo & Financeiro",
  "Tecnologia", "Engenharia & P&D", "Recursos Humanos", "Jovem Aprendiz",
  "Estágio", "Primeiro emprego", "Vagas efetivas",
];

/** Tela de espera do totem: qualquer toque abre o vídeo de boas-vindas. */
export function Attract({ onStart }: { onStart: () => void }) {
  return (
    <section className="attract" onClick={onStart}>
      <div className="attract__chips" aria-hidden="true">
        {CHIPS.map((label, i) => {
          const right = i % 2 === 1;
          const k = Math.floor(i / 2);
          const style = {
            "--x": `${10 + (k % 3) * 2.5}%`,
            "--delay": `-${k * 3 + (right ? 1.5 : 0)}s`,
          } as CSSProperties;
          return (
            <span key={label} className={`attract__chip ${right ? "is-r" : "is-l"}`} style={style}>
              {label}
            </span>
          );
        })}
      </div>

      <div className="attract__logo">
        <img src="./Imagem2.png" alt="" />
      </div>
      <BatteryArt className="attract__battery" />
      <h1 className="attract__title">UFPE no <em>Mercado</em></h1>
      <p className="attract__sub">
        Responda a {STEPS.length} perguntas rápidas e descubra a vaga ideal para o seu perfil.
      </p>
      <button type="button" className="attract__tap">
        Toque para começar
      </button>
    </section>
  );
}

