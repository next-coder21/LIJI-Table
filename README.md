# LIJI-Table

<p align="center">
  <img src="./logo.png" alt="LIJI-Table Logo" width="400"/>
</p>

<p align="center">
  <strong>Free, Tiny & Powerful Data Grid Library</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@liji-table/core"><img src="https://img.shields.io/npm/v/@liji-table/core" alt="npm version"/></a>
  <a href="https://npmjs.com/package/@liji-table/core"><img src="https://img.shields.io/npm/dm/@liji-table/core" alt="npm downloads"/></a>
  <img src="https://img.shields.io/badge/tests-passing-brightgreen" alt="Tests"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"/>
</p>

A **production-ready, framework-agnostic table library** with a headless architecture. Build powerful data tables with advanced features while maintaining complete control over your UI.

## 🏗️ Architecture

Liji Table uses a unique **headless-first architecture** that separates business logic from rendering:

```
@liji-table/core  (Framework-agnostic engine)
       ↑
       ├── @liji-table/react     (React hooks)
       ├── @liji-table/angular   (Angular + RxJS)
       └── @liji-table/ui        (Pre-built React components)
```

## ✨ Features

- 🔄 **Sorting** - Natural sort with ascending/descending/none states
- 🔍 **Filtering** - Global search + column-level filters
- 📄 **Pagination** - Flexible page size and navigation
- ↔️ **Column Resizing** - Performance-optimized with direct DOM manipulation
- 🧩 **Column Reordering** - Drag-and-drop support
- 🧲 **Column Pinning** - Pin columns to left or right with auto-reorder
- ✅ **Row Selection** - Individual and bulk selection
- 📊 **Row Grouping** - Hierarchical data grouping with expand/collapse
- 🚀 **Virtualization** - Built-in virtual scrolling for large datasets
- 📤 **CSV Export** - Export filtered and sorted data
- ⚡ **Performance** - Optimized for large datasets with minimal re-renders
- 🎯 **TypeScript** - Fully typed with comprehensive type definitions

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@liji-table/core`](./packages/core) | 0.0.2 | Framework-agnostic table engine |
| [`@liji-table/react`](./packages/react) | 0.0.2 | React hooks for table management |
| [`@liji-table/angular`](./packages/angular) | 0.0.3 | Angular components with RxJS |
| [`@liji-table/ui`](./packages/ui) | - | Pre-built React UI components |

## 🚀 Quick Start

### React

```bash
npm install @liji-table/react @liji-table/core
```

```tsx
import { useUniversalTable } from '@liji-table/react';

function MyTable({ data }) {
  const table = useUniversalTable(data, [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role' }
  ]);

  return (
    <table>
      <thead>
        <tr>
          {table.visibleColumns.map((col, i) => (
            <th 
              key={col.id}
              {...table.getHeaderProps(i, col.id)}
              onClick={() => table.toggleSort(col.id)}
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

### Angular

```bash
npm install @liji-table/angular @liji-table/core
```

```typescript
import { UniversalTable } from '@liji-table/angular';

export class MyComponent {
  table = new UniversalTable(this.data, [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role' }
  ]);
}
```

```html
<liji-table 
  [table]="table" 
  [showCheckboxes]="true"
  [enableStriped]="true">
</liji-table>
```

### Vanilla JavaScript

```bash
npm install @liji-table/core
```

```javascript
import { UniversalTableCore } from '@liji-table/core';

const table = new UniversalTableCore(data, columns);

// Subscribe to state changes
table.subscribe(state => {
  console.log('Table state updated:', state);
  renderTable(table.getRows());
});

// Perform actions
table.setSearch('query');
table.toggleSort('name');
table.setPageSize(20);
```

## 🎯 Why Choose Liji Table?

### vs. TanStack Table
- ✅ Framework-agnostic core (not just React/Vue/Solid)
- ✅ Built-in virtualization (no external package needed)
- ✅ Simpler API for common use cases

### vs. AG Grid
- ✅ Completely free and open source
- ✅ Smaller bundle size (~12KB vs ~500KB)
- ✅ Headless architecture for maximum flexibility

### vs. React Table v7
- ✅ Works with any framework
- ✅ Built-in state management
- ✅ Natural sort out of the box

## 📚 Documentation

- [Core Package](./packages/core/README.md) - Framework-agnostic engine
- [React Package](./packages/react/README.md) - React hooks and examples
- [Angular Package](./packages/angular/README.md) - Angular components
- [UI Package](./packages/ui/README.md) - Pre-built components

## 🧪 Testing

All packages are thoroughly tested with Vitest:

```bash
npm test
```

**Current Test Status**: ✅ All 13 core tests passing

## 🔄 Recent Updates (v0.0.2)

### ✨ New Features
- **Natural Sort Algorithm** - Strings with numbers now sort correctly (e.g., "Item 1", "Item 2", "Item 10")
- **Auto-Reorder Pinned Columns** - Pinned columns automatically move to their correct positions

### 🐛 Bug Fixes
- Fixed template literal syntax errors in core package
- Removed duplicate template in Angular component
- Improved TypeScript type safety

### 🎯 Quality Improvements
- All critical defects resolved
- 100% test pass rate on core functionality
- Enhanced code quality and maintainability

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Watch mode
npm test -- --watch
```

## 📖 Examples

Check the [`examples/`](./examples) directory for:
- Basic table implementation
- Advanced features (grouping, pinning, virtualization)
- Custom renderers
- Integration examples

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © 2024

---

## 🌟 Features in Detail

### Natural Sorting
```javascript
// Correctly sorts: ["Item 1", "Item 2", "Item 10"]
// Not: ["Item 1", "Item 10", "Item 2"]
table.toggleSort('name');
```

### Column Pinning with Auto-Reorder
```javascript
// Pin column to left - automatically moves to start
table.pinColumn('id', 'left');

// Pin column to right - automatically moves to end
table.pinColumn('actions', 'right');

// Unpin - moves back to middle section
table.pinColumn('name', null);
```

### Row Grouping
```javascript
// Group by single or multiple columns
table.setGrouping(['department', 'role']);

// Expand/collapse groups
table.toggleGroup('Engineering');
table.expandAll();
table.collapseAll();
```

### Virtualization
```javascript
// Automatically handles thousands of rows
const { virtualRows, virtualPaddingTop, virtualPaddingBottom } = table;
```

### CSV Export
```javascript
// Export filtered and sorted data
table.downloadCSV('users.csv');
```

---

**Built with ❤️ for developers who need powerful tables without the bloat**
