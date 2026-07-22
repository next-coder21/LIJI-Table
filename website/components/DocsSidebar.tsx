"use client";

import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; href: string };
type NavGroup = { heading: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    heading: "Getting started",
    items: [
      { label: "Installation", href: "#installation" },
      { label: "Quick start", href: "#quick-start" },
      { label: "Column definition", href: "#columns" },
    ],
  },
  {
    heading: "Core API",
    items: [{ label: "@liji-table/core", href: "#core-api" }],
  },
  {
    heading: "Framework bindings",
    items: [
      { label: "@liji-table/react", href: "#react-api" },
      { label: "@liji-table/angular", href: "#angular-api" },
      { label: "@liji-table/ui", href: "#ui-api" },
    ],
  },
  {
    heading: "Advanced",
    items: [{ label: "Layout persistence", href: "#persistence" }],
  },
];

const ALL_IDS = ["top", ...GROUPS.flatMap((g) => g.items.map((i) => i.href.slice(1)))];

function useActiveSection() {
  const [activeId, setActiveId] = useState("top");

  useEffect(() => {
    const sections = ALL_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick whichever visible section appears first in document order.
        const topMost = ALL_IDS.find((id) => visible.has(id));
        if (topMost) setActiveId(topMost);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return [activeId, setActiveId] as const;
}

export default function DocsSidebar() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useActiveSection();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q) || g.heading.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10">
      <label className="relative block">
        <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs..."
          className="w-full rounded-md border border-grid-line bg-paper-raised py-2 pl-9 pr-12 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-grid-line-strong focus:outline-none"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-grid-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
          /
        </kbd>
      </label>

      <a
        href="#top"
        onClick={() => setActiveId("top")}
        className={`mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-[13.5px] font-medium transition-colors ${
          activeId === "top" ? "border-accent/30 bg-accent/10 text-accent" : "border-transparent text-ink-muted hover:bg-paper-raised hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
          <path d="m4 11 8-7 8 7M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Introduction
      </a>

      <nav className="mt-6 space-y-6">
        {filtered.map((group) => (
          <div key={group.heading}>
            <p className="px-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{group.heading}</p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = activeId === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setActiveId(item.href.slice(1))}
                      className={`block rounded-md px-3 py-1.5 text-[13.5px] transition-colors ${
                        active ? "bg-accent/10 text-accent" : "text-ink-muted hover:bg-paper-raised hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-3 text-[13px] text-ink-faint">No matches.</p>}
      </nav>
    </div>
  );
}
