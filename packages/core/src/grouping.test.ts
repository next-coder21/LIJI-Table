import { describe, it, expect } from 'vitest';
import { UniversalTableCore, GroupRow } from './index';

const mockData = [
    { id: 1, role: 'Admin', country: 'USA', name: 'Alice' },
    { id: 2, role: 'Admin', country: 'USA', name: 'Bob' },
    { id: 3, role: 'User', country: 'UK', name: 'Charlie' },
    { id: 4, role: 'User', country: 'USA', name: 'Dave' },
    { id: 5, role: 'Admin', country: 'UK', name: 'Eve' },
];

const mockColumns = [
    { id: 'id', label: 'ID' },
    { id: 'role', label: 'Role' },
    { id: 'country', label: 'Country' },
    { id: 'name', label: 'Name' }
];

describe('UniversalTableCore - Row Grouping', () => {
    it('should group data by one column', () => {
        const table = new UniversalTableCore(mockData, mockColumns);
        table.setGrouping(['role']);

        // Default: groups collapsed
        const rows = table.getRows() as GroupRow<any>[];
        expect(rows.length).toBe(2); // Admin, User

        const adminGroup = rows.find(r => r.value === 'Admin');
        expect(adminGroup).toBeDefined();
        expect(adminGroup?.isGroup).toBe(true);
        expect(adminGroup?.leafCount).toBe(3); // Alice, Bob, Eve
        expect(adminGroup?.expanded).toBe(false);
    });

    it('should expand group and show children', () => {
        const table = new UniversalTableCore(mockData, mockColumns);
        table.setGrouping(['role']);

        // Find key for Admin
        const rowsInitial = table.getRows() as GroupRow<any>[];
        const adminKey = rowsInitial.find(r => r.value === 'Admin')?.groupKey!;

        // Expand
        table.toggleGroup(adminKey);

        const rowsExpanded = table.getRows();
        // Expect: Admin Group Row + 3 Children + User Group Row = 5 rows visible
        expect(rowsExpanded.length).toBe(5);

        // Check order: Group -> Child -> Child -> Child -> Next Group
        expect((rowsExpanded[0] as GroupRow<any>).isGroup).toBe(true);
        expect((rowsExpanded[1] as any).name).toBeDefined(); // Child
    });

    it('should group by multiple columns (Nested)', () => {
        const table = new UniversalTableCore(mockData, mockColumns);
        table.setGrouping(['role', 'country']);

        // Level 1: Role
        const level1 = table.getRows() as GroupRow<any>[];
        const adminKey = level1.find(r => r.value === 'Admin')?.groupKey!;
        table.toggleGroup(adminKey);

        // Level 2: Country (inside Admin)
        // Admin (USA, UK) -> expects Admin Group + UK Group + USA Group + User Group
        const level2 = table.getRows();
        // Admin Row + UK (Group) + USA (Group) + User Row = 4
        expect(level2.length).toBe(4);

        // Expand Admin->USA
        const usaGroup = level2.find(r => (r as GroupRow<any>).value === 'USA' && (r as GroupRow<any>).depth === 1);
        expect(usaGroup).toBeDefined();
        table.toggleGroup(usaGroup!.groupKey);

        // Now: Admin + UK + USA + Alice + Bob + User
        expect(table.getRows().length).toBe(6);
    });
});
