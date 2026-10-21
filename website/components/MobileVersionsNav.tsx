"use client";

import type { VersionMeta } from "./VersionsSidebar";

export default function MobileVersionsNav({ versions }: { versions: VersionMeta[] }) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val) {
      window.location.hash = val;
    }
  }

  return (
    <div className="mb-6 rounded-md border border-grid-line bg-paper-raised p-3 lg:hidden">
      <label htmlFor="version-jump" className="block text-[11px] font-mono uppercase tracking-wider text-ink-faint">
        Jump to version release:
      </label>
      <select
        id="version-jump"
        onChange={handleChange}
        defaultValue=""
        className="mt-1.5 w-full rounded border border-grid-line bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-accent focus:outline-none"
      >
        <option value="" disabled>Select version...</option>
        {versions.map((v) => (
          <option key={v.id} value={`#${v.id}`}>
            v{v.version} {v.date ? `(${v.date})` : "(Dev)"}
          </option>
        ))}
      </select>
    </div>
  );
}

