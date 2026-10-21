import Image from "next/image";
import Link from "next/link";
import AmbientStars from "./AmbientStars";

const PACKAGES = [
  { name: "@liji-table/core", href: "https://www.npmjs.com/package/@liji-table/core" },
  { name: "@liji-table/react", href: "https://www.npmjs.com/package/@liji-table/react" },
  { name: "@liji-table/angular", href: "https://www.npmjs.com/package/@liji-table/angular" },
  { name: "@liji-table/ui", href: "https://www.npmjs.com/package/@liji-table/ui" },
];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden">
      <AmbientStars />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <div className="flex items-center gap-2">
              <Image src={`${BASE_PATH}/logo-mark.png`} alt="" width={20} height={20} />
              <p className="font-display text-sm font-semibold text-ink">liji-table</p>
            </div>
            <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
              A headless, framework-agnostic data-grid engine. MIT licensed, currently at{" "}
              <span className="font-mono tabular-nums">0.0.10</span>.
            </p>
            <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              systems nominal
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">Packages</p>
            <ul className="mt-3 space-y-2 font-mono text-[13px]">
              {PACKAGES.map((pkg) => (
                <li key={pkg.name}>
                  <a href={pkg.href} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-ink">
                    {pkg.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">Project</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>
                <Link href="/docs" className="text-ink-muted hover:text-ink">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-ink-muted hover:text-ink">
                  Changelog
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/next-coder21/LIJI-Table"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-muted hover:text-ink"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/next-coder21/LIJI-Table/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-muted hover:text-ink"
                >
                  License
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-grid-line pt-6 text-[12.5px] text-ink-faint">
          <span>
            © {new Date().getFullYear()} Liji Table. MIT License.
          </span>
          <span>Developed by Lijish Wilson</span>
        </div>
      </div>
    </footer>
  );
}
