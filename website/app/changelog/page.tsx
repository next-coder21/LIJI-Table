import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChangelogHero from "@/components/ChangelogHero";
import VersionsSidebar, { type VersionMeta } from "@/components/VersionsSidebar";
import MobileVersionsNav from "@/components/MobileVersionsNav";
import ChangelogList from "@/components/ChangelogList";
import { getChangelog } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog — Liji Table",
  description: "Every notable change to Liji Table, by version.",
};

function idFor(version: string) {
  return `v${version.replace(/[^a-zA-Z0-9.-]/g, "")}`;
}

export default function ChangelogPage() {
  const { entries } = getChangelog();
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
            <MobileVersionsNav versions={versions} />
            <ChangelogList entries={entries} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
