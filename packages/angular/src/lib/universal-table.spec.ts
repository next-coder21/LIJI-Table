import { describe, it, expect } from 'vitest';
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
});
