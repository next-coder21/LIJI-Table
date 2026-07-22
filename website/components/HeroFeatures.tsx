import type { CSSProperties, ReactNode } from "react";

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 3c3.5 1.5 5.5 4.5 5.5 8.5 0 1.7-.4 3.2-1 4.5H9.5c-.6-1.3-1-2.8-1-4.5C8.5 7.5 10.5 4.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 15.5 6 18m9.5-2.5L18 18M10.5 18.5c-.5 1-1.5 1.8-1.5 1.8s0-1.3.5-2.3m4 .5c.5 1 1.5 1.8 1.5 1.8s0-1.3-.5-2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 8l8 4.5L20 8M12 12.5V20.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="m9 8-4 4 4 4m6-8 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const CARDS: { icon: ReactNode; from: string; to: string; value: string; label: string }[] = [
  { icon: <RocketIcon />, from: "var(--accent)", to: "#3552f0", value: "~12 kB", label: "Minified + gzipped core size" },
  { icon: <CubeIcon />, from: "var(--accent-2)", to: "#7c3aed", value: "0", label: "Required dependencies in core" },
  { icon: <CodeIcon />, from: "var(--accent-2)", to: "#4f8bff", value: "Any framework", label: "React, Angular, or vanilla JS via the headless core" },
  { icon: <BoltIcon />, from: "var(--accent-amber)", to: "#ef4444", value: "Built for scale", label: "Windowed virtualization keeps thousands of rows smooth" },
];

export default function HeroFeatures() {
  return (
    <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.value}
          className="group flex items-start gap-3 rounded-md border border-grid-line bg-paper p-4 transition-colors hover:border-grid-line-strong"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_14px_-2px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` } as CSSProperties}
          >
            {card.icon}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-sans text-[15px] font-semibold tracking-tight text-ink">{card.value}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
