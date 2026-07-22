import Link from "next/link";
import CopyCommand from "./CopyCommand";
import CodeTabs from "./CodeTabs";
import AmbientStars from "./AmbientStars";

const INSTALLS = [
  { label: "React", command: "npm install @liji-table/core @liji-table/react" },
  { label: "React + prebuilt UI", command: "npm install @liji-table/core @liji-table/react @liji-table/ui" },
  { label: "Angular", command: "npm install @liji-table/core @liji-table/angular" },
  { label: "Core only", command: "npm install @liji-table/core" },
];

export default function Cta() {
  return (
    <section id="docs" className="relative overflow-hidden border-b border-grid-line">
      <AmbientStars />
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-lg">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">get started</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Pick your stack. The engine is the same underneath.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            Every binding is a thin wrapper over the same <code className="font-mono text-[13px] text-ink">@liji-table/core</code>{" "}
            engine — what you learn once applies everywhere. Full installation guide and API reference are in{" "}
            <Link href="/docs" className="text-ink underline decoration-grid-line-strong underline-offset-2 hover:decoration-accent">
              the docs
            </Link>
            .
          </p>
        </div>

        <div className="mt-8">
          <CodeTabs />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {INSTALLS.map((install) => (
            <div key={install.label}>
              <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-faint">{install.label}</p>
              <CopyCommand command={install.command} />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 rounded-sm border border-grid-line px-5 py-2.5 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-grid-line-strong"
          >
            Read the full documentation
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
