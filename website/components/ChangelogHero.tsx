import SpaceBackground from "./SpaceBackground";

export default function ChangelogHero() {
  return (
    <div className="relative overflow-hidden border-b border-grid-line">
      <SpaceBackground priority />
      <div className="relative mx-auto max-w-[clamp(64rem,94vw,100rem)] px-[clamp(1.25rem,3vw,3.5rem)] py-16 text-center sm:py-20">
        <span className="inline-flex items-center rounded-full border border-grid-line-strong bg-paper-raised/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
          changelog
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(1.75rem,1.1rem+2.6vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-ink">
          Every notable <span className="text-gradient">change,</span> by version.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
          Follows{" "}
          <a
            href="https://keepachangelog.com/en/1.0.0/"
            target="_blank"
            rel="noreferrer"
            className="text-ink underline decoration-grid-line-strong underline-offset-2 hover:decoration-accent"
          >
            Keep a Changelog
          </a>{" "}
          and{" "}
          <a
            href="https://semver.org/"
            target="_blank"
            rel="noreferrer"
            className="text-ink underline decoration-grid-line-strong underline-offset-2 hover:decoration-accent"
          >
            Semantic Versioning
          </a>
          .
        </p>
      </div>
    </div>
  );
}
