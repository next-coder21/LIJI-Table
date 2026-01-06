/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUniversalTable } from './index';

// Mock RAF
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Row ${i}` }));
const mockColumns = [{ id: 'id', label: 'ID' }, { id: 'name', label: 'Name' }];

describe('useUniversalTable (React Hook)', () => {
    it('should initialize with data', () => {
        const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
        console.log('Hook keys:', Object.keys(result.current));
        expect(result.current.rows.length).toBe(10); // Default page size is 10
        expect(result.current.allColumns.length).toBe(2);
    });

    it('should handle virtualization', () => {
        const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));

        // Virtual Rows should be a subset
        expect(result.current.virtualRows.length).toBeGreaterThan(0);
        expect(result.current.virtualRows.length).toBeLessThan(100);

        // Simulate Scroll
        act(() => {
            result.current.onScroll({ currentTarget: { scrollTop: 1000, clientHeight: 800 } } as any);
        });

        // Padding should increase as we scroll down
        expect(result.current.virtualPaddingTop).toBeGreaterThan(0);
    });

    it('should toggle selection', () => {
        const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
        act(() => {
            result.current.toggleSelection(1);
        });
        expect(result.current.selectedIds).toContain(1);
    });
});
