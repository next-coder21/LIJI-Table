const CATEGORY_STYLE: Record<string, { color: string; label: string; icon: "plus" | "wrench" | "refresh" | "check" | "warning" | "minus" }> = {
  Added: { color: "#22c55e", label: "Added", icon: "plus" },
  Fixed: { color: "var(--accent-amber)", label: "Fixed", icon: "wrench" },
  Changed: { color: "var(--accent)", label: "Changed", icon: "refresh" },
  Testing: { color: "var(--accent-2)", label: "Testing", icon: "check" },
  Deprecated: { color: "var(--accent-amber)", label: "Deprecated", icon: "warning" },
  Removed: { color: "var(--ink-faint)", label: "Removed", icon: "minus" },
};

const ICON_PATHS: Record<string, string> = {
  plus: "M12 5v14M5 12h14",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z",
  refresh: "M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0 0 14.6 2M19.5 9A8 8 0 0 0 4.9 7",
  check: "m5 13 4 4L19 7",
  warning: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01",
  minus: "M5 12h14",
};

export default function ChangelogCategoryIcon({ name }: { name: string }) {
  const style = CATEGORY_STYLE[name] ?? { color: "var(--ink-faint)", label: name, icon: "minus" as const };
  return (
    <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-wide" style={{ color: style.color }}>
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <path d={ICON_PATHS[style.icon]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {style.label}
    </span>
  );
}
