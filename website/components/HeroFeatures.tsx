import type { ReactNode } from "react";

function SizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinejoin="round" />
      <path d="m3.27 6.96 8.73 5.04 8.73-5.04M12 22.08V12" strokeLinejoin="round" />
    </svg>
  );
}

function DependencyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="m4.93 4.93 14.14 14.14" strokeLinecap="round" />
    </svg>
  );
}

function FrameworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <path d="m7 8-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VirtualizationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const METRICS: {
  icon: ReactNode;
  accentClass: string;
  badgeBg: string;
  value: string;
  unit?: string;
  label: string;
  detail: string;
}[] = [
  {
    icon: <SizeIcon />,
    accentClass: "text-accent",
    badgeBg: "bg-accent/10 border-accent/25",
    value: "~12",
    unit: "kB",
    label: "Bundle footprint",
    detail: "Minified & gzipped core engine size with zero bloat.",
  },
  {
    icon: <DependencyIcon />,
    accentClass: "text-[#2dd4bf]",
    badgeBg: "bg-[#2dd4bf]/10 border-[#2dd4bf]/25",
    value: "0",
    unit: "deps",
    label: "External dependencies",
    detail: "Pure TypeScript algorithms with zero third-party packages.",
  },
  {
    icon: <FrameworkIcon />,
    accentClass: "text-accent-2",
    badgeBg: "bg-accent-2/10 border-accent-2/25",
    value: "Any",
    unit: "framework",
    label: "Universal architecture",
    detail: "First-party bindings for React, Angular, or Vanilla JS.",
  },
  {
    icon: <VirtualizationIcon />,
    accentClass: "text-accent-amber",
    badgeBg: "bg-accent-amber/10 border-accent-amber/25",
    value: "100k+",
    unit: "rows",
    label: "Smooth virtualization",
    detail: "Windowed rendering and memoized pipelines stay at 60fps.",
  },
];

export default function HeroFeatures() {
  return (
    <div className="mt-14 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((m) => (
        <div
          key={m.label}
          className="group relative rounded-md border border-grid-line bg-paper-raised/70 p-4 backdrop-blur-sm transition-all hover:border-grid-line-strong hover:bg-paper-raised"
        >
          <div className="flex items-center justify-between">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-sm border ${m.badgeBg} ${m.accentClass} transition-transform duration-200 group-hover:scale-105`}
            >
              {m.icon}
            </span>
            <div className="font-mono text-xl font-bold tracking-tight text-ink tabular-nums">
              {m.value}
              {m.unit && (
                <span className="ml-1 text-xs font-normal text-ink-faint uppercase tracking-wider">
                  {m.unit}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[13.5px] font-medium tracking-tight text-ink">{m.label}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{m.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
