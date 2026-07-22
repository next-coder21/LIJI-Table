import SpaceBackground from "./SpaceBackground";

export default function DocsHero() {
  return (
    <div id="top" className="relative overflow-hidden border-b border-grid-line scroll-mt-24">
      <SpaceBackground priority />
      <div className="relative py-14 sm:py-20">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">documentation</p>
        <h1 className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,1.1rem+2.6vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-ink">
          Build better data experiences with <span className="text-gradient">Liji Table</span>.
        </h1>
        <p className="mt-4 max-w-xl text-[clamp(0.9375rem,0.85rem+0.3vw,1.0625rem)] leading-relaxed text-ink-muted">
          A headless, framework-agnostic table engine for building powerful, high-performance data grids with
          complete control.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#quick-start"
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink shadow-[0_0_0_0_var(--accent)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_var(--accent)] light:bg-ink light:text-paper"
          >
            <span aria-hidden>🚀</span> Get started
          </a>
          <a
            href="https://github.com/next-coder21/LIJI-Table"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-grid-line-strong bg-paper/40 px-5 py-2.5 text-sm font-medium text-ink backdrop-blur-sm transition-colors hover:border-ink-faint"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.2 5.4 18.3.5 12 .5Z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
