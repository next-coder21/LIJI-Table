import Link from "next/link";
import LiveTable from "./LiveTable";
import CopyCommand from "./CopyCommand";
import SpaceBackground from "./SpaceBackground";
import HeroFeatures from "./HeroFeatures";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-grid-line">
      <SpaceBackground priority />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14">
          <div className="motion-safe:animate-[fadeInUp_0.5s_ease_backwards]">
            <span className="inline-flex items-center rounded-full border border-grid-line-strong bg-paper-raised/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
              framework-agnostic table engine
            </span>

            <h1 className="mt-5 font-display text-[clamp(1.85rem,6.5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-ink">
              One table engine.
              <br />
              <span className="text-gradient">Every framework.</span>
            </h1>

            <p className="mt-5 max-w-md text-[clamp(0.95rem,2.5vw,1.0625rem)] leading-relaxed text-ink-muted">
              Liji Table is a headless data-grid core with React, Angular, and pre-built UI bindings.
              Sorting, filtering, grouping, virtualization, and layout persistence — in about 12&nbsp;kB, with zero required dependencies.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink shadow-[0_0_0_0_var(--accent)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Get started</span>
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="https://github.com/next-coder21/LIJI-Table"
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-grid-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-grid-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                View on GitHub
              </a>
            </div>

            <div className="mt-6 max-w-md">
              <CopyCommand command="npm install @liji-table/core @liji-table/react" />
            </div>
          </div>

          <div
            className="flex justify-center motion-safe:animate-[fadeInUp_0.5s_ease_backwards] md:justify-end"
            style={{ animationDelay: "120ms" }}
          >
            <LiveTable />
          </div>
        </div>

        <HeroFeatures />
      </div>
    </section>
  );
}
