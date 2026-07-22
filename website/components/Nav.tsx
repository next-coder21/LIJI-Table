"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const GITHUB_URL = "https://github.com/next-coder21/LIJI-Table";
const NPM_URL = "https://www.npmjs.com/package/@liji-table/core";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-grid-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {pathname !== "/" && (
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-muted transition-colors hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <Link href="/" className="group flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight">
            <Image
              src="/logo-mark.png"
              alt=""
              width={28}
              height={28}
              priority
              className="motion-safe:animate-[bootGlow_1.6s_ease-out] transition-transform duration-300 group-hover:scale-110"
            />
            liji-table
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 transition-colors ${active ? "text-accent" : "text-ink-muted hover:text-ink"}`}
              >
                {link.label}
                {active && <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-accent" />}
              </Link>
            );
          })}
          <a href={NPM_URL} target="_blank" rel="noreferrer" className="text-ink-muted transition-colors hover:text-ink">
            npm
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-ink-muted transition-colors hover:text-ink">
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-sm bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink shadow-[0_0_0_0_var(--accent)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_-2px_var(--accent)] sm:inline-block light:bg-ink light:text-paper"
          >
            Star on GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
