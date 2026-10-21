"use client";

import { useState } from "react";
import { UniversalTable } from "@liji-table/ui";
import "@liji-table/ui/styles.css";
import type { TableColumn } from "@liji-table/core";
import { useLijiTable } from "@liji-table/react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Inactive";
  inStock: boolean;
  createdAt: string;
  tags: string[];
}

const categories = ["Electronics", "Books", "Clothing", "Home", "Sports"];
const tagPool = ["new", "sale", "bestseller", "clearance", "limited"];

const sampleData: Product[] = Array.from({ length: 24 }, (_, idx) => {
  const id = idx + 1;
  const stock = (id * 13) % 101;
  return {
    id,
    name: `Item ${((id * 7) % 24) + 1}`,
    category: categories[id % categories.length],
    price: Math.round((19.99 + ((id * 37) % 900)) * 100) / 100,
    stock,
    status: stock > 0 ? "Active" : "Inactive",
    inStock: stock > 0,
    createdAt: `2024-${String((id % 12) + 1).padStart(2, "0")}-${String(((id * 3) % 28) + 1).padStart(2, "0")}`,
    tags: [tagPool[id % tagPool.length], tagPool[(id + 2) % tagPool.length]],
  };
});

const columns: TableColumn[] = [
  { id: "id", label: "ID", width: 70, sortable: true, pinned: "left" },
  { id: "name", label: "Product Name", sortable: true, width: 180 },
  { id: "category", label: "Category", sortable: true, width: 140 },
  { id: "price", label: "Price ($)", sortable: true, width: 110, align: "right" },
  { id: "stock", label: "Stock", sortable: true, width: 90, align: "right" },
  { id: "status", label: "Status", sortable: true, width: 110 },
  { id: "inStock", label: "In Stock", sortable: true, width: 100 },
  { id: "createdAt", label: "Created", sortable: true, width: 120 },
  { id: "tags", label: "Tags", sortable: false, width: 180 },
];

const uiColumns: TableColumn[] = columns.map((col) => {
  if (col.id === "price") return { ...col, render: (v: number) => `$${v.toFixed(2)}` };
  if (col.id === "inStock") return { ...col, render: (v: boolean) => (v ? "✓ Yes" : "✗ No") };
  if (col.id === "tags") return { ...col, render: (v: string[]) => v.join(", ") };
  return col;
});

export default function Playground() {
  const table = useLijiTable(sampleData, uiColumns);
  const [density, setDensity] = useState<"standard" | "compact" | "comfortable">("standard");

  return (
    <div className="rounded-md border border-grid-line bg-paper-raised p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-sm border border-grid-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
            title="Fit each column to its content (auto-fit)"
            onClick={() => table.autoResizeAllColumns()}
          >
            Autosize All
          </button>
          <button
            type="button"
            className="rounded-sm border border-grid-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
            title="Reset manual widths to fill container proportionally"
            onClick={() => table.resetColumnWidths()}
          >
            Fill Container
          </button>
          <button
            type="button"
            className="rounded-sm border border-grid-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-grid-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
            onClick={() => setDensity((d) => (d === "compact" ? "standard" : "compact"))}
          >
            Density: <span className="text-ink">{density === "compact" ? "Compact" : "Standard"}</span>
          </button>
        </div>

        <span className="text-[12px] text-ink-faint">
          Right-click a header for context menu (pin, align, sort). Right-click a row to pin.
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-grid-line bg-white shadow-md">
        <div className="flex items-center gap-1.5 border-b border-[#dee2e6] bg-[#f8f9fa] px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-[11px] text-[#6c757d]">@liji-table/ui — live runtime</span>
        </div>
        <div style={{ height: 480 }} className="relative bg-white text-slate-900">
          <UniversalTable
            tableInstance={table}
            density={density}
            showFilters
            showCheckboxes
            showRowPin
            enableStriped
            persistKey="playground-table"
          />
        </div>
      </div>
    </div>
  );
}
