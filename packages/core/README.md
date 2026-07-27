# @liji-table/core

<p align="center">
  <img src="../../logo.png" alt="LIJI-Table Logo" width="400"/>
</p>

<p align="center">
  <strong>Framework-Agnostic Data Grid Core</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@liji-table/core"><img src="https://img.shields.io/npm/v/@liji-table/core" alt="npm version"/></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@liji-table/core" alt="bundle size"/>
</p>

> **Version 0.0.9**

A **framework-agnostic, high-performance table engine** that powers the LIJI-Table ecosystem.  
It provides all advanced table logic — sorting, filtering, pagination, column resizing, selection, pinning, export, and state management — without depending on any UI framework.

> Pure logic. Zero UI. Maximum control.

---

## 🔄 Recent Updates (v0.0.9)

### ✨ New Features
- **Layout Persistence** - `getLayoutSnapshot()` captures the current column arrangement (order, hidden, pinned, align, widths) as a plain serializable object; `applyLayoutSnapshot(snapshot)` restores it, reordering/merging columns and leaving any columns not in the snapshot appended at the end. Framework packages (`react`, `angular`) build `localStorage` persistence on top of this.
- **`computeAutoFitWidths(columns, columnWidths, containerWidth, reservedWidth?)`** - a pure, framework-agnostic function that computes the pixel width for every visible column: columns already present in `columnWidths` (i.e. manually resized) keep that exact value; any column not yet resized gets a proportional share of the remaining container width. This replaces relying on the browser's native `table-layout: fixed` leftover-redistribution, which used to spread any shortfall across *every* column on each reflow - including ones you'd just manually resized.
- **`setColumnWidths(widths)`** - batch-set multiple column widths in a single state update/notify (used to "freeze" every column at the start of a resize drag).

### 🐛 Bug Fixes
- Removed stale, out-of-sync compiled `.js`/`.d.ts` files that had been committed to `src/` alongside the current `.ts` source - these could get picked up instead of the real source by bundlers/test runners.

### 🧪 Testing
- ✅ All core tests passing, including new coverage for `computeAutoFitWidths` and layout persistence

---

## 📌 Why @liji-table/core?

Most table libraries tightly couple **UI + logic**, making them:
- Hard to customize
- Hard to optimize
- Framework-locked

`@liji-table/core` solves this by acting as a **headless table engine** that can be used with:
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
