import { useEffect, useState } from "react";
import { BatteryArt } from "./Icons";

export function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 1800);
    const t2 = window.setTimeout(onDone, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className={`splash ${leaving ? "splash--leaving" : ""}`} role="status" aria-label="Carregando">
      <BatteryArt className="splash__battery" />
      <div className="splash__title">UFPE no <em>Mercado</em></div>
    </div>
  );
}
