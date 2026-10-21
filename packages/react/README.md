# @liji-table/react

<p align="center">
  <img src="../../logo.png" alt="LIJI-Table Logo" width="220"/>
</p>

<p align="center">
  <strong>React Hooks for LIJI-Table</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@liji-table/react"><img src="https://img.shields.io/npm/v/@liji-table/react" alt="npm version"/></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@liji-table/react" alt="bundle size"/>
</p>

> **Version 0.0.10**

A **headless, high-performance React table hook** built on top of `@liji-table/core`.  
It provides all advanced table logic — sorting, filtering, pagination, resizing, selection, export, and pinning — while leaving **full UI control to the developer**.

> Logic handled. UI owned by you.

---

## 🔄 What's New (v0.0.10)

- ✅ **Layout persistence** - pass `{ persistKey: 'my-table' }` as the third argument to `useLijiTable`/`useUniversalTable` and the column arrangement auto-restores from `localStorage` on mount. Call the returned `saveLayout()` to persist the current arrangement, `resetLayout()` to clear it and restore the original columns, `hasSavedLayout()` to check.
- ✅ **Auto-fit column widths** - attach the returned `containerRef` to your scrolling wrapper and un-resized columns will proportionally fill it (`computedColumnWidths`). Resizing one column no longer shifts any other column.
- ✅ All improvements from `@liji-table/core` v0.0.10

---

## 📌 Why @liji-table/react?

Most table libraries tightly couple **logic + UI**, making customization difficult and performance unpredictable.

`@liji-table/react` solves this by:
- Running **all logic in a core engine**
- Exposing **React-friendly hooks**
- Allowing **any UI framework or design system**

This makes it ideal for **dashboards, admin panels, analytics apps, and enterprise software**.

---

## 🧱 Architecture Overview

Your UI (React JSX)
↓
useUniversalTable()
↓
@liji-table/core (Framework-agnostic engine)


- `@liji-table/react` → React lifecycle & event bindings
- `@liji-table/core` → Sorting, filtering, pagination, state, performance
- Zero DOM assumptions
- Zero CSS coupling

---

## ✨ Key Features Explained

### ⚙️ Headless Design
You write the `<table>`, `<thead>`, `<tbody>`, or even `<div>`-based layouts.  
The hook only provides **data + actions**.

---

### 🔄 Sorting
- Toggle ascending / descending / none
- Programmatic control
- Works on strings, numbers, booleans

---

### 🔍 Filtering & Search
- Column-level filtering
- Global search across all visible columns
- Case-insensitive by default

---

### 📄 Pagination
- Page index & page size control
- Automatic total page calculation
- Safe boundary handling

---

### ↔️ Column Resizing (High Performance)
- Uses **direct DOM manipulation** during drag
- React state updates only on mouse release
- No re-render lag
- Un-resized columns auto-fit the container by default (`computedColumnWidths`); resizing one column never shifts another

---

### 💾 Layout Persistence
- `persistKey` option auto-restores a saved column arrangement from `localStorage` on mount
- `saveLayout()` persists the current order/width/pin/hidden/align
- `resetLayout()` clears the saved layout and restores the original columns
- `hasSavedLayout()` checks whether a layout is currently saved

```ts
const table = useLijiTable(data, columns, { persistKey: 'users-table' });

table.saveLayout();   // persist current arrangement
table.resetLayout();  // clear it and restore defaults
```

---

### 🧩 Column Reordering
- Native drag & drop support
- Disabled automatically while resizing
- State preserved across data updates

---

### 🧲 Column Pinning
- Pin columns left or right
- Useful for checkboxes, IDs, or actions

---

### ✅ Row Selection
- Per-row selection
- Select all rows on current page
- Useful for bulk actions

---

### 📤 Export
- Export filtered data
- Download CSV instantly
- No external dependency

---

## 📦 Installation

```bash
npm install @liji-table/react @liji-table/core
```


## 🚀 Basic Example

```bash 
import { useUniversalTable } from "@liji-table/react";

const columns = [
  { id: "name", header: "Name", sortable: true },
  { id: "email", header: "Email" },
  { id: "sales", header: "Sales", sortable: true }
];

export default function Example({ data }) {
  const table = useUniversalTable(data, columns);

  return (
    <table>
      <thead>
        <tr>
          {table.visibleColumns.map((col, index) => (
            <th
              key={col.id}
              {...table.getHeaderProps(index, col.id)}
              style={{ width: table.state.columnWidths[col.id] }}
            >
              {col.header}
              <span {...table.getResizerProps(col.id)} />
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {table.rows.map(row => (
          <tr key={row.id}>
            {table.visibleColumns.map(col => (
              <td key={col.id}>{row[col.id]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 🧠 Hook Return Values

📊 State & Data

| Property | Description |
|--------|------------|
| `state` | Full table state snapshot |
| `rows` | Current page rows |
| `totalPages` | Total page count |
| `allColumns` | All columns |
| `visibleColumns` | Columns not hidden |
| `selectedIds` | Selected row IDs |

---

## 🛠 Actions API

### 🔍 Search & Filter

```ts
setSearch(query)
setFilter(columnId, value)
```

### 🔄 Sorting

```ts
toggleSort(columnId)
setSortDirection(columnId, direction)
```

### 📄 Pagination

```ts
setPage(pageIndex)
setPageSize(size)
nextPage()
prevPage()
```
### 🧩 Column Controls

```ts
toggleVisibility(columnId)
setColumnAlign(columnId, align)
pinColumn(columnId, 'left' | 'right' | null)
autoResizeAllColumns()
```
### 📤 Export

```ts
exportData()
downloadCSV("export.csv")
```
### 🎛 UI Helper Functions

These helpers are designed to be attached directly to DOM elements.

```ts
getHeaderProps(index, columnId)
getResizerProps(columnId)
isResizing
containerRef          // attach to your scrolling wrapper for auto-fit widths
computedColumnWidths  // { [columnId]: pixelWidth } - use this for th/td width, not state.columnWidths
saveLayout()
resetLayout()
hasSavedLayout()
```
## ⚡ Performance Guarantees

- Core initialized once
- No state loss when data changes
- Resize does not trigger React renders
- Optimized for large datasets

