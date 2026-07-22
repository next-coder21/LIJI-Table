import Link from "next/link";
import LiveTable from "./LiveTable";
import CopyCommand from "./CopyCommand";
import SpaceBackground from "./SpaceBackground";
import HeroFeatures from "./HeroFeatures";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-grid-line">
      <SpaceBackground priority />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-[1.05fr_1fr] md:items-center">
          <div className="motion-safe:animate-[fadeInUp_0.5s_ease_backwards]">
            <span className="inline-flex items-center rounded-full border border-grid-line-strong bg-paper-raised/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
              framework-agnostic table engine
            </span>

            <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[3.25rem]">
              One table engine.
              <br />
              <span className="text-gradient">Every framework.</span>
            </h1>

            <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
              Liji Table is a headless data-grid core with React, Angular, and pre-built UI bindings.
              Sorting, filtering, grouping, virtualization, and layout persistence — in about 12&nbsp;kB, with zero required dependencies.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink shadow-[0_0_0_0_var(--accent)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_var(--accent)] light:bg-ink light:text-paper"
              >
                <span aria-hidden>🚀</span> Get started
              </Link>
              <a
                href="https://github.com/next-coder21/LIJI-Table"
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-grid-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-grid-line-strong"
              >
                View on GitHub
              </a>
            </div>

            <div className="mt-6">
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
