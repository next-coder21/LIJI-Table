import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CopyCommand from "@/components/CopyCommand";
import AmbientStars from "@/components/AmbientStars";
import DocsSidebar from "@/components/DocsSidebar";
import DocsHero from "@/components/DocsHero";
import DocsGuides from "@/components/DocsGuides";
import DocsExample from "@/components/DocsExample";

export const metadata: Metadata = {
  title: "Documentation — Liji Table",
  description: "Installation, quick start, and full API reference for @liji-table/core, react, angular, and ui.",
};

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-grid-line py-14 first:pt-0 last:border-b-0">
      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function RefTable({ rows }: { rows: { signature: string; desc: string }[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-grid-line">
      <dl className="divide-y divide-grid-line">
        {rows.map((r) => (
          <div key={r.signature} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_1.3fr] sm:gap-6">
            <dt className="font-mono text-[13px] text-ink">{r.signature}</dt>
            <dd className="text-[13.5px] leading-relaxed text-ink-muted">{r.desc}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Code({ children }: { children: string }) {
  const lines = children.replace(/^\n/, "").trimEnd().split("\n");
  return (
    <pre className="overflow-x-auto rounded-md border border-grid-line bg-paper-raised px-5 py-4 font-mono text-[13px] leading-relaxed">
      <code className="text-ink">{lines.join("\n")}</code>
    </pre>
  );
}

const CORE_METHODS: Record<string, { signature: string; desc: string }[]> = {
  "Data & subscription": [
    { signature: "new LijiTable(data, columns)", desc: "Construct the engine from an initial data array and column definitions." },
    { signature: "table.subscribe(listener)", desc: "Register a callback invoked with the new state on every change. Returns an unsubscribe function." },
    { signature: "table.getState()", desc: "Read the current TableState synchronously." },
    { signature: "table.setData(data)", desc: "Replace the underlying data array without resetting column/sort/filter state." },
  ],
  "Search & filtering": [
    { signature: "table.setSearch(query)", desc: "Global search across all columns." },
    { signature: "table.setFilter(colId, value)", desc: "Simple per-column text filter." },
    { signature: "table.setAdvancedFilter(colId, condition)", desc: "Operator-based filter: equals, contains, between, inList, and 11 others." },
    { signature: "table.clearAdvancedFilter(colId)", desc: "Remove one column's advanced filter." },
    { signature: "table.clearAllAdvancedFilters()", desc: "Remove every advanced filter." },
  ],
  Sorting: [
    { signature: "table.toggleSort(colId)", desc: "Cycle a column through ascending → descending → none (natural sort via Intl.Collator)." },
    { signature: "table.setSortDirection(colId, dir)", desc: "Set a specific single-column sort direction." },
    { signature: "table.setSortColumns(sorts)", desc: "Replace the full multi-column sort priority list." },
    { signature: "table.addSort(colId, dir, replace?)", desc: "Add a column to the multi-column sort, optionally replacing the existing entry." },
    { signature: "table.removeSort(colId)", desc: "Remove a column from the multi-column sort." },
  ],
  Pagination: [
    { signature: "table.setPage(pageIndex)", desc: "Jump to a page (clamped to valid bounds)." },
    { signature: "table.setPageSize(pageSize)", desc: "Change rows per page." },
    { signature: "table.getTotalPages()", desc: "Total page count for the current filtered data." },
  ],
  Selection: [
    { signature: "table.toggleSelection(id)", desc: "Toggle one row's selected state by id." },
    { signature: "table.toggleAllPage()", desc: "Select/deselect every leaf row on the current page." },
  ],
  "Row pinning": [
    { signature: "table.pinRow(id, pin)", desc: "Pin 'top' | 'bottom' | null. A pinned row renders on every page. No effect while grouping is active." },
    { signature: "table.isRowPinned(id)", desc: "Returns 'top' | 'bottom' | null for a given row id." },
    { signature: "table.getPinnedRows()", desc: "The resolved { top, bottom } pinned row objects, in pin order - lets a renderer render them as sticky rows outside its normal scroll windowing." },
  ],
  "Columns — width, order, pin, align": [
    { signature: "table.setColumnWidth(colId, width)", desc: "Set one column's pixel width." },
    { signature: "table.setColumnWidths(widths)", desc: "Batch-set multiple widths in a single state update." },
    { signature: "table.autoResizeAllColumns()", desc: "Fit-to-content: sizes every column from a character-length heuristic, clamped 50–300px." },
    { signature: "table.reorderColumn(fromIndex, toIndex)", desc: "Move a column to a new index." },
    { signature: "table.pinColumn(colId, pin, opts?)", desc: "Pin 'left' | 'right' | null. Auto-reorders to the edge unless opts.reorder is false." },
    { signature: "table.toggleVisibility(colId)", desc: "Show/hide a column." },
    { signature: "table.setColumnAlign(colId, align)", desc: "Set 'left' | 'center' | 'right' text alignment." },
  ],
  "Inline editing": [
    { signature: "table.startEdit(rowId, colId)", desc: "Enter edit mode for one cell." },
    { signature: "table.setEditingValue(value)", desc: "Update the in-progress edit value." },
    { signature: "table.saveEdit()", desc: "Commit the edit (runs the column's validator first). Returns whether it succeeded." },
    { signature: "table.cancelEdit()", desc: "Discard the in-progress edit." },
    { signature: "table.onCellChange(callback)", desc: "Subscribe to committed cell changes: (rowId, colId, newValue, oldValue)." },
  ],
  "Row grouping": [
    { signature: "table.setGrouping(colIds)", desc: "Group rows by one or more column ids, nested in order." },
    { signature: "table.toggleGroup(groupKey)", desc: "Expand/collapse one group." },
    { signature: "table.expandAll() / table.collapseAll()", desc: "Expand or collapse every group." },
  ],
  "Rows & export": [
    { signature: "table.getRows()", desc: "Current page's rows (or grouped rows, as T | GroupRow<T>)." },
    { signature: "table.getAllFilteredRows()", desc: "Every row matching current filters/search, ignoring pagination." },
    { signature: "table.getCSVContent()", desc: "CSV string of exactly the currently visible columns." },
  ],
  "Layout persistence": [
    { signature: "table.getLayoutSnapshot()", desc: "Serialize column order/width/pin/hidden/align to a plain object." },
    { signature: "table.applyLayoutSnapshot(snapshot)", desc: "Restore a previously captured snapshot." },
  ],
};

const COLUMN_FIELDS: { signature: string; desc: string }[] = [
  { signature: "id: string", desc: "Unique column id — matches a key on your row objects." },
  { signature: "label: string", desc: "Header text." },
  { signature: "width?, minWidth?, maxWidth?: number", desc: "Sizing hints used by auto-fit and resize clamping." },
  { signature: "hidden?: boolean", desc: "Hide the column without removing its definition." },
  { signature: "sortable?: boolean", desc: "Enables toggleSort() for this column." },
  { signature: "align?: 'left' | 'center' | 'right'", desc: "Cell text alignment." },
  { signature: "pinned?: 'left' | 'right' | null", desc: "Initial pin state." },
  { signature: "filterable?, filterOperator?", desc: "Enable advanced filtering and its default operator." },
  { signature: "editable?, editor?, editorOptions?, validate?", desc: "Inline-edit config: enable, editor type, options (e.g. select choices), and a (value, row) => boolean | string validator." },
];

const REACT_OPTIONS: { signature: string; desc: string }[] = [
  { signature: "persistKey?: string", desc: "Auto-restores a saved column layout from localStorage on mount; required by saveLayout()/autoPersist." },
  { signature: "autoPersist?: boolean", desc: "Auto-saves the layout whenever it changes, instead of calling saveLayout() yourself. Requires persistKey. Default false." },
  { signature: "reservedWidth?: number", desc: "Pixels to reserve from the container's auto-fit calculation — e.g. a checkbox column rendered outside the column list. Default 0." },
];

const REACT_RETURN: Record<string, { signature: string; desc: string }[]> = {
  "State & rows": [
    { signature: "state", desc: "The full TableState object." },
    { signature: "rows", desc: "Current page's rows (legacy; same as virtualRows without windowing)." },
    { signature: "virtualRows, virtualPaddingTop, virtualPaddingBottom, totalVirtualHeight, onScroll", desc: "Attach onScroll to your scroll container to enable row virtualization." },
    { signature: "pinnedTopRows, pinnedBottomRows", desc: "Pinned rows, always rendered outside virtualRows's scroll-position windowing - render them with sticky positioning (see the row-pinning section below)." },
    { signature: "allColumns, visibleColumns", desc: "All configured columns, and those with hidden !== true." },
    { signature: "totalPages, selectedIds", desc: "Pagination and selection state." },
  ],
  "Column sizing": [
    { signature: "containerRef", desc: "Attach to your scrolling wrapper so un-resized columns auto-fit its width." },
    { signature: "computedColumnWidths", desc: "Record<colId, px> — the width to render for every column, always defined." },
    { signature: "setColumnWidth(colId, width), setColumnWidths(widths)", desc: "Set widths programmatically (e.g. a custom 'fit to content' action)." },
    { signature: "autoResizeAllColumns()", desc: "Fit-to-content sizing for every column." },
    { signature: "getHeaderProps(index, colId)", desc: "Spread onto a <th> — wires up native drag-to-reorder." },
    { signature: "getResizerProps(colId)", desc: "Spread onto a resize handle inside the header — guards against the ancestor's drag." },
    { signature: "isResizing", desc: "True while a resize drag is in progress." },
  ],
  Actions: [
    { signature: "setSearch, setFilter, setPage, setPageSize", desc: "Search, filter, and pagination setters." },
    { signature: "toggleSort, setSortDirection", desc: "Sorting." },
    { signature: "toggleSelection, toggleAllPage, isAllPageSelected()", desc: "Row selection." },
    { signature: "pinRow(id, pin), isRowPinned(id)", desc: "Pin a row 'top' | 'bottom' | null - a sticky row that stays fixed in the viewport while the table scrolls, on every page. No effect while grouping is active." },
    { signature: "pinColumn(colId, pin, opts?), setColumnAlign, toggleVisibility", desc: "Column management. opts.reorder: false keeps the column's position when pinning." },
    { signature: "exportData(), downloadCSV(fileName?)", desc: "Get filtered rows, or trigger a CSV file download." },
    { signature: "nextPage(), prevPage()", desc: "Pagination navigation helpers." },
  ],
  "Layout persistence": [
    { signature: "saveLayout(), resetLayout(), hasSavedLayout()", desc: "Manual persistence controls (see autoPersist above for automatic)." },
  ],
};

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main className="relative flex-1">
        <AmbientStars />
        <div className="relative mx-auto max-w-[clamp(64rem,94vw,100rem)] px-[clamp(1.25rem,3vw,3.5rem)] py-10 lg:grid lg:grid-cols-[clamp(200px,15vw,280px)_minmax(0,1fr)] lg:gap-[clamp(1.5rem,3vw,3.5rem)]">
          <aside className="hidden lg:block">
            <DocsSidebar />
          </aside>

          <div className="min-w-0">
            <DocsHero />
            <DocsGuides />
            <DocsExample />

            <Section id="installation" eyebrow="01" title="Installation">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                Install the framework-agnostic core alongside whichever binding matches your stack.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-faint">React</p>
                  <CopyCommand command="npm install @liji-table/core @liji-table/react" />
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-faint">React + prebuilt UI</p>
                  <CopyCommand command="npm install @liji-table/core @liji-table/react @liji-table/ui" />
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-faint">Angular</p>
                  <CopyCommand command="npm install @liji-table/core @liji-table/angular" />
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-faint">Core only</p>
                  <CopyCommand command="npm install @liji-table/core" />
                </div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-ink-faint">
                All packages are published together under matching versions (currently{" "}
                <span className="font-mono tabular-nums">0.0.8-beta.0</span>). MIT licensed, zero required dependencies in core.
              </p>
            </Section>

            <Section id="quick-start" eyebrow="02" title="Quick start">
              <div>
                <p className="mb-2 font-mono text-[13px] font-semibold text-ink">Core (framework-agnostic)</p>
                <Code>{`import { LijiTable } from '@liji-table/core';

const table = new LijiTable(orders, [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'price', label: 'Price', sortable: true },
]);

table.subscribe((state) => render(table.getRows()));
table.toggleSort('price');`}</Code>
              </div>
              <div>
                <p className="mb-2 font-mono text-[13px] font-semibold text-ink">React</p>
                <Code>{`import { useLijiTable } from '@liji-table/react';

const table = useLijiTable(orders, columns, {
  persistKey: 'orders-table',
});

<table ref={table.containerRef}>
  <thead>
    <tr>
      {table.visibleColumns.map((col, i) => (
        <th
          key={col.id}
          style={{ width: table.computedColumnWidths[col.id] }}
          {...table.getHeaderProps(i, col.id)}
        >
          {col.label}
          <span {...table.getResizerProps(col.id)} />
        </th>
      ))}
    </tr>
  </thead>
</table>`}</Code>
              </div>
              <div>
                <p className="mb-2 font-mono text-[13px] font-semibold text-ink">Angular</p>
                <Code>{`import { UniversalTable } from '@liji-table/angular';

@Component({ selector: 'app-orders' })
export class OrdersComponent {
  table = new UniversalTable(this.orders, this.columns, 'orders-table');
}

// orders.component.html
// <liji-table [table]="table" [showFilters]="true"></liji-table>`}</Code>
              </div>
              <div>
                <p className="mb-2 font-mono text-[13px] font-semibold text-ink">React — prebuilt UI</p>
                <Code>{`import { UniversalTable } from '@liji-table/ui';
import '@liji-table/ui/styles.css';

<UniversalTable
  data={orders}
  columns={columns}
  showFilters
  showCheckboxes
  persistKey="orders-table"
/>`}</Code>
              </div>
            </Section>

            <Section id="columns" eyebrow="03" title="Column definition">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                Every binding shares the same <code className="font-mono text-[13px] text-ink">TableColumn</code> shape from{" "}
                <code className="font-mono text-[13px] text-ink">@liji-table/core</code>.
              </p>
              <RefTable rows={COLUMN_FIELDS} />
            </Section>

            <Section id="core-api" eyebrow="04" title="@liji-table/core">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                The <code className="font-mono text-[13px] text-ink">LijiTable</code> class. All state changes go through{" "}
                <code className="font-mono text-[13px] text-ink">subscribe()</code> — every framework binding is a thin
                adapter over this same engine.
              </p>
              {Object.entries(CORE_METHODS).map(([group, rows]) => (
                <div key={group}>
                  <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">{group}</p>
                  <RefTable rows={rows} />
                </div>
              ))}
            </Section>

            <Section id="react-api" eyebrow="05" title="@liji-table/react">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                <code className="font-mono text-[13px] text-ink">useLijiTable(data, columns, options?)</code> wraps a{" "}
                <code className="font-mono text-[13px] text-ink">LijiTable</code> instance in React state.
              </p>
              <div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">Options</p>
                <RefTable rows={REACT_OPTIONS} />
              </div>
              {Object.entries(REACT_RETURN).map(([group, rows]) => (
                <div key={group}>
                  <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">{group}</p>
                  <RefTable rows={rows} />
                </div>
              ))}
            </Section>

            <Section id="angular-api" eyebrow="06" title="@liji-table/angular">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                <code className="font-mono text-[13px] text-ink">
                  new UniversalTable(data, columns, persistKey?, reservedWidth?)
                </code>{" "}
                mirrors the core engine with RxJS observables (<code className="font-mono text-[13px] text-ink">state$</code>,{" "}
                <code className="font-mono text-[13px] text-ink">computedColumnWidths$</code>) for template binding, plus the
                same actions and layout-persistence methods as core.
              </p>
              <div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">
                  {"<liji-table> component inputs"}
                </p>
                <RefTable
                  rows={[
                    { signature: "[table]: UniversalTable", desc: "Required. The table instance to render." },
                    { signature: "[height]: string", desc: "CSS height of the scroll container. Default '100%'." },
                    { signature: "[enableStriped]: boolean", desc: "Zebra-stripe rows." },
                    { signature: "[showCheckboxes]: boolean", desc: "Render a selection checkbox column." },
                    { signature: "[showRowPin]: boolean", desc: "Render a 📌 button per row that pins it to the top." },
                    { signature: "[showFilters]: boolean", desc: "Render per-column filter inputs in the header." },
                    { signature: "[density]: 'standard' | 'compact' | 'comfortable'", desc: "Row height preset." },
                    { signature: "[cellTemplates]: Record<string, TemplateRef>", desc: "Custom cell renderers keyed by column id." },
                  ]}
                />
              </div>
            </Section>

            <Section id="ui-api" eyebrow="07" title="@liji-table/ui">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                Pre-built React components on top of <code className="font-mono text-[13px] text-ink">@liji-table/react</code> —
                for when you want a working table without writing the markup yourself. Import{" "}
                <code className="font-mono text-[13px] text-ink">@liji-table/ui/styles.css</code> once, at your app root.
              </p>
              <RefTable
                rows={[
                  { signature: "data, columns", desc: "Same shape as core. Omit if you pass tableInstance instead." },
                  { signature: "tableInstance?", desc: "Pass an existing useLijiTable() result to control the table from outside." },
                  { signature: "persistKey?", desc: "Enables 'Save Layout' / 'Reset Layout' in the column context menu." },
                  { signature: "height?: string | number", desc: "Default '100%'." },
                  { signature: "enableStriped?: boolean", desc: "Zebra-stripe rows." },
                  { signature: "showCheckboxes?: boolean", desc: "Render a selection checkbox column." },
                  { signature: "showRowPin?: boolean", desc: "Render a 📌 button per row that pins it to the top." },
                  { signature: "showFilters?: boolean", desc: "Render per-column filter inputs." },
                  { signature: "density?: 'standard' | 'compact' | 'comfortable'", desc: "Row height preset." },
                ]}
              />
            </Section>

            <Section id="persistence" eyebrow="08" title="Layout persistence">
              <p className="text-[14px] leading-relaxed text-ink-muted">
                Pass a <code className="font-mono text-[13px] text-ink">persistKey</code> and the column arrangement — order,
                width, pin, hidden, and align — restores automatically from{" "}
                <code className="font-mono text-[13px] text-ink">localStorage</code> on mount.
              </p>
              <RefTable
                rows={[
                  { signature: "persistKey: string", desc: "Storage key. Required for saveLayout(), resetLayout(), hasSavedLayout(), and autoPersist." },
                  { signature: "saveLayout()", desc: "Persist the current arrangement. Call after a resize/reorder/pin, or use autoPersist to skip this." },
                  { signature: "resetLayout()", desc: "Clear storage and restore the original column arrangement passed to the constructor." },
                  { signature: "hasSavedLayout()", desc: "Whether a saved layout exists for this key." },
                  { signature: "getLayoutSnapshot() / applyLayoutSnapshot()", desc: "Core-level primitives if you want to persist somewhere other than localStorage." },
                ]}
              />
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
