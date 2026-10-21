import CodeTabs from "./CodeTabs";

export default function DocsExample() {
  return (
    <div className="mt-14 rounded-lg border border-grid-line p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Example: basic table</h2>
      </div>
      <p className="mt-1.5 text-[14px] text-ink-muted">Here&apos;s how little code it takes to get started with Liji Table.</p>

      <div className="mt-6">
        <CodeTabs />
      </div>
    </div>
  );
}
