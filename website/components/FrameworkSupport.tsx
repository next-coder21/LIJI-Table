import Link from "next/link";
import type { ReactNode } from "react";

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
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 17c0-2 1-3 3-3M16 11v6c0 1-1 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const STACKS: {
  icon: ReactNode;
  iconColor: string;
  badgeBg: string;
  name: string;
  pkg: string;
  desc: string;
  href: string;
}[] = [
  {
    icon: <ReactIcon />,
    iconColor: "text-[#00d8ff]",
    badgeBg: "bg-[#00d8ff]/10 border-[#00d8ff]/30",
    name: "React",
    pkg: "@liji-table/react",
    desc: "Hook-driven with useLijiTable, virtual scroll helpers, and pre-built @liji-table/ui component.",
    href: "/docs#react-api",
  },
  {
    icon: <AngularIcon />,
    iconColor: "text-[#f43f5e]",
    badgeBg: "bg-[#f43f5e]/10 border-[#f43f5e]/30",
    name: "Angular",
    pkg: "@liji-table/angular",
    desc: "UniversalTable class with RxJS state$ observables, computedColumnWidths$, and <liji-table> template.",
    href: "/docs#angular-api",
  },
  {
    icon: <VanillaJsIcon />,
    iconColor: "text-[#f59e0b]",
    badgeBg: "bg-[#f59e0b]/10 border-[#f59e0b]/30",
    name: "Vanilla JS",
    pkg: "@liji-table/core",
    desc: "Headless core with subscribe(), getRows(), and natural sorting. Zero runtime dependencies.",
    href: "/docs#core-api",
  },
];

export default function FrameworkSupport() {
  return (
    <section className="border-b border-grid-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-lg">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">works with your stack</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            React, Angular, or nothing at all.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            The core engine is framework-free. Native bindings feel first-class in your idiomatic stack.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STACKS.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="group flex flex-col justify-between rounded-md border border-grid-line bg-paper-raised p-5 transition-all hover:border-grid-line-strong hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-sm border ${s.badgeBg} ${s.iconColor} transition-transform duration-200 group-hover:scale-105`}>
                    {s.icon}
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint rounded border border-grid-line px-2 py-0.5">
                    {s.pkg}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-display text-[16px] font-semibold tracking-tight text-ink">{s.name}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.desc}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center text-[12.5px] font-medium text-accent transition-transform duration-200 group-hover:translate-x-1">
                <span>View {s.name} reference</span>
                <svg viewBox="0 0 24 24" fill="none" className="ml-1 h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
