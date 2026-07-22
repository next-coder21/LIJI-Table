"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("liji-theme", next ? "light" : "dark");
    } catch {
      // localStorage unavailable — theme just won't persist across visits
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (isLight ? "Switch to dark theme" : "Switch to light theme") : "Toggle theme"}
      className="group relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-sm border border-grid-line text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="absolute transition-all duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          opacity: mounted && isLight ? 0 : 1,
          transform: mounted && isLight ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="absolute transition-all duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          opacity: mounted && isLight ? 1 : 0,
          transform: mounted && isLight ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
        }}
      >
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
