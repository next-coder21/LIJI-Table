# @liji-table/ui

> **Version 0.0.9**

A **ready-to-use, feature-rich table UI** built on top of `@liji-table/react` and `@liji-table/core`.  
It provides a **polished table layout, toolbar, styles, and interactions**, while still keeping the architecture **headless-first and customizable**.

> Core logic from `@liji-table/core`  
> React bindings from `@liji-table/react`  
> UI, styles, and interactions from `@liji-table/ui`

---

## ✨ What This UI Provides

This package includes:

- 📊 **UniversalTable** – Fully functional table UI
- 🧰 **UniversalTableToolbar** – Toolbar with export, density, filters, and column controls
- 🎨 **Prebuilt styles (CSS)** – Clean, enterprise-grade design
- 🧲 **Pinned columns** (left / right)
- ↔️ **Column resizing** (smooth, no lag)
- 🧩 **Drag & drop column reordering**
- 🔍 **Column filters + global filtering**
- 📄 **Pagination footer**
- ✅ **Row selection with checkboxes**
- 📐 **Density modes** (standard / compact / comfortable)
- 📤 **CSV export**
- 📱 Scrollable + sticky headers
- 💾 **Layout persistence** – "Save Layout" / "Reset Layout" in the column context menu (v0.0.9+)
- 📐 **Auto-fit column widths** – un-resized columns fill the container by default; resizing one never shifts another (v0.0.9+)

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
| `persistKey` | `string` | Enables "💾 Save Layout" / "♻ Reset Layout" in the column context menu, persisting column order/width/pin/hidden/align to `localStorage` under this key and auto-restoring it on mount |


## 🧰 UniversalTableToolbar

A separate, reusable toolbar component.

### Features

- CSV Export
- Density toggle
- Filter toggle
- Autosize columns
- Column visibility menu

#### Example 
```
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

## 🎨 Styling

This UI ships with a fully styled CSS file:
``` 
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

- Override styles using CSS variables
- Replace styles entirely
- Use only logic without UI

## 📌 Column Features Supported

Each column supports:
```
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
