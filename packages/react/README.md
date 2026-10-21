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

- ✅ **Layout persistence** - pass `{ persistKey: 'my-table' }` as the third argument to `useLijiTable` and the column arrangement auto-restores from `localStorage` on mount. Add `autoPersist: true` to save automatically whenever the layout changes, or call the returned `saveLayout()` / `resetLayout()` / `hasSavedLayout()`.
- ✅ **Full core parity** - the hook now exposes multi-column sorting, advanced filters, row grouping, inline editing, `reorderColumn`, `getLayoutSnapshot`, `applyLayoutSnapshot` and the underlying `table` instance.
- ✅ **Re-exported core types** - `LijiTable`, `isGroupRow`, `computeAutoFitWidths`, `TableState`, `TableColumn`, `FilterCondition`, `GroupRow` and more are importable straight from `@liji-table/react`.
- ✅ **Zero-shift column resizing** - the drag locks every header's rendered width so only the dragged column changes. `getHeaderProps(index, colId)` now includes `data-col-id` automatically.
- ✅ `toggleSelection(id)` accepts string or numeric ids.
- ✅ All improvements from `@liji-table/core` v0.0.10

---

## 📌 Why @liji-table/react?

`@liji-table/react` keeps your table logic out of your markup by:
- Running **all logic in a core engine**
- Exposing **React-friendly hooks**
- Allowing **any UI framework or design system**

This makes it ideal for **dashboards, admin panels, analytics apps, and enterprise software**.

---

## 🧱 Architecture Overview

Your UI (React JSX)
↓
useLijiTable()
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
- `autoPersist: true` (requires `persistKey`) saves automatically whenever the layout changes
- `getLayoutSnapshot()` / `applyLayoutSnapshot(snapshot)` let you store the layout in your own backend

```ts
const table = useLijiTable(data, columns, { persistKey: 'users-table', autoPersist: true });

table.saveLayout();   // persist current arrangement
table.resetLayout();  // clear it and restore defaults
```

---

### 🧩 Column Reordering
- Native drag & drop support
- Disabled automatically while resizing
- State preserved across data updates

---

### 🧲 Column & Row Pinning
- Pin columns left or right with `pinColumn(columnId, 'left' | 'right' | null, { reorder? })`
- Pin rows to the top or bottom with `pinRow(id, 'top' | 'bottom' | null)`; `isRowPinned(id)` reads the state
- Render `pinnedTopRows` / `pinnedBottomRows` as sticky rows outside the virtualized window
- Row pinning is ignored while grouping is active

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

```tsx
import { useLijiTable } from "@liji-table/react";

const columns = [
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email" },
  { id: "sales", label: "Sales", sortable: true }
];

export default function Example({ data }) {
  const table = useLijiTable(data, columns);

  return (
    <table>
      <thead>
        <tr>
          {table.visibleColumns.map((col, index) => (
            <th
              key={col.id}
              {...table.getHeaderProps(index, col.id)}
              style={{ width: table.computedColumnWidths[col.id] }}
            >
              {col.label}
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

## 🧩 Advanced Features

### Multi-column sorting
```ts
table.setSortColumns([{ columnId: 'role', direction: 'asc' }, { columnId: 'name', direction: 'desc' }]);
table.addSort('age', 'asc');
table.removeSort('role');
```

### Advanced filtering (14 operators)
`equals`, `notEquals`, `contains`, `notContains`, `startsWith`, `endsWith`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `between`, `inList`, `isEmpty`, `isNotEmpty`.
```ts
table.setAdvancedFilter('price', { operator: 'between', value: 50, value2: 200 });
table.setAdvancedFilter('category', { operator: 'inList', value: ['Books', 'Games'] });
table.clearAdvancedFilter('price');
table.clearAllAdvancedFilters();
```

### Row grouping
```tsx
import { useLijiTable, isGroupRow } from '@liji-table/react';

table.setGrouping(['department', 'role']);
table.expandAll();
table.collapseAll();

{table.rows.map(row =>
  isGroupRow(row) ? (
    <tr key={row.groupKey} onClick={() => table.toggleGroup(row.groupKey)}>
      <td colSpan={table.visibleColumns.length} style={{ paddingLeft: row.depth * 20 + 12 }}>
        {row.expanded ? '▼' : '▶'} {String(row.value)} ({row.leafCount})
      </td>
    </tr>
  ) : (
    <tr key={row.id}>{table.visibleColumns.map(col => <td key={col.id}>{row[col.id]}</td>)}</tr>
  )
)}
```

### Inline editing & validation
```tsx
const columns = [
  { id: 'price', label: 'Price', editable: true, editor: 'number',
    validate: (value) => (Number(value) > 0 ? true : 'Price must be positive') },
];

table.onCellChange((rowId, columnId, newValue, oldValue) => save(rowId, columnId, newValue));

<td onDoubleClick={() => table.startEdit(row.id, col.id)}>
  {table.isEditing(row.id, col.id) ? (
    <input
      autoFocus
      value={table.state.editingValue ?? ''}
      onChange={(e) => table.setEditingValue(e.target.value)}
      onBlur={() => table.saveEdit()}   // returns false when validate() rejects
      onKeyDown={(e) => { if (e.key === 'Escape') table.cancelEdit(); }}
    />
  ) : row[col.id]}
</td>
```

### Virtualization
Attach `containerRef` and `onScroll` to your scrolling wrapper, then render `virtualRows` between two spacer rows. The hook assumes a fixed 48px row height and renders 5 extra rows above and below the viewport.
```tsx
<div ref={table.containerRef as any} onScroll={table.onScroll} style={{ height: 560, overflow: 'auto' }}>
  <table>
    <tbody>
      {table.virtualPaddingTop > 0 && <tr style={{ height: table.virtualPaddingTop }} />}
      {table.virtualRows.map(row => (/* ... */))}
      {table.virtualPaddingBottom > 0 && <tr style={{ height: table.virtualPaddingBottom }} />}
    </tbody>
  </table>
</div>
```

---

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
| `virtualRows`, `virtualPaddingTop`, `virtualPaddingBottom`, `totalVirtualHeight`, `onScroll` | Row virtualization |
| `pinnedTopRows`, `pinnedBottomRows` | Pinned rows, rendered outside the virtualized window |
| `containerRef`, `computedColumnWidths` | Auto-fit column widths |
| `table` | The underlying `LijiTable` instance |

---

## 🛠 Actions API

### 🔍 Search & Filter

```ts
setSearch(query)
setFilter(columnId, value)
setAdvancedFilter(columnId, condition)
clearAdvancedFilter(columnId)
clearAllAdvancedFilters()
```

### 🔄 Sorting

```ts
toggleSort(columnId)
setSortDirection(columnId, direction)
setSortColumns(sorts)
addSort(columnId, direction)
removeSort(columnId)
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
pinRow(id, 'top' | 'bottom' | null)
reorderColumn(fromIndex, toIndex)
setColumnWidth(columnId, width)
setColumnWidths(widths)
resetColumnWidths()
autoResizeAllColumns()
```
### 📊 Grouping & Editing

```ts
setGrouping(columnIds)
toggleGroup(groupKey)
expandAll()
collapseAll()

startEdit(rowId, columnId)
setEditingValue(value)
saveEdit()
cancelEdit()
isEditing(rowId, columnId)
onCellChange(callback)
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
getLayoutSnapshot()
applyLayoutSnapshot(snapshot)
```
## ⚡ Performance Guarantees

- Core initialized once
- No state loss when data changes
- Resize does not trigger React renders
- Optimized for large datasets

