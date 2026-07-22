import type { CSSProperties, ReactNode } from "react";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function ColumnsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 4v16M15 4v16" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm-8 8.5 8 4.5 8-4.5M4 16l8 4.5L20 16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 21s7-6.1 7-11.5S15.9 3 12 3 5 5.6 5 9.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const GUIDES: { icon: ReactNode; color: string; title: string; desc: string; href: string }[] = [
  { icon: <DownloadIcon />, color: "var(--accent)", title: "Installation", desc: "Install Liji Table and pick a framework binding.", href: "#installation" },
  { icon: <BoltIcon />, color: "var(--accent-amber)", title: "Quick start", desc: "Create your first table in a few minutes.", href: "#quick-start" },
  { icon: <ColumnsIcon />, color: "#2dd4bf", title: "Column definition", desc: "The shared TableColumn shape every binding reads.", href: "#columns" },
  { icon: <LayersIcon />, color: "var(--accent-2)", title: "Core API", desc: "The engine underneath every framework binding.", href: "#core-api" },
  { icon: <PinIcon />, color: "var(--accent)", title: "Layout persistence", desc: "Save and restore a user's column arrangement.", href: "#persistence" },
];

export default function DocsGuides() {
  return (
    <div className="mt-14">
      <div className="flex items-center gap-2">
        <span aria-hidden>🛰️</span>
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Guides</h2>
      </div>
      <p className="mt-1.5 text-[14px] text-ink-muted">Step-by-step guides to get you up and running.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {GUIDES.map((g) => (
          <a
            key={g.title}
            href={g.href}
            className="group flex flex-col justify-between rounded-md border border-grid-line p-5 transition-colors hover:border-grid-line-strong hover:bg-paper-raised"
          >
            <div>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-md border"
                style={
                  {
                    color: g.color,
                    borderColor: `color-mix(in srgb, ${g.color} 35%, transparent)`,
                    background: `color-mix(in srgb, ${g.color} 15%, transparent)`,
                  } as CSSProperties
                }
              >
                {g.icon}
              </span>
              <p className="mt-3 font-medium text-ink">{g.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{g.desc}</p>
            </div>
            <span
              aria-hidden
              className="mt-4 inline-flex items-center text-ink-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink"
            >
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
