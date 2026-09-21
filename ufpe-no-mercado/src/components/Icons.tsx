import type { ReactElement } from "react";
import type { AreaKey } from "../types";

const AREA_ICONS: Record<AreaKey, ReactElement> = {
  comercial: (
    <>
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </>
  ),
  logistica: (
    <>
      <path d="M2 6h11v9H2z" />
      <path d="M13 9h4l3 3v3h-7z" />
      <circle cx="7" cy="17" r="1.8" />
      <circle cx="17" cy="17" r="1.8" />
    </>
  ),
  operacional: <path d="M3 20V9l6 4V9l6 4V5h3v15z" />,
  admfin: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  tech: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  engenharia: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  rh: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14a5 5 0 0 1 4 6" />
    </>
  ),
};

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function AreaIcon({ name }: { name: AreaKey }) {
  return <svg {...svgProps}>{AREA_ICONS[name]}</svg>;
}

export function CheckIcon() {
  return (
    <svg {...svgProps} strokeWidth={3.2}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Bateria grande com células que acendem em sequência (splash e tela de atração). */
export function BatteryArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 130" aria-hidden="true">
      <rect x="4" y="4" width="272" height="122" rx="22" fill="none" stroke="currentColor" strokeWidth="8" />
      <rect x="282" y="40" width="14" height="50" rx="6" fill="currentColor" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          className="art-cell"
          x={20 + i * 50}
          y="20"
          width="42"
          height="90"
          rx="9"
          style={{ ["--i" as string]: i }}
        />
      ))}
    </svg>
  );
}

