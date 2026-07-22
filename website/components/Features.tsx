import AmbientStars from "./AmbientStars";

const FEATURES = [
  { label: "Natural sort", desc: "Multi-column, Intl.Collator-based — “Item 2” sorts before “Item 10”." },
  { label: "Advanced filters", desc: "14 operators per column: contains, between, inList, and more." },
  { label: "Inline editing", desc: "Per-cell editors with validators, committed or cancelled explicitly." },
  { label: "Pagination", desc: "Client-side, configurable page size, safe boundary handling." },
  { label: "Auto-fit widths", desc: "Un-resized columns fill the container; resizing one never shifts another." },
  { label: "Column pinning", desc: "Pin left or right — pinned columns auto-reorder into place." },
  { label: "Drag to reorder", desc: "Native HTML5 drag-and-drop, no extra dependency." },
  { label: "Row selection", desc: "Individual and page-aware bulk selection." },
  { label: "Row grouping", desc: "Nested grouping by any column, with expand and collapse." },
  { label: "Virtualization", desc: "Windowed rendering keeps thousands of rows smooth." },
  { label: "CSV export", desc: "Exports exactly the columns currently visible." },
  { label: "Layout persistence", desc: "Save column order, width, pin, and alignment to localStorage." },
];

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden border-b border-grid-line">
      <AmbientStars />
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-lg">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">what&apos;s inside</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Every feature a real table needs. Nothing it doesn&apos;t.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 border-l border-t border-grid-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="group relative border-b border-r border-grid-line p-6 transition-colors hover:bg-paper-raised"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-linear-to-r from-accent to-accent-2 transition-transform duration-300 group-hover:scale-x-100" />
              <h3 className="font-mono text-[14px] font-semibold text-ink">{f.label}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
