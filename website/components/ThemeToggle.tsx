"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      try {
        localStorage.setItem("liji-theme", "light");
      } catch {}
    } else {
      document.documentElement.classList.remove("light");
      try {
        localStorage.setItem("liji-theme", "dark");
      } catch {}
    }
  }

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-sm border border-grid-line ${className}`} aria-hidden />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className={`flex h-8 w-8 items-center justify-center rounded-sm border border-grid-line bg-paper-raised text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink ${className}`}
    >
      {isLight ? (
        // Moon icon (to switch to dark)
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Sun icon (to switch to light)
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

