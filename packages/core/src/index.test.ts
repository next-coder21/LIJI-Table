import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LijiTable, TableColumn, computeAutoFitWidths } from './index';

// Mock Canvas for autoResize
if (typeof document === 'undefined') {
    (global as any).document = {
        createElement: () => ({
            getContext: () => ({
                font: '',
                measureText: (text: string) => ({ width: text.length * 8 })
            })
        })
    };
}

interface TestData {
    id: number;
    name: string;
    age: number;
    role: string;
}

const mockData: TestData[] = [
    { id: 1, name: 'Alice', age: 25, role: 'Dev' },
    { id: 2, name: 'Bob', age: 30, role: 'Manager' },
    { id: 3, name: 'Charlie', age: 20, role: 'Intern' },
    { id: 4, name: 'David', age: 35, role: 'Dev' },
    { id: 5, name: 'Eve', age: 28, role: 'QA' },
];

const mockColumns: TableColumn[] = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'age', label: 'Age', sortable: true },
    { id: 'role', label: 'Role', sortable: true },
];

describe('LijiTable', () => {
    let table: LijiTable<TestData>;

    beforeEach(() => {
        // Clone columns to prevent mutation sharing across tests
        const columns = mockColumns.map(c => ({ ...c }));
        table = new LijiTable(mockData, columns);
    });

    describe('Initialization & Data', () => {
        it('should initialize with data and columns', () => {
            expect(table.getRows().length).toBe(5); // Default page size is 10
            expect(table.getState().columns.length).toBe(4);
        });

        it('should update data via setData', () => {
            const newData = [{ id: 6, name: 'Frank', age: 40, role: 'CEO' }];
            table.setData(newData);
            expect(table.getRows().length).toBe(1);
            expect(table.getRows()[0].name).toBe('Frank');
        });
    });

    describe('Pagination', () => {
        it('should behave correctly with page size', () => {
            table.setPageSize(2);
            expect(table.getTotalPages()).toBe(3); // 5 items / 2 per page = 3 pages
            expect(table.getRows().length).toBe(2);
        });

        it('should change pages', () => {
            table.setPageSize(2);
            table.setPage(1); // Page 2
            const rows = table.getRows();
            expect(rows[0].id).toBe(3); // Charlie
            expect(rows[1].id).toBe(4); // David
        });
    });

    describe('Sorting', () => {
        it('should sort ascending', () => {
            table.setSortDirection('age', 'asc');
            const rows = table.getRows();
            expect(rows[0].name).toBe('Charlie'); // 20
            expect(rows[4].name).toBe('David');   // 35
        });

        it('should sort descending', () => {
            table.setSortDirection('age', 'desc');
            const rows = table.getRows();
            expect(rows[0].name).toBe('David'); // 35
        });

        it('should handle natural sort (strings with numbers)', () => {
            const mixedTable = new LijiTable([
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 10' },
                { id: 3, name: 'Item 2' }
            ], [{ id: 'name', label: 'Name', sortable: true }]);

            mixedTable.setSortDirection('name', 'asc');
            const rows = mixedTable.getRows();
            expect(rows.map(r => r.name)).toEqual(['Item 1', 'Item 2', 'Item 10']);
        });
    });

    describe('Filtering', () => {
        it('should filter globally', () => {
            table.setSearch('dev');
            expect(table.getRows().length).toBe(2); // Alice, David
        });

        it('should filter by column', () => {
            table.setFilter('role', 'Manager');
            expect(table.getRows().length).toBe(1);
            expect(table.getRows()[0].name).toBe('Bob');
        });
    });

    describe('Selection', () => {
        it('should toggle selection single', () => {
            table.toggleSelection(1);
            expect(table.getState().selectedIds).toContain(1);
            table.toggleSelection(1);
            expect(table.getState().selectedIds).not.toContain(1);
        });

        it('should select all on page', () => {
            table.setPageSize(2); // IDs: 1, 2
            table.toggleAllPage();
            expect(table.getState().selectedIds).toEqual([1, 2]);
        });
    });

    describe('Row Pinning', () => {
        it('pins a row to the top, ahead of sort order', () => {
            table.pinRow(4, 'top'); // David (age 35)
            table.setSortDirection('age', 'asc'); // would otherwise put David last
            const rows = table.getRows();
            expect(rows[0].id).toBe(4);
            expect(table.isRowPinned(4)).toBe('top');
        });

        it('pins a row to the bottom', () => {
            table.pinRow(1, 'bottom'); // Alice
            const rows = table.getRows();
            expect(rows[rows.length - 1].id).toBe(1);
            expect(table.isRowPinned(1)).toBe('bottom');
        });

        it('does not duplicate a pinned row in the unpinned body', () => {
            table.pinRow(2, 'top');
            const rows = table.getRows();
            expect(rows.filter(r => r.id === 2).length).toBe(1);
        });

        it('unpins with null', () => {
            table.pinRow(2, 'top');
            table.pinRow(2, null);
            expect(table.isRowPinned(2)).toBeNull();
            expect(table.getRows()[0].id).toBe(1); // back to natural order
        });

        it('renders pinned rows on every page, outside normal pagination', () => {
            table.pinRow(5, 'top'); // Eve
            table.setPageSize(2);
            table.setPage(1); // second page of the remaining 4 rows
            const rows = table.getRows();
            expect(rows[0].id).toBe(5); // still pinned first
            expect(rows.length).toBe(3); // 1 pinned + 2 page rows
        });

        it('excludes pinned rows from getTotalPages() so pagination reflects the scrollable body', () => {
            table.pinRow(1, 'top');
            table.setPageSize(2);
            expect(table.getTotalPages()).toBe(2); // 4 unpinned rows / 2 per page
        });

        it('omits a pinned row that no longer matches the current filter', () => {
            table.pinRow(2, 'top'); // Bob, role Manager
            table.setFilter('role', 'Dev');
            expect(table.getRows().some(r => r.id === 2)).toBe(false);
        });

        it('is a no-op while grouping is active', () => {
            table.pinRow(1, 'top');
            table.setGrouping(['role']);
            const rows = table.getRows();
            expect(rows.some(r => (r as any).isGroup)).toBe(true);
        });

        it('getPinnedRows() resolves the pinned row objects, in pin order', () => {
            table.pinRow(1, 'top');
            table.pinRow(4, 'top');
            table.pinRow(2, 'bottom');
            const { top, bottom } = table.getPinnedRows();
            expect(top.map(r => r.id)).toEqual([1, 4]);
            expect(bottom.map(r => r.id)).toEqual([2]);
        });
    });

    describe('getAllFilteredRows() memoization', () => {
        it('returns the same array reference when nothing relevant has changed', () => {
            const first = table.getAllFilteredRows();
            const second = table.getAllFilteredRows();
            expect(second).toBe(first);
        });

        it('recomputes after a query-state change (e.g. search)', () => {
            const first = table.getAllFilteredRows();
            table.setSearch('dev');
            const second = table.getAllFilteredRows();
            expect(second).not.toBe(first);
            expect(second.length).toBe(2);
        });

        it('recomputes after setData() even if the new array is deep-equal', () => {
            const first = table.getAllFilteredRows();
            table.setData([...mockData]); // new array reference, same contents
            const second = table.getAllFilteredRows();
            expect(second).not.toBe(first);
        });

        it('does not recompute for state changes the query pipeline does not read (e.g. pageIndex)', () => {
            const first = table.getAllFilteredRows();
            table.setPage(0); // no-op page change; irrelevant to filtering/sorting anyway
            const second = table.getAllFilteredRows();
            expect(second).toBe(first);
        });
    });

    describe('Pinning & Reordering', () => {
        it('should pin column', () => {
            table.pinColumn('name', 'left');
            const cols = table.getState().columns;
            expect(cols[0].id).toBe('name'); // Should be first
            expect(cols[0].pinned).toBe('left');
        });

        it('should reorder columns', () => {
            // Swap ID (0) and Name (1)
            table.reorderColumn(0, 1);
            const cols = table.getState().columns;
            expect(cols[0].id).toBe('name');
            expect(cols[1].id).toBe('id');
        });

        it('should restore a column to its natural position on unpin, not dump it at the end', () => {
            // 'name' starts at index 1 (between 'id' and 'age').
            table.pinColumn('name', 'left');
            table.pinColumn('name', null);
            const ids = table.getState().columns.map(c => c.id);
            expect(ids).toEqual(['id', 'name', 'age', 'role']);
        });
    });

    describe('resetColumnWidths', () => {
        it('clears manually-set widths without touching column order/pin/hidden', () => {
            table.setColumnWidths({ id: 300, name: 400 });
            table.pinColumn('age', 'left');
            table.toggleVisibility('role');

            table.resetColumnWidths();

            const state = table.getState();
            expect(state.columnWidths).toEqual({});
            expect(state.columns.find(c => c.id === 'age')?.pinned).toBe('left');
            expect(state.columns.find(c => c.id === 'role')?.hidden).toBe(true);
        });
    });

    describe('computeAutoFitWidths', () => {
        const cols: TableColumn[] = [
            { id: 'a', label: 'A', width: 100 },
            { id: 'b', label: 'B', width: 100 },
            { id: 'c', label: 'C', width: 200 },
        ];

        it('distributes full container width proportionally when nothing is manually sized', () => {
            const widths = computeAutoFitWidths(cols, {}, 800, 0);
            expect(widths.a + widths.b + widths.c).toBe(800);
            // a and b have equal default width, so equal share
            expect(widths.a).toBe(widths.b);
            // c has 2x the default width of a, so ~2x the share
            expect(widths.c).toBeGreaterThan(widths.a * 1.8);
        });

        it('never changes a manually-sized column, and only redistributes leftover among the rest', () => {
            const widths = computeAutoFitWidths(cols, { b: 250 }, 800, 0);
            expect(widths.b).toBe(250); // untouched
            expect(widths.a + widths.b + widths.c).toBe(800);
        });

        it('respects reservedWidth (e.g. a checkbox column outside the column list)', () => {
            const widths = computeAutoFitWidths(cols, {}, 800, 40);
            expect(widths.a + widths.b + widths.c).toBe(760);
        });

        it('never shrinks a column below its minWidth even if the container is too small', () => {
            const narrowCols: TableColumn[] = [
                { id: 'a', label: 'A', width: 100, minWidth: 80 },
                { id: 'b', label: 'B', width: 100, minWidth: 80 },
            ];
            const widths = computeAutoFitWidths(narrowCols, {}, 100, 0);
            expect(widths.a).toBeGreaterThanOrEqual(80);
            expect(widths.b).toBeGreaterThanOrEqual(80);
        });

        it('excludes hidden columns from the fill distribution, but still returns a width for them', () => {
            const withHidden: TableColumn[] = [...cols, { id: 'd', label: 'D', width: 100, hidden: true }];
            const widths = computeAutoFitWidths(withHidden, {}, 800, 0);
            // Hidden column doesn't affect the visible columns' share of the container...
            expect(widths.a + widths.b + widths.c).toBe(800);
            // ...but callers can still safely index widths[id] for a hidden column.
            expect(widths.d).toBe(100);
        });
    });
});
