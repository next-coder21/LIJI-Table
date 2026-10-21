"use client";

import { GROUPS } from "./DocsSidebar";

export default function MobileDocsNav() {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val) {
      window.location.hash = val;
    }
  }

  return (
    <div className="mb-8 rounded-md border border-grid-line bg-paper-raised p-3 lg:hidden">
      <label htmlFor="docs-jump" className="block text-[11px] font-mono uppercase tracking-wider text-ink-faint">
        Jump to documentation section:
      </label>
      <select
        id="docs-jump"
        onChange={handleChange}
        defaultValue=""
        className="mt-1.5 w-full rounded border border-grid-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      >
        <option value="" disabled>Select section...</option>
        <option value="#top">Introduction</option>
        {GROUPS.map((g) => (
          <optgroup key={g.heading} label={g.heading}>
            {g.items.map((i) => (
              <option key={i.href} value={i.href}>
                {i.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

