import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

function ReactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)" />
    </svg>
  );
}

function AngularIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M12 2.5 21 6l-1.4 12L12 21.5 4.4 18 3 6l9-3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 6.5 17 17.5M12 6.5 7 17.5M9 13.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VanillaJsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M8 3 6 21M16 3l2 18M4 8h3m10 0h3M3.5 16h3m11 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const STACKS: { icon: ReactNode; from: string; to: string; name: string; desc: string; href: string }[] = [
  { icon: <ReactIcon />, from: "var(--accent)", to: "#3552f0", name: "React", desc: "useLijiTable hook, or the prebuilt @liji-table/ui component.", href: "/docs#react-api" },
  { icon: <AngularIcon />, from: "#dd0031", to: "#c3002f", name: "Angular", desc: "UniversalTable class + the <liji-table> component.", href: "/docs#angular-api" },
  { icon: <VanillaJsIcon />, from: "var(--accent-amber)", to: "#ef4444", name: "Vanilla JS", desc: "Just @liji-table/core and subscribe() — no framework at all.", href: "/docs#core-api" },
];

export default function FrameworkSupport() {
  return (
    <section className="border-b border-grid-line">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-lg">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">works with your stack</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            React, Angular, or nothing at all.
          </h2>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STACKS.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="group flex items-start gap-3 rounded-md border border-grid-line p-5 transition-colors hover:border-grid-line-strong hover:bg-paper-raised"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_14px_-2px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` } as CSSProperties}
              >
                {s.icon}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="font-display text-[15px] font-semibold tracking-tight text-ink">{s.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
