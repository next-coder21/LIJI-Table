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
      aria-label={`Copy command to clipboard: ${command}`}
      title={copied ? "Copied to clipboard" : `Copy: ${command}`}
      className={`group flex w-full max-w-md items-center justify-between gap-3 rounded-sm border px-3.5 py-2.5 text-left font-mono text-[13px] text-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        copied
          ? "border-accent bg-paper-raised shadow-[0_0_16px_-4px_var(--accent)]"
          : "border-grid-line bg-paper-raised hover:border-grid-line-strong active:scale-[0.99]"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">
        <span className="select-none text-ink-faint">$ </span>
        <span>{command}</span>
      </span>
      <span
        className={`flex shrink-0 items-center gap-1.5 rounded-[3px] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${
          copied ? "bg-accent/15 text-accent" : "bg-paper text-ink-faint group-hover:text-ink"
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
