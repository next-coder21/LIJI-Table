import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  LijiTable,
  TableState,
  TableColumn,
  ColumnAlign,
  SortDirection,
  SortEntry,
  FilterOperator,
  FilterCondition,
  CellEditorType,
  CellValidator,
  LayoutSnapshot,
  GroupRow,
  isGroupRow,
  computeAutoFitWidths
} from '@liji-table/core';

export {
  LijiTable,
  isGroupRow,
  computeAutoFitWidths
};
export type {
  TableState,
  TableColumn,
  ColumnAlign,
  SortDirection,
  SortEntry,
  FilterOperator,
  FilterCondition,
  CellEditorType,
  CellValidator,
  LayoutSnapshot,
  GroupRow
};

const LAYOUT_STORAGE_PREFIX = 'liji-table:layout:';

function loadLayoutFromStorage(key: string): LayoutSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLayoutToStorage(key: string, snapshot: LayoutSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_PREFIX + key, JSON.stringify(snapshot));
  } catch {
    // localStorage unavailable (quota exceeded, private mode, etc.) - fail silently
  }
}

function clearLayoutFromStorage(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LAYOUT_STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

export interface UseLijiTableOptions {
  /**
   * When provided, the table's column layout (order, width, pin, hidden, align)
   * is auto-restored from localStorage on mount under this key, and can be
   * persisted at any time via the returned `saveLayout()` action.
   */
  persistKey?: string;
  /**
   * When `true` (requires `persistKey`), automatically calls `saveLayout()`
   * whenever the column layout (order/pinned/hidden/width/align) changes,
   * instead of requiring the consumer to call `saveLayout()` themselves.
   * Default `false`.
   */
  autoPersist?: boolean;
  /**
   * Width (px) to reserve when auto-fitting column widths to the container -
   * e.g. a checkbox column rendered outside the column list. Default 0.
   */
  reservedWidth?: number;
}

/**
 * React hook for LijiTable
 * 
 * Provides a headless table implementation with full state management and UI helpers.
 * 
 * @param data - Array of data objects (must have `id` property)
 * @param initialColumns - Column definitions
 * @returns Table instance with state, actions, and UI helper functions
 * 
 * @example
 * ```tsx
 * const table = useLijiTable(products, [
 *   { id: 'name', label: 'Name', sortable: true },
 *   { id: 'price', label: 'Price', sortable: true }
 * ]);
 * 
 * return (
 *   <table>
 *     <thead>
 *       <tr>
 *         {table.visibleColumns.map(col => (
 *           <th key={col.id} onClick={() => table.toggleSort(col.id)}>
 *             {col.label}
 *           </th>
 *         ))}
 *       </tr>
 *     </thead>
 *     <tbody>
 *       {table.rows.map(row => (
 *         <tr key={row.id}>
 *           {table.visibleColumns.map(col => (
 *             <td key={col.id}>{row[col.id]}</td>
 *           ))}
 *         </tr>
 *       ))}
 *     </tbody>
 *   </table>
 * );
 * ```
 */
export function useLijiTable<T extends { id: any }>(data: T[], initialColumns: TableColumn[] = [], options: UseLijiTableOptions = {}) {
  const { persistKey, autoPersist = false, reservedWidth = 0 } = options;

  // 1. Stable References to prevent re-initialization loops
  const dataRef = useRef(data);
  const columnsRef = useRef(initialColumns);



  // 2. Initialize Core (ONCE), restoring a saved layout if one exists
  const table = useMemo(() => {
    const instance = new LijiTable(dataRef.current, columnsRef.current);
    if (persistKey) {
      const savedLayout = loadLayoutFromStorage(persistKey);
      if (savedLayout) instance.applyLayoutSnapshot(savedLayout);
    }
    return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setState] = useState<TableState>(table.getState());

  // 3. Sync Data Updates
  // If the parent passes new data, update the core without destroying state
  useEffect(() => {
    table.setData(data);
  }, [data, table]);

  // 4. Subscribe to Core Changes
  useEffect(() => {
    const unsubscribe = table.subscribe((newState) => setState({ ...newState }));
    return () => { unsubscribe(); }
  }, [table]);

  // 4b. AUTO-PERSIST: when enabled, save the layout whenever it changes
  // (order/pinned/hidden/width/align), skipping the initial mount so we
  // don't immediately re-save the layout we just restored.
  const layoutSignature = useMemo(
    () => JSON.stringify(state.columns.map(c => ({ id: c.id, pinned: c.pinned, hidden: c.hidden, align: c.align, width: state.columnWidths[c.id] }))),
    [state.columns, state.columnWidths]
  );
  const skipFirstPersist = useRef(true);
  useEffect(() => {
    if (!autoPersist || !persistKey) return;
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    saveLayoutToStorage(persistKey, table.getLayoutSnapshot());
  }, [layoutSignature, autoPersist, persistKey, table]);

  // --- 5. AUTO-FIT COLUMN WIDTHS ---
  // Track the scroll container's width so columns the user hasn't manually
  // resized can proportionally fill it by default (see computeAutoFitWidths
  // in @liji-table/core). Consumers attach `containerRef` to the scrolling
  // element that wraps the table.
  const containerRef = useRef<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => {
      if (isResizingRef.current) return;
      const w = node.clientWidth;
      if (w > 0) setContainerWidth(w);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const computedColumnWidths = useMemo(
    () => computeAutoFitWidths(state.columns, state.columnWidths, containerWidth, reservedWidth),
    [state.columns, state.columnWidths, containerWidth, reservedWidth]
  );

  // --- 6. RESIZE LOGIC (Headless & Performance Optimized) ---
  // We use direct DOM manipulation for the drag to avoid React render lag
  const getResizerProps = (colId: string) => ({
    // Consumers commonly render this handle inside a `getHeaderProps` <th>
    // (draggable: true, for column reordering). Without these guards, a
    // mousedown/drag started on the resizer can be picked up by the
    // ancestor's native HTML5 drag instead of triggering a resize.
    draggable: false,
    onDragStart: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      setIsResizing(true);
      document.body.style.cursor = 'col-resize';

      const startX = e.pageX;

      // CRITICAL: Get the parent <TH> element to resize it directly
      const headerNode = (e.currentTarget as HTMLElement).closest('th') as HTMLTableCellElement | null;
      if (!headerNode) return;
      const tableNode = headerNode.closest('table');

      // 1. Force the table element itself to fixed layout and definite 0px base width
      // (in CSS, width: max-content disables table-layout: fixed and falls back to auto!).
      // With width: 0px + table-layout: fixed, table width is strictly the sum of column widths.
      if (tableNode) {
        tableNode.style.tableLayout = 'fixed';
        tableNode.style.width = '0px';
        tableNode.style.minWidth = '0px';
      }

      // 2. 🔒 FREEZE directly in DOM from actual rendered dimensions:
      // Lock every header's current rendered pixel width right now so the browser
      // layout engine cannot shrink or stretch any sibling headers (left or right)
      // while the user drags this handle, and so there is 0px jump on mousedown.
      const frozenWidths: Record<string, number> = { ...computedColumnWidths, ...state.columnWidths };
      if (tableNode) {
        const allThs = tableNode.querySelectorAll<HTMLTableCellElement>('thead tr:first-child th');
        allThs.forEach((th) => {
          const colIdAttr = th.getAttribute('data-col-id');
          const currentW = Math.round(th.getBoundingClientRect().width);
          if (currentW > 0) {
            if (colIdAttr) frozenWidths[colIdAttr] = currentW;
            th.style.width = `${currentW}px`;
            th.style.minWidth = `${currentW}px`;
            th.style.maxWidth = `${currentW}px`;
          }
        });
      }

      // Start from the column's actual rendered width so there's zero jump when the drag begins.
      const startWidth = frozenWidths[colId] ?? Math.round(headerNode.getBoundingClientRect().width);

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!headerNode) return;

        // Calculate new width
        const diff = moveEvent.pageX - startX;
        const newWidth = Math.max(50, Math.round(startWidth + diff));

        // 🚀 DIRECT DOM UPDATE: Only the dragged column changes!
        headerNode.style.width = `${newWidth}px`;
        headerNode.style.minWidth = `${newWidth}px`;
        headerNode.style.maxWidth = `${newWidth}px`;
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        const diff = upEvent.pageX - startX;
        const newWidth = Math.max(50, Math.round(startWidth + diff));

        // Clear temporary minWidth/maxWidth locks on all th elements
        if (tableNode) {
          const allThs = tableNode.querySelectorAll<HTMLTableCellElement>('thead tr:first-child th');
          allThs.forEach((th) => {
            th.style.minWidth = '';
            th.style.maxWidth = '';
          });
        }

        // Cleanup
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
        isResizingRef.current = false;
        setIsResizing(false);

        // 💾 COMMIT: Commit all frozen widths + the dragged column's new width in one update
        table.setColumnWidths({ ...frozenWidths, [colId]: newWidth });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  });

  // --- 6. DRAG & DROP LOGIC ---
  const getHeaderProps = (index: number, colId: string) => ({
    'data-col-id': colId,
    draggable: !isResizing, // Disable drag when resizing
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('colIndex', index.toString());
      e.currentTarget.classList.add('liji-dragging');
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault(); // Allow Drop
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('colIndex'), 10);
      if (!isNaN(fromIndex) && fromIndex !== index) {
        table.reorderColumn(fromIndex, index);
      }
      e.currentTarget.classList.remove('liji-dragging');
    },
    onDragEnd: (e: React.DragEvent) => {
      e.currentTarget.classList.remove('liji-dragging');
    }
  });

  // --- 8. VIRTUALIZATION ---
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(800); // Default estimate
  const rowHeight = 48; // Estimate, could be configurable

  // Derived Virtual State
  const allRows = table.getRows();

  // Pinned rows must never be excluded by the scroll-position window below -
  // they're meant to always be rendered (as sticky rows; see getResizerProps
  // -style helpers in the UI/Angular renderers) regardless of how far the
  // scrollable middle has scrolled. `virtualRows` covers only that
  // scrollable middle; consumers render pinnedTopRows/pinnedBottomRows
  // separately, outside the windowing below. When nothing is pinned these
  // are empty arrays and `virtualRows` behaves exactly as before.
  const { top: pinnedTopRows, bottom: pinnedBottomRows } = table.getPinnedRows();
  const pinnedTopIds = new Set(pinnedTopRows.map((r: any) => r.id));
  const pinnedBottomIds = new Set(pinnedBottomRows.map((r: any) => r.id));
  const scrollableRows = pinnedTopIds.size === 0 && pinnedBottomIds.size === 0
    ? allRows
    : allRows.filter((r: any) => !pinnedTopIds.has(r.id) && !pinnedBottomIds.has(r.id));

  const totalVirtualHeight = scrollableRows.length * rowHeight;

  // Buffer: render 5 extra rows above and below
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
  const endIndex = Math.min(scrollableRows.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + 5);

  const virtualRows = scrollableRows.slice(startIndex, endIndex);
  const virtualPaddingTop = startIndex * rowHeight;
  const virtualPaddingBottom = totalVirtualHeight - (endIndex * rowHeight);

  // --- 9. RETURN PUBLIC API ---
  return {
    state,
    rows: allRows, // Legacy support
    virtualRows, // Scrollable/windowed rows - excludes pinned rows, see above
    /** Rows pinned 'top', always rendered - render with sticky positioning outside the virtualized window. */
    pinnedTopRows,
    /** Rows pinned 'bottom', always rendered - render with sticky positioning outside the virtualized window. */
    pinnedBottomRows,
    virtualPaddingTop,
    virtualPaddingBottom,
    totalVirtualHeight,

    // Virtualization Handlers
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
      setContainerHeight(e.currentTarget.clientHeight);
    },

    // Auto-fit column widths: attach `containerRef` to the scrolling element
    // that wraps the table so un-resized columns can fill it by default.
    containerRef,
    computedColumnWidths,

    totalPages: table.getTotalPages(),
    selectedIds: state.selectedIds,
    allColumns: state.columns,
    visibleColumns: state.columns.filter(c => !c.hidden),
    setFilter: (colId: string, val: string) => table.setFilter(colId, val),

    // Actions
    setSearch: (q: string) => table.setSearch(q),
    setPage: (p: number) => table.setPage(p),
    setPageSize: (s: number) => table.setPageSize(s),
    exportData: () => table.getAllFilteredRows(),

    // Sort (Single & Multi-Column)
    toggleSort: (colId: string) => table.toggleSort(colId),
    setSortDirection: (colId: string, dir: SortDirection) => table.setSortDirection(colId, dir),
    setSortColumns: (sorts: SortEntry[]) => table.setSortColumns(sorts),
    addSort: (colId: string, dir: 'asc' | 'desc') => table.addSort(colId, dir),
    removeSort: (colId: string) => table.removeSort(colId),

    // Advanced Filters
    setAdvancedFilter: (colId: string, condition: FilterCondition) => table.setAdvancedFilter(colId, condition),
    clearAdvancedFilter: (colId: string) => table.clearAdvancedFilter(colId),
    clearAllAdvancedFilters: () => table.clearAllAdvancedFilters(),

    // Row Grouping
    setGrouping: (colIds: string[]) => table.setGrouping(colIds),
    toggleGroup: (groupKey: string) => table.toggleGroup(groupKey),
    expandAll: () => table.expandAll(),
    collapseAll: () => table.collapseAll(),

    // Inline Cell Editing
    startEdit: (rowId: string | number, colId: string) => table.startEdit(rowId, colId),
    setEditingValue: (val: any) => table.setEditingValue(val),
    saveEdit: () => table.saveEdit(),
    cancelEdit: () => table.cancelEdit(),
    isEditing: (rowId: string | number, colId: string) => table.isEditing(rowId, colId),
    onCellChange: (cb: (rowId: string | number, columnId: string, newValue: any, oldValue: any) => void) => table.onCellChange(cb),

    downloadCSV: (fileName: string = 'export.csv') => {
      const csvContent = table.getCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },

    // Pagination Navigation
    nextPage: () => table.setPage(state.pageIndex + 1),
    prevPage: () => table.setPage(state.pageIndex - 1),

    // Features
    toggleVisibility: (colId: string) => table.toggleVisibility(colId),
    toggleSelection: (id: string | number) => table.toggleSelection(id),
    toggleAllPage: () => table.toggleAllPage(),
    reorderColumn: (fromIndex: number, toIndex: number) => table.reorderColumn(fromIndex, toIndex),
    getLayoutSnapshot: () => table.getLayoutSnapshot(),
    applyLayoutSnapshot: (snapshot: LayoutSnapshot) => table.applyLayoutSnapshot(snapshot),
    table,

    isAllPageSelected: () => {
      const rows = table.getRows();
      const leafRows = rows.filter(r => !(r as any).isGroup) as T[];
      return leafRows.length > 0 && leafRows.every(r => state.selectedIds.includes(r.id));
    },

    /** Pin a row to 'top' / 'bottom' (renders on every page), or unpin with `null`. */
    pinRow: (id: string | number, pin: 'top' | 'bottom' | null) => table.pinRow(id, pin),
    isRowPinned: (id: string | number) => table.isRowPinned(id),

    setColumnAlign: (colId: string, align: ColumnAlign) => table.setColumnAlign(colId, align),

    // --- NEW EXPORTS (Required for UI) ---
    pinColumn: (colId: string, pin: 'left' | 'right' | null, options?: { reorder?: boolean }) =>
      table.pinColumn(colId, pin, options),
    autoResizeAllColumns: () => table.autoResizeAllColumns(),
    /** Set a single column's width (px). Participates in `saveLayout()` persistence. */
    setColumnWidth: (colId: string, width: number) => table.setColumnWidth(colId, width),
    /** Batch-set multiple column widths in one update. Participates in `saveLayout()` persistence. */
    setColumnWidths: (widths: Record<string, number>) => table.setColumnWidths(widths),
    /**
     * Clears manually-set widths so `computedColumnWidths` goes back to proportionally
     * filling the container, instead of the possible-leftover-space fit-to-content sizing
     * `autoResizeAllColumns()` applies. Leaves order/pin/hidden/align untouched.
     */
    resetColumnWidths: () => table.resetColumnWidths(),

    // --- LAYOUT PERSISTENCE ---
    /** Persist the current column arrangement to localStorage (requires `persistKey`). */
    saveLayout: () => {
      if (!persistKey) {
        console.warn('[Liji Table] saveLayout() requires a `persistKey` to be passed to useLijiTable().');
        return;
      }
      saveLayoutToStorage(persistKey, table.getLayoutSnapshot());
    },
    /** Clear the saved layout and restore the original column arrangement. */
    resetLayout: () => {
      if (persistKey) clearLayoutFromStorage(persistKey);
      table.setState({ columns: columnsRef.current, columnWidths: {} });
    },
    hasSavedLayout: () => !!persistKey && loadLayoutFromStorage(persistKey) !== null,

    // UI Helpers
    getHeaderProps,
    getResizerProps,
    isResizing
  };
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use `useLijiTable` instead. This alias will be removed in v2.0.0
 * 
 * @example
 * ```tsx
 * // ❌ Old (deprecated)
 * const table = useUniversalTable(data, columns);
 * 
 * // ✅ New (recommended)
 * const table = useLijiTable(data, columns);
 * ```
 */
export function useUniversalTable<T extends { id: any }>(data: T[], initialColumns: TableColumn[] = [], options: UseLijiTableOptions = {}) {
  // Show deprecation warning only once
  useEffect(() => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[Liji Table] useUniversalTable is deprecated. Please use useLijiTable instead. ' +
        'This alias will be removed in v2.0.0. ' +
        'See migration guide: https://github.com/next-coder21/LIJI-Table#migration'
      );
    }
  }, []);

  return useLijiTable(data, initialColumns, options);
}
