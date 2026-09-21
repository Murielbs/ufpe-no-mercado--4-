interface Props {
  done: number;
  total: number;
}

/** Progresso em forma de bateria: cada pergunta respondida acende uma cÃ©lula. */
export function BatteryProgress({ done, total }: Props) {
  const pct = Math.round((done / total) * 100);
  const full = done >= total;

  return (
    <div
      className={`charge ${full ? "charge--full" : ""}`}
      role="progressbar"
      aria-label="Progresso"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="charge__pct" aria-hidden="true">
        <span className="charge__num">{pct}</span>
        <span className="charge__unit">%</span>
      </div>
      <div className="charge__meter">
        <div className="charge__body">
          <div className="charge__shell">
            <div className="charge__cells">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={`charge__cell ${i < done ? "is-on" : ""} ${i === done && !full ? "is-now" : ""}`}
                />
              ))}
            </div>
          </div>
          <span className="charge__tip" />
        </div>
        <div className="charge__caption">{full ? "Carga completa!" : `Pergunta ${done + 1} de ${total}`}</div>
      </div>
    </div>
  );
}

