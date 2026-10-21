"use client";

import { useEffect, useRef, useState } from "react";
import ChangelogCategoryIcon from "@/components/ChangelogCategoryIcon";
import type { ChangelogEntry } from "@/lib/changelog";
import { renderInline } from "@/lib/inline-markdown";

const DOT_COLORS = ["var(--accent-2)", "var(--accent)", "#2dd4bf", "var(--accent-amber)"];

function idFor(version: string) {
  return `v${version.replace(/[^a-zA-Z0-9.-]/g, "")}`;
}

function flattenCategories(entry: ChangelogEntry) {
  const order: string[] = [];
  const byCategory = new Map<string, { text: string; pkg?: string }[]>();
  const multiPackage = entry.packages.length > 1;

  for (const pkg of entry.packages) {
    for (const cat of pkg.categories) {
      if (!byCategory.has(cat.name)) {
        byCategory.set(cat.name, []);
        order.push(cat.name);
      }
      const bucket = byCategory.get(cat.name)!;
      for (const item of cat.items) {
        bucket.push({ text: item, pkg: multiPackage ? pkg.name.replace("@liji-table/", "") : undefined });
      }
    }
  }

  return order.map((name) => ({ name, items: byCategory.get(name)! }));
}

export default function ChangelogList({ entries }: { entries: ChangelogEntry[] }) {
  // Only the current / first release is expanded by default (index === 0).
  // All older releases are collapsed by default.
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (entries.length > 0) {
      initial[entries[0].version] = true;
    }
    return initial;
  });

  const toggle = (version: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [version]: !prev[version],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    for (const e of entries) all[e.version] = true;
    setExpandedMap(all);
  };

  const collapseAll = () => {
    // Keep only the first/latest one open
    const latestOnly: Record<string, boolean> = {};
    if (entries.length > 0) latestOnly[entries[0].version] = true;
    setExpandedMap(latestOnly);
  };

  // Auto-expand and scroll if user navigates via sidebar or anchor hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#v", "").replace("#", "");
      if (!hash) return;
      const target = entries.find((e) => idFor(e.version) === `v${hash}` || e.version === hash);
      if (target) {
        setExpandedMap((prev) => ({ ...prev, [target.version]: true }));
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [entries]);

  const listRef = useRef<HTMLDivElement>(null);
  const travelerRef = useRef<HTMLSpanElement>(null);

  // A white dot travels up the timeline (oldest -> latest); every version dot it touches turns green.
  useEffect(() => {
    const list = listRef.current;
    const traveler = travelerRef.current;
    if (!list || !traveler) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      traveler.style.display = "none";
      return;
    }
    const GREEN = "#22c55e";
    let raf = 0;
    let start = performance.now();
    const CYCLE = 18000;
    const PAUSE = 1200;

    const reset = (dots: HTMLElement[]) => {
      for (const d of dots) {
        d.dataset.hit = "";
        d.style.background = d.dataset.bg ?? "";
        d.style.boxShadow = "";
        d.style.animation = "";
        const inner = d.firstElementChild as HTMLElement | null;
        if (inner) inner.style.background = d.dataset.fg ?? "";
      }
    };

    const frame = (now: number) => {
      const dots = Array.from(list.querySelectorAll<HTMLElement>("[data-tl-dot]:not([data-latest])"));
      for (const d of dots) {
        if (d.dataset.bg === undefined) {
          d.dataset.bg = d.style.background;
          d.dataset.fg = (d.firstElementChild as HTMLElement | null)?.style.background ?? "";
        }
      }
      const elapsed = now - start;
      if (elapsed > CYCLE + PAUSE) {
        start = now;
        reset(dots);
      }
      const t = Math.min(elapsed / CYCLE, 1);
      const listRect = list.getBoundingClientRect();
      const y = listRect.height * (1 - t);
      traveler.style.top = `${y}px`;
      traveler.style.opacity = elapsed > CYCLE ? "0" : "1";
      for (const d of dots) {
        const r = d.getBoundingClientRect();
        const center = r.top - listRect.top + r.height / 2;
        if (!d.dataset.hit && Math.abs(center - y) < 8) {
          d.dataset.hit = "1";
          d.style.background = `color-mix(in srgb, ${GREEN} 35%, var(--paper-raised))`;
          d.style.boxShadow = `0 0 10px ${GREEN}`;
          const inner = d.firstElementChild as HTMLElement | null;
          if (inner) inner.style.background = GREEN;
        }
        // Blink the dot the white traveler is currently passing through.
        const active = d.dataset.hit === "1" && Math.abs(center - y) < 28 && elapsed <= CYCLE;
        d.style.animation = active ? "tl-blink 0.6s ease-in-out infinite" : "";
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const allExpanded = entries.every((e) => expandedMap[e.version]);

  return (
    <div>
      {/* Controls bar above timeline */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-grid-line pb-4">
        <span className="font-mono text-xs text-ink-muted">
          Showing <span className="font-semibold text-ink">{entries.length}</span> releases &mdash; Latest expanded by default
        </span>
        <div className="flex items-center gap-2">
          {allExpanded ? (
            <button
              type="button"
              onClick={collapseAll}
              className="inline-flex items-center gap-1.5 rounded-sm border border-grid-line px-2.5 py-1 font-mono text-[11.5px] text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink cursor-pointer"
            >
              Collapse older
            </button>
          ) : (
            <button
              type="button"
              onClick={expandAll}
              className="inline-flex items-center gap-1.5 rounded-sm border border-grid-line px-2.5 py-1 font-mono text-[11.5px] text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink cursor-pointer"
            >
              Expand all
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} className="relative">
        <style>{`@keyframes tl-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); transform: scale(1); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); transform: scale(1.25); } } @keyframes tl-blink { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.7); opacity: 0.35; } }`}</style>
        <span ref={travelerRef} aria-hidden className="pointer-events-none absolute left-0 z-20 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ top: "100%", boxShadow: "0 0 8px 2px rgba(255,255,255,0.8)" }} />
        {/* Continuous timeline line running through the dots (bottom to top) */}
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 top-0 w-0.5 -translate-x-1/2 rounded-full" style={{ background: "linear-gradient(to top, var(--grid-line-strong, #334155), var(--accent-2) 60%, var(--accent))" }} />
      <ol className="relative space-y-8 pl-8">
        {entries.map((entry, i) => {
          const color = DOT_COLORS[i % DOT_COLORS.length];
          const categories = flattenCategories(entry);
          const id = idFor(entry.version);
          const isLatest = i === 0;
          const isExpanded = !!expandedMap[entry.version];
          const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

          return (
            <li key={entry.version} id={id} className="relative scroll-mt-24">
              {/* Dot on timeline */}
              <span
                data-tl-dot=""
                data-latest={isLatest ? "1" : undefined}
                className="absolute -left-[2.5rem] top-5 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper"
                style={isLatest ? { background: "color-mix(in srgb, #22c55e 35%, var(--paper-raised))", animation: "tl-pulse 1.4s ease-in-out infinite" } : { background: `color-mix(in srgb, ${color} 25%, var(--paper-raised))` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: isLatest ? "#22c55e" : color }} />
              </span>

              {/* Card */}
              <div
                className={`rounded-md border transition-colors ${
                  isExpanded ? "border-grid-line bg-paper-raised" : "border-grid-line bg-paper hover:border-grid-line-strong"
                } p-6`}
              >
                {/* Header row - clickable to toggle */}
                <div
                  className="flex flex-wrap items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggle(entry.version)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-grid-line text-ink-muted transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : "rotate-0"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>

                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="font-mono text-xl font-semibold tabular-nums text-ink">v{entry.version}</h2>
                        {isLatest && (
                          <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent border border-accent/30">
                            Latest
                          </span>
                        )}
                        {entry.date && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-grid-line px-2.5 py-0.5 font-mono text-[12px] text-ink-faint">
                            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            {entry.date}
                          </span>
                        )}
                        {!isExpanded && totalItems > 0 && (
                          <span className="font-mono text-[12px] text-ink-muted">
                            ({totalItems} change{totalItems !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {entry.date && (
                      <a
                        href={`https://github.com/next-coder21/LIJI-Table/releases/tag/v${entry.version}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-grid-line px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.2 5.4 18.3.5 12 .5Z" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggle(entry.version)}
                      className="inline-flex items-center gap-1 rounded-sm border border-grid-line px-2.5 py-1.5 text-[12px] font-mono text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink cursor-pointer"
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>

                {/* Collapsed summary teaser */}
                {!isExpanded && (
                  <div
                    className="mt-3 cursor-pointer pt-2 text-[13px] text-ink-muted/80 hover:text-ink transition-colors flex items-center justify-between"
                    onClick={() => toggle(entry.version)}
                  >
                    <span>Click to view {totalItems} changes across packages...</span>
                    <span className="font-mono text-xs text-accent">Show details &rarr;</span>
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <>
                    {entry.note.length > 0 && (
                      <div className="mt-4 space-y-1.5 border-t border-grid-line/60 pt-4">
                        {entry.note.map((line, li) =>
                          line.startsWith("- ") ? (
                            <p key={li} className="flex gap-2 text-[14px] leading-relaxed text-ink-muted">
                              <span aria-hidden className="text-ink-faint">
                                &ndash;
                              </span>
                              <span>{renderInline(line.slice(2))}</span>
                            </p>
                          ) : (
                            <p key={li} className="text-[14px] leading-relaxed text-ink-muted">
                              {renderInline(line)}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {categories.length > 0 && (
                      <div className="mt-5 space-y-4 border-t border-grid-line/60 pt-4">
                        {categories.map((cat) => (
                          <div key={cat.name}>
                            <ChangelogCategoryIcon name={cat.name} />
                            <ul className="mt-2 space-y-1.5">
                              {cat.items.map((item, ii) => (
                                <li key={ii} className="flex gap-2 text-[14px] leading-relaxed text-ink-muted">
                                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                                  <span>
                                    {item.pkg && (
                                      <span className="mr-1.5 rounded-[3px] bg-paper-raised-2 px-1 py-0.5 font-mono text-[11px] text-ink-faint">
                                        {item.pkg}
                                      </span>
                                    )}
                                    {renderInline(item.text)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      </div>
    </div>
  );
}

