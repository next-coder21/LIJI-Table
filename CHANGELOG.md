# Changelog

All notable changes to Liji Table will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Planned Features
- Vue.js wrapper
- Svelte wrapper
- Inline editing
- Row expansion with detail views
- Advanced filtering (operators, date ranges)
- Column grouping headers
- Frozen rows
- Cell merging
- Keyboard navigation improvements
- Dark mode support
- More density options
