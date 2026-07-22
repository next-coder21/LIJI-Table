/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { UniversalTable } from './universal-table';

const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Row ${i}` }));
const mockColumns = [{ id: 'id', label: 'ID' }, { id: 'name', label: 'Name' }];

describe('UniversalTable (Angular Logic)', () => {
    it('should initialize and expose state$', async () => {
        const table = new UniversalTable(mockData, mockColumns);

        let currentState: any;
        table.state$.subscribe(state => currentState = state);

        expect(currentState).toBeDefined();
        expect(currentState.columns.length).toBe(2);

        // Rows getter (paginated default 10)
        expect(table.rows.length).toBe(10);
    });

    it('should handle virtualization calculations', () => {
        const table = new UniversalTable(mockData, mockColumns);
        table.setPageSize(100);

        // Initial state
        expect(table.virtualRows.length).toBeGreaterThan(0);
        expect(table.virtualPaddingTop).toBe(0);

        // Simulate Scroll: scrollTop 1000, container 800
        table.updateScroll(1000, 800);

        expect(table.virtualPaddingTop).toBeGreaterThan(0);

        // Check slicing logic indirectly
        // 1000px / 48px/row ~= 20 rows.
        // So start index should be around 15 (buffer 5).
        const startRow = table.virtualRows[0];
        // If start index > 0, id should be > 0.
        expect(startRow.id).toBeGreaterThan(0);
    });

    it('should sync changes to state$', () => {
        const table = new UniversalTable(mockData, mockColumns);
        let lastState: any;
        table.state$.subscribe(s => lastState = s);

        table.toggleSelection(1);
        expect(lastState.selectedIds).toContain(1);
    });

    describe('layout persistence', () => {
        const KEY = 'test-layout-ng';

        beforeEach(() => {
            window.localStorage.removeItem('liji-table:layout:' + KEY);
        });

        it('saveLayout persists column arrangement to localStorage', () => {
            const table = new UniversalTable(mockData, mockColumns, KEY);
            table.pinColumn('name', 'left');
            table.saveLayout();

            const raw = window.localStorage.getItem('liji-table:layout:' + KEY);
            expect(raw).not.toBeNull();
            const snapshot = JSON.parse(raw!);
            expect(snapshot.columns.find((c: any) => c.id === 'name').pinned).toBe('left');
        });

        it('restores a saved layout on next construction', () => {
            const first = new UniversalTable(mockData, mockColumns, KEY);
            first.pinColumn('name', 'left');
            first.saveLayout();

            const second = new UniversalTable(mockData, mockColumns, KEY);
            const nameCol = second.allColumns.find((c: any) => c.id === 'name');
            expect(nameCol.pinned).toBe('left');
        });

        it('resetLayout clears storage and restores original columns', () => {
            const table = new UniversalTable(mockData, mockColumns, KEY);
            table.pinColumn('name', 'left');
            table.saveLayout();
            expect(table.hasSavedLayout()).toBe(true);

            table.resetLayout();

            expect(window.localStorage.getItem('liji-table:layout:' + KEY)).toBeNull();
            expect(table.allColumns.find((c: any) => c.id === 'name').pinned).toBeFalsy();
        });

        it('persistEnabled reflects whether a persistKey was provided', () => {
            const withKey = new UniversalTable(mockData, mockColumns, KEY);
            const withoutKey = new UniversalTable(mockData, mockColumns);
            expect(withKey.persistEnabled).toBe(true);
            expect(withoutKey.persistEnabled).toBe(false);
        });
    });

    describe('row pinning', () => {
        it('pinRow / isRowPinned pin a row to the top, ahead of pagination', () => {
            const table = new UniversalTable(mockData, mockColumns);
            table.pinRow(50, 'top');

            expect(table.isRowPinned(50)).toBe('top');
            expect(table.rows[0].id).toBe(50);
        });

        it('keeps a pinned row in pinnedTopRows even after scrolling it out of the virtualized window', () => {
            const table = new UniversalTable(mockData, mockColumns);
            table.pinRow(0, 'top');
            table.setPageSize(100);
            table.updateScroll(2000, 400); // scroll far down

            expect(table.pinnedTopRows.map(r => r.id)).toEqual([0]);
            expect(table.virtualRows.some((r: any) => r.id === 0)).toBe(false);
        });
    });
});
