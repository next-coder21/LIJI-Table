import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LijiTable, TableColumn } from './index';

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
    });
});
