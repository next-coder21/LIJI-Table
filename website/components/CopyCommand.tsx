"use client";

import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — the command is still visible to copy manually
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group flex w-full max-w-md items-center justify-between gap-3 rounded-sm border px-4 py-2.5 text-left font-mono text-[13px] text-ink transition-all ${
        copied ? "border-accent shadow-[0_0_16px_-4px_var(--accent)]" : "border-grid-line hover:border-grid-line-strong"
      } bg-paper-raised`}
    >
      <span className="truncate">
        <span className="select-none text-ink-faint">$ </span>
        {command}
      </span>
      <span
        className={`flex shrink-0 items-center gap-1 text-[11px] uppercase tracking-wide transition-colors ${
          copied ? "text-accent" : "text-ink-faint group-hover:text-ink-muted"
        }`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="transition-all duration-200"
          style={{
            opacity: copied ? 1 : 0,
            transform: copied ? "scale(1)" : "scale(0.5)",
            width: copied ? 11 : 0,
          }}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
