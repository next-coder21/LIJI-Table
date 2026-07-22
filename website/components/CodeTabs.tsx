"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  {
    id: "core",
    label: "core",
    filename: "table.ts",
    code: `import { LijiTable } from '@liji-table/core';

const table = new LijiTable(orders, [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'price', label: 'Price', sortable: true },
]);

table.subscribe((state) => render(table.getRows()));
table.toggleSort('price');`,
  },
  {
    id: "react",
    label: "react",
    filename: "OrdersTable.tsx",
    code: `import { useLijiTable } from '@liji-table/react';

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
</table>`,
  },
  {
    id: "angular",
    label: "angular",
    filename: "orders.component.ts",
    code: `import { UniversalTable } from '@liji-table/angular';

@Component({ selector: 'app-orders' })
export class OrdersComponent {
  table = new UniversalTable(this.orders, this.columns, 'orders-table');
}

// orders.component.html
// <liji-table [table]="table" [showFilters]="true"></liji-table>`,
  },
  {
    id: "ui",
    label: "ui (prebuilt)",
    filename: "OrdersTable.tsx",
    code: `import { UniversalTable } from '@liji-table/ui';
import '@liji-table/ui/styles.css';

<UniversalTable
  data={orders}
  columns={columns}
  showFilters
  showCheckboxes
  persistKey="orders-table"
/>`,
  },
];

export default function CodeTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];
  const lines = tab.code.split("\n");

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const node = tabRefs.current[active];
    if (node) setIndicator({ left: node.offsetLeft, width: node.offsetWidth });
  }, [active]);

  return (
    <div className="overflow-hidden rounded-md border border-grid-line bg-paper-raised">
      <div className="flex items-center justify-between border-b border-grid-line px-2">
        <div className="relative flex flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(node) => {
                tabRefs.current[t.id] = node;
              }}
              onClick={() => setActive(t.id)}
              className={`relative px-3.5 py-3 font-mono text-[13px] transition-colors ${
                active === t.id ? "text-ink" : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
          {indicator && (
            <span
              className="absolute bottom-0 h-0.5 bg-accent shadow-[0_0_8px_0_var(--accent)] transition-[left,width] duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ left: indicator.left + 14, width: indicator.width - 28 }}
            />
          )}
        </div>
        <span className="hidden pr-3 font-mono text-[12px] text-ink-faint sm:block">{tab.filename}</span>
      </div>

      <pre className="overflow-x-auto px-0 py-4 font-mono text-[13px] leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-10 shrink-0 select-none text-right text-ink-faint/60">{i + 1}</span>
              <span className="pl-4 pr-6 whitespace-pre text-ink">{line || " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
