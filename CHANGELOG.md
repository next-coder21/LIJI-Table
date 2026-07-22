# Changelog

All notable changes to Liji Table will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.9-beta.0]

🚧 Under active development — not yet published to npm. Built with AI-assisted development (Claude Code).

### @liji-table/core

#### Added
- `pinRow(id, 'top' | 'bottom' | null)` / `isRowPinned(id)` - pin a row so it's genuinely **sticky**: `position: sticky`, staying fixed in the viewport while the rest of the table scrolls underneath it, the same way pinned *columns* already stay fixed horizontally. Still subject to the current filter/search like any other row; no effect while `grouping` is active.
- `getPinnedRows()` - the resolved `{ top, bottom }` pinned row objects, in pin order, for a renderer to render as sticky outside its normal scroll/virtualization windowing.

#### Fixed
- `getAllFilteredRows()` re-ran the full filter/sort pipeline over the entire dataset on *every* call, even when nothing relevant had changed - `getRows()`, `getTotalPages()`, and `getPinnedRows()` all call it internally, so it was being redone many times per render/scroll cycle. Now memoized against the actual inputs it reads (data reference, search, filters, grouping, sort); this is the main lever for staying smooth at very large (100k+) row counts.

### @liji-table/react

#### Added
- `pinRow` / `isRowPinned` exposed on `useLijiTable`.
- `pinnedTopRows` / `pinnedBottomRows` - always rendered regardless of scroll position, fixing a real bug where a pinned row could be silently excluded from `virtualRows`'s scroll-position windowing once scrolled past.

### @liji-table/angular

#### Added
- `pinRow` / `isRowPinned` / `pinnedTopRows` / `pinnedBottomRows` on `UniversalTable`, mirroring the React hook.
- `showRowPin` input on `<liji-table>` - renders a 📌 button per row, sticky-positioned when pinned.

#### Fixed
- `ng-package.json`'s `dest` pointed *outside* the package (`../../dist/packages/angular`), while `package.json`'s `main`/`types` pointed *inside* it (`dist/index.js`) - a pre-existing mismatch that meant `npm run build` silently wrote to a location the package itself never read from, so anything consuming `@liji-table/angular` (via `file:` link or npm install) got a stale, long-outdated build. Fixed the `dest` and corrected `package.json`'s `main`/`module`/`types` to point at what `ng-packagr` actually emits.

### @liji-table/ui

#### Added
- `showRowPin` prop on `<UniversalTable>` - renders a 📌 button per row, sticky-positioned (measured header/row height, correct z-index stacking) when pinned.

#### Testing
- `examples/angular-demo` - new example app for testing `@liji-table/angular` directly.
- `examples/vanilla-js-demo` - new example app using only `@liji-table/core`, no framework at all, to prove the engine is genuinely framework-agnostic.

## [0.0.8-beta.0] - 2026-07-21

### @liji-table/core

#### Added
- `computeAutoFitWidths(columns, columnWidths, containerWidth, reservedWidth?)` - deterministic, framework-agnostic column-width calculation. Manually-resized columns keep their exact pixel width forever; un-resized columns proportionally share the remaining container width.
- `setColumnWidths(widths)` - batch-set multiple column widths in a single state update.
- `getLayoutSnapshot()` / `applyLayoutSnapshot(snapshot)` - capture and restore a column arrangement (order, hidden, pinned, align) as a plain serializable object.

#### Fixed
- Removed stale, out-of-sync compiled `.js`/`.d.ts` files that had been committed to `src/` alongside the current `.ts` source, which could be picked up instead of the real source by bundlers and test runners.

### @liji-table/react

#### Added
- `persistKey` option on `useLijiTable`/`useUniversalTable` - auto-restores a saved column layout from `localStorage` on mount.
- `saveLayout()`, `resetLayout()`, `hasSavedLayout()` actions.
- `containerRef` + `computedColumnWidths` - attach `containerRef` to your scrolling wrapper so un-resized columns auto-fit it; resizing one column no longer shifts any other.

### @liji-table/angular

#### Added
- `persistKey` constructor argument on `UniversalTable`, with `saveLayout()` / `resetLayout()` / `hasSavedLayout()` / `persistEnabled`.
- `computedColumnWidths$` / `getComputedColumnWidths()` and automatic `ResizeObserver` wiring in `<liji-table>` for auto-fit column widths.
- "💾 Save Layout" / "♻ Reset Layout" in the column context menu when `persistEnabled` is true.

#### Fixed
- `rows` / `virtualRows` were typed as `T[]` but could contain `GroupRow<T>` entries; corrected the types and filtered group rows out of `isAllPageSelected()`.
- Scoped `tsconfig.json` to `src` so `tsc` no longer surfaces unrelated errors from `node_modules`.

### @liji-table/ui

#### Fixed
- The package previously shipped raw, uncompiled `.tsx` source - bundlers that don't transform `node_modules` (most default webpack/CRA setups) would fail to build it. It now ships a real compiled `dist` build.
- Virtualization was a no-op: the component destructured `virtualRows` but rendered the full unwindowed row list. It now actually renders only the visible window.
- `<UniversalTable persistKey="...">` gains "💾 Save Layout" / "♻ Reset Layout" in the column context menu.

## [0.0.4 – 0.0.7] - undocumented

Several releases shipped in this range without changelog entries. Reconstructed from code comments and commit history:

- **v0.0.5** - Multi-column sort (`sortColumns`, `addSort`, `removeSort`), kept in sync with the legacy single-column sort API.
- **v0.0.6** - Advanced column filters with operators (`equals`, `contains`, `between`, `inList`, etc.) and inline cell editing with per-column validators.
- **v0.0.7** - Professional rebrand: new logo, refreshed documentation site, `UniversalTableCore`/`useUniversalTable` deprecated in favor of `LijiTable`/`useLijiTable`.

## [0.0.3] - 2026-01-06

### @liji-table/angular

#### Fixed
- Removed duplicate `#defaultCell` template definition that caused Angular compiler warnings
- Improved TypeScript type safety for `density` property (now properly typed as `'standard' | 'compact' | 'comfortable'`)

#### Added
- Comprehensive README documentation with examples and API reference

## [0.0.2] - 2026-01-06

### @liji-table/core

#### Added
- **Natural Sort Algorithm** - Implemented `Intl.Collator` for proper string sorting with embedded numbers
  - Correctly sorts strings like "Item 1", "Item 2", "Item 10" (previously would sort as "Item 1", "Item 10", "Item 2")
  - Applied to both regular sorting and grouped data sorting
  - Test coverage: ✅ "should handle natural sort (strings with numbers)" passing

#### Changed
- **Auto-Reorder Pinned Columns** - Enhanced `pinColumn` method to automatically reorder columns when pinning
  - Left-pinned columns now automatically move to the start of the column array
  - Right-pinned columns now automatically move to the end
  - Unpinned columns return to the middle section (after left-pinned, before right-pinned)
  - Test coverage: ✅ "should pin column" and "should reorder columns" passing

#### Fixed
- Fixed template literal syntax errors in `groupRow` object (line 321)
- Fixed template literal syntax errors in `getCSVContent` method (line 359)
- Corrected indentation in grouping code for better readability
- All TypeScript compilation errors resolved

#### Testing
- ✅ All 13 core tests now passing (previously 3 failing)
- Added comprehensive test coverage for natural sort
- Enhanced test coverage for column pinning behavior

### @liji-table/react

#### Changed
- Updated to use `@liji-table/core` v0.0.2
- Benefits from all core improvements (natural sort, auto-reorder pinning)
- Updated documentation with changelog

#### Testing
- ✅ All React hook tests passing

### @liji-table/angular

#### Changed
- Updated to use `@liji-table/core` v0.0.2
- Benefits from all core improvements (natural sort, auto-reorder pinning)

## [0.0.1] - 2024

### All Packages

#### Added
- Initial release
- Framework-agnostic core engine
- React hooks wrapper
- Angular components with RxJS
- UI components library
- Comprehensive feature set:
  - Sorting (ascending/descending/none)
  - Filtering (global + column-level)
  - Pagination
  - Column resizing
  - Column reordering (drag-and-drop)
  - Column pinning (left/right)
  - Row selection (individual + bulk)
  - Row grouping (hierarchical)
  - Virtualization
  - CSV export

---

## Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

---

## Unreleased

#### Planned Features
- Vue.js wrapper
- Svelte wrapper
- Row expansion with detail views
- Column grouping headers (multi-level header bands, distinct from row grouping)
- Column virtualization for very wide tables
- Cell merging
- Cell range selection with clipboard copy/paste
- Keyboard navigation improvements (arrow-key/Tab cell traversal, Enter-to-edit)
- Server-side / remote data mode (delegate sort, filter, and pagination to an API)
- Async, debounced remote search and filtering
- Summary/aggregate footer row (sum, average, count per column)
- Excel (`.xlsx`) export, alongside the existing CSV export
- Undo/redo for inline edits
- Formal ARIA roles and screen-reader support
- Tree data with lazily-loaded children
- Dark mode support for `@liji-table/ui`
- More density options
