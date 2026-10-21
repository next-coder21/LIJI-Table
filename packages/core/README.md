# @liji-table/core

<p align="center">
  <img src="../../logo.png" alt="LIJI-Table Logo" width="220"/>
</p>

<p align="center">
  <strong>Framework-Agnostic Data Grid Core</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@liji-table/core"><img src="https://img.shields.io/npm/v/@liji-table/core" alt="npm version"/></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@liji-table/core" alt="bundle size"/>
</p>

> **Version 0.0.10**

A **framework-agnostic, high-performance table engine** that powers the LIJI-Table ecosystem.  
It provides all advanced table logic — sorting, filtering, pagination, column resizing, selection, pinning, export, and state management — without depending on any UI framework.

> Pure logic. Zero UI. Maximum control.

---

## 🔄 Recent Updates (v0.0.10)

### ✨ New Features
- **Recursive `expandAll()`** - expands every group key across single-level and multi-level `grouping` hierarchies.
- **Multi-column sort inside groups** - `sortColumns` is now honored for the leaf rows inside grouped data (`groupData()`), matching the top-level sort priority.

### 🐛 Bug Fixes
- `setData(data)` clamps `pageIndex` when the new dataset has fewer pages than the active page, preventing an empty out-of-bounds view.
- `getCSVContent()` writes `null` / `undefined` cells as empty strings instead of the literal text.
- Added an `exports` map with explicit TypeScript `types` and `sideEffects: false` for modern bundlers.

### 🧪 Testing
- ✅ Core test suite passing, including grouping and CSV coverage

> Layout persistence to `localStorage` (`persistKey`, `saveLayout()`, `resetLayout()`) is provided by the `@liji-table/react` hook and the `@liji-table/angular` `UniversalTable`. Core exposes the serializable building blocks, `getLayoutSnapshot()` and `applyLayoutSnapshot()`.

---

## 📌 Why @liji-table/core?

Tables that tightly couple **UI + logic** are hard to customize, hard to optimize and locked to one framework.

`@liji-table/core` is a **headless table engine** that can be used with:
- React
- Angular
- Vue
- Svelte
- Vanilla JS
- Custom renderers

---

## 🧱 Architecture Overview

Your UI (Any Framework)
↓
@liji-table/core


- No DOM assumptions
- No CSS dependencies
- No framework imports
- Works purely with data & state

Framework bindings (like `@liji-table/react`) are thin wrappers around this core.

---

## ✨ Key Features Explained

### ⚙️ Headless Core Engine
- No rendering
- No HTML
- No styles
- Only **data processing & state**

---

### 🔄 Sorting
- Ascending / Descending / None
- Natural sort (numeric + text)
- Column-level sortable control

---

### 🔍 Filtering & Search
- Global search across all fields
- Column-level filters
- Case-insensitive matching

---

### 📄 Pagination
- Page index & page size control
- Automatic page calculations
- Safe boundary handling

---

### ↔️ Column Width Management
- Manual width setting
- Smart auto-resize using canvas measurement
- Font-aware sizing

---

### 🧩 Column Reordering
- Reorder columns by index
- Preserves pinned column rules

---

### 🧲 Column Pinning
- Pin columns to left or right
- Automatic column reordering
- Ideal for IDs, actions, or checkboxes

---

### ✅ Row Selection
- Toggle individual row selection
- Select / unselect all rows on current page
- Page-aware selection logic

---

### 📤 Export
- Export filtered & sorted data
- CSV generation without dependencies
- Visible-column–aware export

---

## 🧩 Advanced Features

### Multi-column sorting
```ts
table.setSortColumns([
  { columnId: 'role', direction: 'asc' },
  { columnId: 'name', direction: 'desc' },
]);
table.addSort('age', 'asc');      // add (pass `true` as 3rd arg to replace existing sorts)
table.removeSort('role');
```

### Advanced filtering (14 operators)
`setAdvancedFilter(columnId, condition)` takes a `FilterCondition` `{ operator, value, value2?, caseSensitive? }`.

| Operator | Matches |
|---|---|
| `equals` / `notEquals` | Strict equality / inequality with `value` |
| `contains` / `notContains` | Substring (case-insensitive unless `caseSensitive: true`) |
| `startsWith` / `endsWith` | Prefix / suffix (case-insensitive unless `caseSensitive: true`) |
| `greaterThan` / `lessThan` | `>` / `<` against `value` |
| `greaterThanOrEqual` / `lessThanOrEqual` | `>=` / `<=` against `value` |
| `between` | Inclusive range from `value` to `value2` |
| `inList` | `value` is an array that includes the cell value |
| `isEmpty` / `isNotEmpty` | Cell is (or is not) `null` / `undefined` |

```ts
table.setAdvancedFilter('price', { operator: 'between', value: 50, value2: 200 });
table.setAdvancedFilter('category', { operator: 'inList', value: ['Books', 'Games'] });
table.clearAdvancedFilter('price');
table.clearAllAdvancedFilters();
```

### Row & column pinning
```ts
table.pinColumn('id', 'left');            // 'left' | 'right' | null (auto-reorders unless { reorder: false })
table.pinRow(42, 'top');                  // 'top' | 'bottom' | null - shown on every page
table.isRowPinned(42);                    // 'top' | 'bottom' | null
const { top, bottom } = table.getPinnedRows();
```
Row pinning is ignored while grouping is active.

### Row grouping
```ts
import { isGroupRow } from '@liji-table/core';

table.setGrouping(['department', 'role']);   // nested, in order
table.expandAll();
table.collapseAll();

for (const row of table.getRows()) {
  if (isGroupRow(row)) {
    // row.groupKey, row.value, row.depth, row.expanded, row.leafCount, row.children
    table.toggleGroup(row.groupKey);
  }
}
```

### Inline editing & validation
```ts
const columns = [
  {
    id: 'price',
    label: 'Price',
    editable: true,
    editor: 'number',   // 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom'
    validate: (value, row) => (Number(value) > 0 ? true : 'Price must be positive'),
  },
];

table.onCellChange((rowId, columnId, newValue, oldValue) => save(rowId, columnId, newValue));
table.startEdit(42, 'price');
table.setEditingValue(19.99);
table.saveEdit();     // returns false when `validate` rejects the value
table.cancelEdit();
```

### Layout snapshots & auto-fit widths
```ts
const snapshot = table.getLayoutSnapshot();  // order, hidden, pinned, align, widths
table.applyLayoutSnapshot(snapshot);

table.setColumnWidths({ name: 240, email: 320 });
table.resetColumnWidths();                   // back to filling the container
const widths = computeAutoFitWidths(table.getState().columns, table.getState().columnWidths, containerWidth);
```

> Virtualization (`virtualRows`, `virtualPaddingTop`, `virtualPaddingBottom`) is provided by the framework bindings, not by the core engine.

---

## 📦 Installation

```bash
npm install @liji-table/core
```

## 🚀 Basic Usage (Framework Agnostic)

```
import { UniversalTableCore } from "@liji-table/core";

const data = [
  { id: 1, name: "Alice", sales: 1200 },
  { id: 2, name: "Bob", sales: 900 }
];

const columns = [
  { id: "name", label: "Name", sortable: true },
  { id: "sales", label: "Sales", sortable: true }
];

const table = new UniversalTableCore(data, columns);

// Subscribe to state changes
const unsubscribe = table.subscribe(state => {
  console.log("Table state updated:", state);
});

// Actions
table.setSearch("alice");
table.toggleSort("sales");
table.setPageSize(5);

// Get processed rows
const rows = table.getRows();

```

## 🧠 Core State & Data

### TableState

| Property | Description |
|--------|------------|
| `pageIndex` | Current page index |
| `pageSize` | Rows per page |
| `searchQuery` | Global search query |
| `filters` | Column-level filters |
| `sortColumn` | Active sort column |
| `sortDirection` | `asc` / `desc` / `null` |
| `columnWidths` | Column width map |
| `columns` | Column definitions |
| `selectedIds` | Selected row IDs |
