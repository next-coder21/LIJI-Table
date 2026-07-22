"use client";

import { useEffect, useState } from "react";

const DOT_COLORS = ["var(--accent-2)", "var(--accent)", "#2dd4bf", "var(--accent-amber)"];

export type VersionMeta = { id: string; version: string; date?: string };

export default function VersionsSidebar({ versions }: { versions: VersionMeta[] }) {
  const [activeId, setActiveId] = useState(versions[0]?.id);

  useEffect(() => {
    const sections = versions.map((v) => document.getElementById(v.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size === 0) return;
        const topMost = versions.find((v) => visible.has(v.id));
        if (topMost) setActiveId(topMost.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10">
      <div className="flex items-center gap-2 px-1">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: "color-mix(in srgb, var(--accent-2) 20%, transparent)" }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent-2)" }} />
        </span>
        <p className="font-display text-[15px] font-semibold tracking-tight text-ink">Versions</p>
      </div>

      <ul className="mt-4 space-y-1">
        {versions.map((v, i) => {
          const color = DOT_COLORS[i % DOT_COLORS.length];
          const active = activeId === v.id;
          return (
            <li key={v.id}>
              <a
                href={`#${v.id}`}
                onClick={() => setActiveId(v.id)}
                className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-[13.5px] transition-colors ${
                  active ? "border-grid-line-strong bg-paper-raised text-ink" : "border-transparent text-ink-muted hover:bg-paper-raised hover:text-ink"
                }`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                <span className="font-mono">v{v.version}</span>
                {i === 0 && v.date && (
                  <span
                    className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-white"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                  >
                    Latest
                  </span>
                )}
                {!v.date && (
                  <span
                    className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide"
                    style={{ background: "color-mix(in srgb, var(--accent-amber) 20%, transparent)", color: "var(--accent-amber)" }}
                  >
                    Dev
                  </span>
                )}
                {v.date && <span className="ml-auto shrink-0 font-mono text-[11.5px] text-ink-faint">{v.date}</span>}
              </a>
            </li>
          );
        })}
      </ul>

      <a
        href="https://github.com/next-coder21/LIJI-Table/tags"
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-md border border-grid-line px-3 py-2 text-[13px] text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.2 5.4 18.3.5 12 .5Z" />
        </svg>
        View all tags on GitHub
      </a>
    </div>
  );
}
