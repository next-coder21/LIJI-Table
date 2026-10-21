"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const GITHUB_URL = "https://github.com/next-coder21/LIJI-Table";
const NPM_URL = "https://www.npmjs.com/package/@liji-table/core";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/playground", label: "Playground" },
  { href: "/changelog", label: "Changelog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>

      <header className="sticky top-0 z-40 border-b border-grid-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {pathname !== "/" && (
              <Link
                href="/"
                aria-label="Back to home"
                title="Back to home"
                className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M15 5 8 12l7 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
            <Link
              href="/"
              className="group flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Image
                src={`${BASE_PATH}/logo-mark.png`}
                alt="Liji Table Logo"
                width={28}
                height={28}
                priority
                className="motion-safe:animate-[bootGlow_1.6s_ease-out] transition-transform duration-300 group-hover:scale-110"
              />
              liji-table
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm sm:flex" aria-label="Main navigation">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative pb-1 transition-colors ${
                    active ? "font-medium text-accent" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
            <a
              href={NPM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-ink-muted transition-colors hover:text-ink"
            >
              npm
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-ink-muted transition-colors hover:text-ink"
            >
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-sm bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink shadow-[0_0_0_0_var(--accent)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_-2px_var(--accent)] sm:inline-block"
            >
              Star on GitHub
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-grid-line text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink sm:hidden"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="border-b border-grid-line bg-paper-raised px-6 py-5 sm:hidden motion-safe:animate-[fadeInUp_0.2s_ease_backwards]"
          >
            <nav className="flex flex-col space-y-3" aria-label="Mobile navigation">
              {LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-sm px-3 py-2 text-[15px] font-medium transition-colors ${
                      active ? "bg-accent/10 text-accent" : "text-ink-muted hover:bg-paper hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-grid-line pt-3 flex flex-col space-y-2">
                <a
                  href={NPM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm px-3 py-2 text-[14px] text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                >
                  npm package
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm px-3 py-2 text-[14px] text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                >
                  GitHub Repository
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-ink"
                >
                  Star on GitHub
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
