# @liji-table/angular

<p align="center">
  <img src="../../logo.png" alt="LIJI-Table Logo" width="220"/>
</p>

<p align="center">
  <strong>Angular Components for LIJI-Table</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@liji-table/angular"><img src="https://img.shields.io/npm/v/@liji-table/angular" alt="npm version"/></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@liji-table/angular" alt="bundle size"/>
</p>

> **Version 0.0.10**

**Angular components and services** built on top of `@liji-table/core` with full RxJS integration.  
Provides enterprise-ready data table functionality for Angular 18+ applications.

> Reactive. Type-safe. Angular-native.

---

## 🔄 What's New (v0.0.10)

### ✨ New Features
- **Layout persistence** - pass a `persistKey` as the 3rd constructor argument (`new UniversalTable(data, columns, 'users-table')`) and the column arrangement auto-restores from `localStorage` on mount. Call `table.saveLayout()` / `table.resetLayout()` / `table.hasSavedLayout()`. The `<liji-table>` component shows "💾 Save Layout" / "♻ Reset Layout" in its column context menu automatically when `persistEnabled` is true.
- **Auto-fit column widths** - un-resized columns proportionally fill the table's container by default (`computedColumnWidths$` / `getComputedColumnWidths()`); resizing one column via drag no longer shifts any other column. The `<liji-table>` component wires up a `ResizeObserver` on the scroll container automatically.

### 🐛 Bug Fixes
- Fixed `rows` / `virtualRows` typing to correctly reflect `(T | GroupRow<T>)[]` instead of `T[]`, and made `isAllPageSelected()` filter out group rows before checking selection - eliminates several strict-mode TypeScript errors.
- Scoped `tsconfig.json` to `src` so `tsc` no longer picks up unrelated type errors from `node_modules`.

---

## 📌 Why @liji-table/angular?

- **Angular-Native** - Built with Angular components, using Angular patterns
- **RxJS Integration** - State management via Observables
- **TypeScript First** - Full type safety with strict mode support
- **Accessibility** - ARIA attributes and keyboard navigation
- **Production Ready** - Tested and optimized for enterprise use

---

## ✨ Features

- 🔄 **Sorting** - Natural sort with visual indicators
- 🔍 **Filtering** - Global search + column-level filters
- 📄 **Pagination** - Flexible page control with navigation
- ↔️ **Column Resizing** - Smooth resizing without lag
- 🧩 **Column Reordering** - Drag-and-drop support
- 🧲 **Column Pinning** - Pin columns left or right with context menu
- ✅ **Row Selection** - Checkboxes with select-all
- 🚀 **Virtualization** - Handle thousands of rows efficiently
- 📤 **CSV Export** - Export filtered data
- 🎨 **Customization** - Cell templates, density modes, striped rows
- ♿ **Accessible** - ARIA labels and roles

---

## 📦 Installation

```bash
npm install @liji-table/angular @liji-table/core
```

**Requirements:**
- Angular 18+
- RxJS 7+
- TypeScript 5+

---

## 🚀 Quick Start

### 1. Create Table Instance

```typescript
import { Component } from '@angular/core';
import { UniversalTable } from '@liji-table/angular';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html'
})
export class UsersTableComponent {
  data = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Editor' }
  ];

  columns = [
    { id: 'id', label: 'ID', width: 80, sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role', sortable: true }
  ];

  table = new UniversalTable(this.data, this.columns);
}
```

### 2. Use Component

```html
<liji-table 
  [table]="table"
  [showCheckboxes]="true"
  [showFilters]="true"
  [enableStriped]="true"
  density="standard"
  height="600px">
</liji-table>
```

---

## 🎛 Component API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `table` | `UniversalTable<T>` | Required | Table instance |
| `height` | `string` | `'100%'` | Container height |
| `enableStriped` | `boolean` | `false` | Zebra striping |
| `showCheckboxes` | `boolean` | `false` | Row selection checkboxes |
| `showFilters` | `boolean` | `false` | Column filter inputs |
| `density` | `'standard' \| 'compact' \| 'comfortable'` | `'standard'` | Row density |
| `cellTemplates` | `Record<string, TemplateRef>` | `{}` | Custom cell renderers |

---

## 🧩 Advanced Features

### Custom Cell Templates

```typescript
@Component({
  template: `
    <liji-table 
      [table]="table"
      [cellTemplates]="{ status: statusTemplate }">
    </liji-table>

    <ng-template #statusTemplate let-value let-row="row">
      <span [class]="'badge badge-' + value.toLowerCase()">
        {{ value }}
      </span>
    </ng-template>
  `
})
export class MyComponent {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  
  cellTemplates: Record<string, TemplateRef<any>> = {};
  
  ngAfterViewInit() {
    this.cellTemplates = { status: this.statusTemplate };
  }
}
```

### Reactive State

```typescript
// Subscribe to state changes
this.table.state$.subscribe(state => {
  console.log('Current page:', state.pageIndex);
  console.log('Sort column:', state.sortColumn);
  console.log('Filters:', state.filters);
});

// Get visible columns as observable
this.table.visibleColumns$.subscribe(columns => {
  console.log('Visible columns:', columns);
});
```

### Programmatic Control

```typescript
// Sorting
this.table.toggleSort('name');
this.table.setSortDirection('email', 'desc');

// Filtering
this.table.setSearch('alice');
this.table.setFilter('role', 'Admin');

// Pagination
this.table.setPage(2);
this.table.setPageSize(20);
this.table.nextPage();
this.table.prevPage();

// Column Management
this.table.pinColumn('id', 'left');
this.table.toggleVisibility('email');
this.table.autoResizeAllColumns();

// Selection
this.table.toggleSelection(1);
this.table.toggleAllPage();

// Export
this.table.downloadCSV('users.csv');
```

### Layout Persistence

```typescript
// 3rd constructor arg enables auto-restore + save/reset from localStorage
table = new UniversalTable(this.data, this.columns, 'users-table');

this.table.saveLayout();       // persist current column order/width/pin/hidden/align
this.table.resetLayout();      // clear saved layout, restore original columns
this.table.hasSavedLayout();   // boolean
```

---

## 🎨 Styling

The component uses CSS classes with the `liji-` prefix. Override them in your global styles:

```css
/* Custom header style */
.liji-table th {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  font-weight: 600;
}

/* Custom row hover */
.liji-table tbody tr:hover {
  background-color: #f1f3f5;
}

/* Custom pinned column */
.liji-pinned-left {
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}
```

---

## ⚡ Performance

- **Virtual Scrolling** - Renders only visible rows
- **Direct DOM Manipulation** - Column resizing bypasses Angular change detection
- **OnPush Compatible** - Works with OnPush change detection strategy
- **Optimized Observables** - Minimal subscriptions and updates

---

## 🧪 Testing

All components are fully tested. The Angular package benefits from:
- ✅ All core functionality tests passing
- ✅ Component integration verified
- ✅ No TypeScript errors or warnings

---

## 📄 License

MIT License - Free for commercial and private use

---

**Built for Angular developers who need enterprise-grade tables**
