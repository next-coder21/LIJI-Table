import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChangelogHero from "@/components/ChangelogHero";
import VersionsSidebar, { type VersionMeta } from "@/components/VersionsSidebar";
import ChangelogCategoryIcon from "@/components/ChangelogCategoryIcon";
import { getChangelog, type ChangelogEntry } from "@/lib/changelog";
import { renderInline } from "@/lib/inline-markdown";

export const metadata: Metadata = {
  title: "Changelog — Liji Table",
  description: "Every notable change to Liji Table, by version.",
};

const DOT_COLORS = ["var(--accent-2)", "var(--accent)", "#2dd4bf", "var(--accent-amber)"];

/** Flatten an entry's per-package categories into one ordered list, tagging
 * each item with its source package when more than one package changed. */
function flattenCategories(entry: ChangelogEntry) {
  const order: string[] = [];
  const byCategory = new Map<string, { text: string; pkg?: string }[]>();
  const multiPackage = entry.packages.length > 1;

  for (const pkg of entry.packages) {
    for (const cat of pkg.categories) {
      if (!byCategory.has(cat.name)) {
        byCategory.set(cat.name, []);
        order.push(cat.name);
      }
      const bucket = byCategory.get(cat.name)!;
      for (const item of cat.items) {
        bucket.push({ text: item, pkg: multiPackage ? pkg.name.replace("@liji-table/", "") : undefined });
      }
    }
  }

  return order.map((name) => ({ name, items: byCategory.get(name)! }));
}

function idFor(version: string) {
  return `v${version.replace(/[^a-zA-Z0-9.-]/g, "")}`;
}

export default function ChangelogPage() {
  const { entries, unreleased } = getChangelog();
  const versions: VersionMeta[] = entries.map((e) => ({ id: idFor(e.version), version: e.version, date: e.date }));

  return (
    <>
      <Nav />
      <main className="relative flex-1">
        <ChangelogHero />

        <div className="relative mx-auto max-w-[clamp(64rem,94vw,100rem)] px-[clamp(1.25rem,3vw,3.5rem)] py-10 lg:grid lg:grid-cols-[clamp(220px,16vw,300px)_minmax(0,1fr)] lg:gap-[clamp(1.5rem,3vw,3.5rem)]">
          <aside className="hidden lg:block">
            <VersionsSidebar versions={versions} />
          </aside>

          <div className="min-w-0">
            {unreleased.length > 0 && (
              <section className="mb-10 rounded-md border border-dashed border-grid-line-strong p-6">
                <h2 className="font-mono text-[13px] font-semibold uppercase tracking-wide text-ink-muted">
                  Unreleased — planned
                </h2>
                <div className="mt-4 space-y-4">
                  {unreleased.map((cat) => (
                    <div key={cat.name}>
                      <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">{cat.name}</p>
                      <ul className="mt-1.5 space-y-1">
                        {cat.items.map((item, i) => (
                          <li key={i} className="text-[13.5px] text-ink-muted">
                            {renderInline(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ol className="relative space-y-8 border-l border-grid-line pl-8">
              {entries.map((entry, i) => {
                const color = DOT_COLORS[i % DOT_COLORS.length];
                const categories = flattenCategories(entry);
                const id = idFor(entry.version);

                return (
                  <li key={entry.version} id={id} className="relative scroll-mt-24">
                    <span
                      className="absolute -left-[2.35rem] top-5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper"
                      style={{ background: `color-mix(in srgb, ${color} 25%, var(--paper-raised))` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                    </span>

                    <div className="rounded-md border border-grid-line p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          {i === 0 && entry.date && (
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-accent">
                              Latest release
                            </p>
                          )}
                          {!entry.date && (
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-accent-amber">
                              🚧 In development
                            </p>
                          )}
                          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h2 className="font-mono text-xl font-semibold tabular-nums text-ink">v{entry.version}</h2>
                            {entry.date && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-grid-line px-2.5 py-0.5 font-mono text-[12px] text-ink-faint">
                                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                  <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                                {entry.date}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.date && (
                        <a
                          href={`https://github.com/next-coder21/LIJI-Table/releases/tag/v${entry.version}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-grid-line px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                            <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.2 5.4 18.3.5 12 .5Z" />
                          </svg>
                          View on GitHub
                        </a>
                        )}
                      </div>

                      {entry.note.length > 0 && (
                        <div className="mt-4 space-y-1.5">
                          {entry.note.map((line, li) =>
                            line.startsWith("- ") ? (
                              <p key={li} className="flex gap-2 text-[14px] leading-relaxed text-ink-muted">
                                <span aria-hidden className="text-ink-faint">
                                  –
                                </span>
                                <span>{renderInline(line.slice(2))}</span>
                              </p>
                            ) : (
                              <p key={li} className="text-[14px] leading-relaxed text-ink-muted">
                                {renderInline(line)}
                              </p>
                            )
                          )}
                        </div>
                      )}

                      {categories.length > 0 && (
                        <div className="mt-5 space-y-4">
                          {categories.map((cat) => (
                            <div key={cat.name}>
                              <ChangelogCategoryIcon name={cat.name} />
                              <ul className="mt-2 space-y-1.5">
                                {cat.items.map((item, ii) => (
                                  <li key={ii} className="flex gap-2 text-[14px] leading-relaxed text-ink-muted">
                                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                                    <span>
                                      {item.pkg && (
                                        <span className="mr-1.5 rounded-[3px] bg-paper-raised-2 px-1 py-0.5 font-mono text-[11px] text-ink-faint">
                                          {item.pkg}
                                        </span>
                                      )}
                                      {renderInline(item.text)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
