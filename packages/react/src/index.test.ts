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

        it('autoPersist saves on layout change without an explicit saveLayout() call', () => {
            const { result } = renderHook(() =>
                useUniversalTable(mockData, mockColumns, { persistKey: KEY, autoPersist: true })
            );

            // Initial mount shouldn't write anything yet.
            expect(window.localStorage.getItem('liji-table:layout:' + KEY)).toBeNull();

            act(() => {
                result.current.pinColumn('name', 'left');
            });

            const raw = window.localStorage.getItem('liji-table:layout:' + KEY);
            expect(raw).not.toBeNull();
            const snapshot = JSON.parse(raw!);
            expect(snapshot.columns.find((c: any) => c.id === 'name').pinned).toBe('left');
        });
    });

    describe('setColumnWidth / setColumnWidths', () => {
        it('exposes setColumnWidth to set a single column width', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            act(() => {
                result.current.setColumnWidth('name', 222);
            });
            expect(result.current.state.columnWidths.name).toBe(222);
        });

        it('exposes setColumnWidths to batch-set widths', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            act(() => {
                result.current.setColumnWidths({ id: 60, name: 300 });
            });
            expect(result.current.state.columnWidths.id).toBe(60);
            expect(result.current.state.columnWidths.name).toBe(300);
        });

        it('exposes resetColumnWidths to clear manual widths back to auto-fill', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            act(() => {
                result.current.setColumnWidths({ id: 60, name: 300 });
            });
            act(() => {
                result.current.resetColumnWidths();
            });
            expect(result.current.state.columnWidths).toEqual({});
        });
    });

    describe('pinColumn reorder option', () => {
        it('reorders by default when pinning', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            act(() => {
                result.current.pinColumn('name', 'left');
            });
            expect(result.current.allColumns[0].id).toBe('name');
        });

        it('does not reorder when { reorder: false } is passed', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            act(() => {
                result.current.pinColumn('name', 'left', { reorder: false });
            });
            // Column stays at its original index...
            expect(result.current.allColumns[0].id).toBe('id');
            expect(result.current.allColumns[1].id).toBe('name');
            // ...but the pinned flag is still set.
            expect(result.current.allColumns.find((c: any) => c.id === 'name').pinned).toBe('left');
        });
    });

    describe('row pinning', () => {
        it('exposes pinRow / isRowPinned that pin a row to the top', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            act(() => {
                result.current.pinRow(50, 'top');
            });
            expect(result.current.isRowPinned(50)).toBe('top');
            expect(result.current.rows[0].id).toBe(50);
        });

        it('keeps a pinned row in pinnedTopRows even after scrolling it out of the virtualized window', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns, { autoPersist: false } as any));
            act(() => {
                result.current.pinRow(0, 'top');
                result.current.setPageSize(100); // include everything for virtualization to window over
            });
            act(() => {
                // Simulate scrolling far down - a naive `allRows.slice(startIndex, endIndex)`
                // would drop row 0 (pinned) from the window entirely.
                result.current.onScroll({ currentTarget: { scrollTop: 2000, clientHeight: 400 } } as any);
            });
            expect(result.current.pinnedTopRows.map((r: any) => r.id)).toEqual([0]);
            expect(result.current.virtualRows.some((r: any) => r.id === 0)).toBe(false); // not duplicated into the scrollable window
        });
    });

    describe('v0.0.10 full core parity', () => {
        it('includes data-col-id in getHeaderProps and exposes grouping, multi-sort, advanced filter, and editing methods', () => {
            const { result } = renderHook(() => useUniversalTable(mockData, mockColumns));
            const headerProps = result.current.getHeaderProps(0, 'name');
            expect(headerProps['data-col-id']).toBe('name');

            expect(typeof result.current.setSortColumns).toBe('function');
            expect(typeof result.current.setAdvancedFilter).toBe('function');
            expect(typeof result.current.setGrouping).toBe('function');
            expect(typeof result.current.expandAll).toBe('function');
            expect(typeof result.current.startEdit).toBe('function');
        });
    });
});
