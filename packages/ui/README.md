# @liji-table/ui

<p align="center">
  <img src="../../logo.png" alt="LIJI-Table Logo" width="220"/>
</p>

<p align="center">
  <strong>Prebuilt Table UI for LIJI-Table</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@liji-table/ui"><img src="https://img.shields.io/npm/v/@liji-table/ui" alt="npm version"/></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@liji-table/ui" alt="bundle size"/>
</p>

> **Version 0.0.10**

A **ready-to-use, feature-rich table UI** built on top of `@liji-table/react` and `@liji-table/core`.  
It provides a **polished table layout, toolbar, styles, and interactions**, while still keeping the architecture **headless-first and customizable**.

> Core logic from `@liji-table/core`  
> React bindings from `@liji-table/react`  
> UI, styles, and interactions from `@liji-table/ui`

---

## ✨ What This UI Provides

This package includes:

- 📊 **UniversalTable** – Fully functional table UI
- 🧰 **UniversalTableToolbar** – Toolbar with export, density, filter toggle, Fit / Fill widths, layout save / reset and column visibility
- 🎨 **Prebuilt styles (CSS)** – Clean, enterprise-grade design
- 🧲 **Pinned columns** (left / right) and **pinned rows** (top / bottom, via `showRowPin`)
- ↔️ **Column resizing** (smooth, no lag)
- 🧩 **Drag & drop column reordering**
- 🔍 **Column filters + global filtering**
- 📄 **Pagination footer**
- ✅ **Row selection with checkboxes**
- 📐 **Density modes** (standard / compact / comfortable) – toggle Compact / Comfortable from the right-click column menu
- 📤 **CSV export**
- 📱 Scrollable + sticky headers
- 💾 **Layout persistence** – "Save Layout" / "Reset Layout" in the column context menu when `persistKey` is set
- 📐 **Auto-fit column widths** – un-resized columns fill the container by default; resizing one never shifts another (v0.0.10+)

---

## 🧱 Architecture Overview

Your App
↓
@liji-table/ui (UI + styles)
↓
@liji-table/react (hook)
↓
@liji-table/core (logic engine)


- UI is **optional and replaceable**
- Logic stays centralized and reusable
- Styling is provided but overridable

---

## 📦 Installation

```bash
npm install @liji-table/ui @liji-table/react @liji-table/core
```

## 🧩 UniversalTable Props

| Prop | Type | Description |
|-----|------|-------------|
| `data` | `any[]` | Table data (must include `id`) |
| `columns` | `TableColumn[]` | Column definitions |
| `tableInstance` | `any` | Optional external hook instance |
| `height` | `string \| number` | Table container height |
| `enableStriped` | `boolean` | Zebra striping |
| `density` | `standard \| compact \| comfortable` | Row density |
| `showFilters` | `boolean` | Show column filter row |
| `showCheckboxes` | `boolean` | Enable row selection |
| `showRowPin` | `boolean` | Right-click a row to pin it to the top or bottom; pinned rows stay on every page |
| `persistKey` | `string` | Enables "Save Layout" / "Reset Layout" in the column context menu, persisting column order/width/pin/hidden/align to `localStorage` under this key and auto-restoring it on mount |


## 🧰 UniversalTableToolbar

A separate, reusable toolbar component.

### Features

- CSV Export
- Density toggle
- Filter toggle
- Fit (autosize to content) and Fill (fill the container)
- Save / Reset layout (shown when the table has a `persistKey`)
- Column visibility menu

#### Example
```tsx
import { UniversalTableToolbar } from "@liji-table/ui";

<UniversalTableToolbar
  table={table}
  title="Users"
  onToggleFilter={() => setShowFilters(v => !v)}
  showFilter={showFilters}
  onDensityChange={setDensity}
  density={density}
/>
```

| Prop | Type | Description |
|-----|------|-------------|
| `table` | `any` | Required. The `useLijiTable()` result |
| `title` | `string` | Heading text. Default `'Table'` |
| `density` / `onDensityChange` | `standard \| compact \| comfortable` / callback | Current density and change handler |
| `showFilter` / `onToggleFilter` | `boolean` / callback | Filter-row state and toggle handler |

## 🖱 Column context menu

Right-click a column header for: Autosize All, Fill Container, Compact / Comfortable, Sort Asc / Desc, Pin Left / Right / Unpin, Align Left / Center / Right, and Save / Reset Layout (when `persistKey` is set). Items are text-only; Sort items are hidden for `sortable: false` columns.

## 🎨 Styling

This UI ships with a fully styled CSS file:
```tsx
import "@liji-table/ui/styles.css";
```

### Included Styles

- Sticky headers
- Sticky pinned columns
- Resizer visuals
- Context menus
- Toolbar buttons
- Pagination footer
- Density modes
- Striped rows

### You can:

- Override styles using CSS variables (below)
- Replace styles entirely
- Use only logic without UI

### CSS variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `--liji-border` | `#cbd5e1` | Grid border color (vertical and horizontal lines) |
| `--liji-bg` / `--liji-white` | `#f8f9fa` / `#ffffff` | Header and body backgrounds |
| `--liji-text-main` / `--liji-text-sub` | `#101828` / `#667085` | Primary and muted text |
| `--liji-primary` | `#3b82f6` | Accent color (active sort, resize indicator, focus) |
| `--liji-hover-row` | `#f9fafb` | Row hover background |
| `--liji-pinned` / `--liji-pinned-header` | `#e6e8ee` / `#dde0e8` | Sticky pinned cell and header fill |

```css
:root.dark {
  --liji-bg: #0f172a;
  --liji-white: #0b0f1c;
  --liji-border: #1e293b;
  --liji-text-main: #f1f5f9;
}
```

## 🧪 Advanced features via the hook

`<UniversalTable />` renders sorting, filters, pagination, pinning, resizing and virtualization. Advanced filtering, row grouping and inline editing live in the underlying hook, so use `tableInstance` to drive them from your own UI:

```tsx
const table = useLijiTable(data, columns, { persistKey: 'users', autoPersist: true });

table.setAdvancedFilter('price', { operator: 'between', value: 50, value2: 200 });
table.setGrouping(['category']);

<UniversalTable tableInstance={table} />
```

Virtualization is built in: only the rows in view are rendered (`virtualRows`), plus pinned rows. See [`@liji-table/react`](../react/README.md) for the full hook API.

## 📌 Column Features Supported

Each column supports:
```ts
{
  id: string;
  label: string;
  width?: number;
  sortable?: boolean;
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right' | null;
  render?: (value, row) => ReactNode;
}
```
## ⚡ Performance Characteristics

- No React re-renders during resize
- Sticky logic computed with `useMemo`
- Efficient pagination and filtering
- Handles large datasets smoothly

---

## 🧩 When to Use This UI

### ✅ Recommended
- Admin dashboards
- Analytics tools
- Enterprise applications
- Internal tools
- Data-heavy screens

### ❌ Not Recommended
- If you want minimal markup only
- If you already have a strict UI framework table

---

## 🔌 Customization Options

You can:
- Use your own toolbar
- Use your own table markup
- Replace styles
- Access the underlying hook directly

> This UI is optional, not mandatory.

---

## 📄 License

MIT License  
Free for commercial and private use.
