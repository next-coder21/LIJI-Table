import SpaceBackground from "./SpaceBackground";

export default function PlaygroundHero() {
  return (
    <div className="relative overflow-hidden border-b border-grid-line">
      <SpaceBackground priority />
      <div className="relative mx-auto max-w-[clamp(64rem,94vw,100rem)] px-[clamp(1.25rem,3vw,3.5rem)] py-14 sm:py-20 text-center">
        <span className="inline-flex items-center rounded-full border border-grid-line-strong bg-paper-raised/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
          interactive playground
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(1.75rem,1.1rem+2.6vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-ink">
          Test the component <span className="text-gradient">hands-on</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
          This is the production <code className="font-mono text-ink text-[13px] bg-paper-raised px-1.5 py-0.5 rounded border border-grid-line">@liji-table/ui</code> component live. Sort, filter, drag-resize headers, pin columns, toggle density, and persist your layout to localStorage.
        </p>
      </div>
    </div>
  );
}

