"use client";

import { useMemo, useRef, useState } from "react";

type Row = {
  id: string;
  pkg: string;
  version: string;
  size: number; // kB, published tarball size
  tag: string;
};

const ROWS: Row[] = [
  { id: "01", pkg: "core", version: "0.0.10", size: 12.1, tag: "stable" },
  { id: "02", pkg: "react", version: "0.0.10", size: 9.1, tag: "stable" },
  { id: "03", pkg: "ui", version: "0.0.10", size: 9.7, tag: "stable" },
  { id: "04", pkg: "angular", version: "0.0.10", size: 30.2, tag: "stable" },
];

type SortDir = "asc" | "desc" | null;

const MIN_WIDTH = 64;

export default function LiveTable() {
  const [widths, setWidths] = useState<Record<string, number>>({
    id: 52,
    pkg: 118,
    version: 132,
    size: 84,
    tag: 72,
  });
  const [sortCol, setSortCol] = useState<keyof Row | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const dragState = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  const rows = useMemo(() => {
    if (!sortCol || !sortDir) return ROWS;
    const copy = [...ROWS];
    copy.sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [sortCol, sortDir]);

  function toggleSort(col: keyof Row) {
    if (sortCol !== col) {
      setSortCol(col);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortCol(null);
      setSortDir(null);
    }
  }

  function onResizeStart(col: string, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { col, startX: e.clientX, startWidth: widths[col] };
    const onMove = (moveEvent: PointerEvent) => {
      if (!dragState.current) return;
      const diff = moveEvent.clientX - dragState.current.startX;
      const next = Math.max(MIN_WIDTH, dragState.current.startWidth + diff);
      setWidths((w) => ({ ...w, [dragState.current!.col]: next }));
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const columns: { id: keyof Row; label: string; align?: "left" | "right"; pinned?: boolean }[] = [
    { id: "id", label: "#", pinned: true },
    { id: "pkg", label: "Package" },
    { id: "version", label: "Version" },
    { id: "size", label: "Size (kB)", align: "right" },
    { id: "tag", label: "Tag" },
  ];

  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-md border border-grid-line bg-paper-raised shadow-[0_1px_2px_rgba(11,18,32,0.04),0_0_40px_-16px_var(--accent)]">
      <div className="sweep-line motion-reduce:hidden" />
      <div className="flex items-center gap-1.5 border-b border-grid-line px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-accent-amber/70" />
        <span className="h-2 w-2 rounded-full bg-grid-line-strong" />
        <span className="h-2 w-2 rounded-full bg-grid-line-strong" />
        <span className="ml-2 font-mono text-[11px] text-ink-faint">packages.table</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full border-collapse font-mono text-[13px]" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: widths[col.id] }}
                  className={`group relative select-none border-b border-grid-line px-2.5 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-ink-muted ${
                    col.pinned ? "bg-accent-amber/10" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.id)}
                    className={`flex w-full items-center gap-1 ${col.align === "right" ? "justify-end" : "justify-start"} hover:text-ink`}
                  >
                    {col.pinned && <span className="text-accent-amber">▸</span>}
                    <span>{col.label}</span>
                    {sortCol === col.id && (
                      <span className="text-accent" aria-hidden>
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                  <span
                    onPointerDown={(e) => onResizeStart(col.id, e)}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none opacity-0 group-hover:opacity-100 hover:bg-accent/60"
                    aria-hidden
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="motion-safe:animate-[fadeInUp_0.4s_ease_backwards] border-b border-grid-line transition-colors last:border-b-0 hover:bg-paper-raised-2"
                style={{ animationDelay: `${i * 60 + 80}ms` }}
              >
                <td className="border-r border-grid-line bg-accent-amber/5 px-2.5 py-2 text-ink-faint">{row.id}</td>
                <td className="px-2.5 py-2 text-ink">{row.pkg}</td>
                <td className="px-2.5 py-2 text-ink-muted">{row.version}</td>
                <td className="tabular-nums px-2.5 py-2 text-right text-ink">{row.size.toFixed(1)}</td>
                <td className="px-2.5 py-2">
                  <span className="rounded-[3px] bg-accent/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                    {row.tag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-grid-line px-3 py-1.5 font-mono text-[11px] text-ink-faint">
        <span>4 rows</span>
        <span>try it — sort a header, drag an edge</span>
      </div>
    </div>
  );
}
