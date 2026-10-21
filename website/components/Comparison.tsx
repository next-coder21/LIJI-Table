import AmbientStars from "./AmbientStars";

type Cell = { value: string; tone?: "yes" | "partial" | "no" };

const ROWS: { label: string; liji: Cell; headless: Cell; fullFeatured: Cell }[] = [
  {
    label: "Pricing model",
    liji: { value: "Free (MIT)", tone: "yes" },
    headless: { value: "Free (MIT)", tone: "yes" },
    fullFeatured: { value: "Free core / paid Enterprise tier", tone: "partial" },
  },
  {
    label: "Rendering approach",
    liji: { value: "Headless, optional prebuilt UI", tone: "yes" },
    headless: { value: "Headless", tone: "yes" },
    fullFeatured: { value: "Batteries-included grid", tone: "partial" },
  },
  {
    label: "Built-in virtualization",
    liji: { value: "Included", tone: "yes" },
    headless: { value: "Often a separate package", tone: "partial" },
    fullFeatured: { value: "Included", tone: "yes" },
  },
  {
    label: "First-party framework packages",
    liji: { value: "React, Angular", tone: "yes" },
    headless: { value: "Varies by library", tone: "partial" },
    fullFeatured: { value: "React, Angular, Vue wrappers", tone: "yes" },
  },
  {
    label: "Layout persistence helper",
    liji: { value: "Built in (save/restore)", tone: "yes" },
    headless: { value: "Bring your own", tone: "partial" },
    fullFeatured: { value: "Built in (column state)", tone: "yes" },
  },
];

function toneClass(tone?: Cell["tone"]) {
  if (tone === "yes") return "text-ink";
  if (tone === "partial") return "text-ink-muted";
  return "text-ink-faint";
}

export default function Comparison() {
  return (
    <section className="relative overflow-hidden border-b border-grid-line bg-paper-raised">
      <AmbientStars />
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-lg">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">how it compares</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Stated plainly, not oversold.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            There are excellent, widely-used table libraries in both categories below. Here&apos;s where Liji Table
            sits next to them, structurally.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-md border border-grid-line">
          <table className="w-full min-w-[640px] border-collapse font-mono text-[13.5px]">
            <thead>
              <tr className="bg-paper">
                <th className="border-b border-r border-grid-line p-4 text-left font-medium text-ink-muted">&nbsp;</th>
                <th className="border-b border-r border-grid-line bg-accent/5 p-4 text-left font-semibold text-ink">
                  liji-table
                </th>
                <th className="border-b border-r border-grid-line p-4 text-left font-medium text-ink-muted">typical headless libraries</th>
                <th className="border-b border-grid-line p-4 text-left font-medium text-ink-muted">typical full-featured grids</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="odd:bg-paper/40 transition-colors hover:bg-paper-raised-2">
                  <td className="border-r border-grid-line p-4 text-ink-muted">{row.label}</td>
                  <td className={`border-r border-grid-line bg-accent/5 p-4 font-medium ${toneClass(row.liji.tone)}`}>
                    {row.liji.value}
                  </td>
                  <td className={`border-r border-grid-line p-4 ${toneClass(row.headless.tone)}`}>{row.headless.value}</td>
                  <td className={`p-4 ${toneClass(row.fullFeatured.tone)}`}>{row.fullFeatured.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
