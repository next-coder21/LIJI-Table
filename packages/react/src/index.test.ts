/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

    describe('layout persistence', () => {
        const KEY = 'test-layout';

        beforeEach(() => {
            window.localStorage.removeItem('liji-table:layout:' + KEY);
        });

        it('saveLayout persists column arrangement to localStorage', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns, { persistKey: KEY }));

            act(() => {
                result.current.pinColumn('name', 'left');
                result.current.saveLayout();
            });

            const raw = window.localStorage.getItem('liji-table:layout:' + KEY);
            expect(raw).not.toBeNull();
            const snapshot = JSON.parse(raw!);
            expect(snapshot.columns.find((c: any) => c.id === 'name').pinned).toBe('left');
        });

        it('restores a saved layout on next mount', () => {
            const first = renderHook(() => useUniversalTable(mockData, mockColumns, { persistKey: KEY }));
            act(() => {
                first.result.current.pinColumn('name', 'left');
                first.result.current.saveLayout();
            });

            const second = renderHook(() => useUniversalTable(mockData, mockColumns, { persistKey: KEY }));
            const nameCol = second.result.current.allColumns.find((c: any) => c.id === 'name');
            expect(nameCol.pinned).toBe('left');
        });

        it('resetLayout clears storage and restores original columns', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns, { persistKey: KEY }));

            act(() => {
                result.current.pinColumn('name', 'left');
                result.current.saveLayout();
            });
            expect(result.current.hasSavedLayout()).toBe(true);

            act(() => {
                result.current.resetLayout();
            });

            expect(window.localStorage.getItem('liji-table:layout:' + KEY)).toBeNull();
            expect(result.current.allColumns.find((c: any) => c.id === 'name').pinned).toBeFalsy();
        });
    });
});
