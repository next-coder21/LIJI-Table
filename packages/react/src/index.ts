import { useState, useEffect, useMemo, useRef } from 'react';
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
  CellValidator
} from '@liji-table/core';

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
export function useLijiTable<T extends { id: any }>(data: T[], initialColumns: TableColumn[] = []) {

  // 1. Stable References to prevent re-initialization loops
  const dataRef = useRef(data);
  const columnsRef = useRef(initialColumns);



  // 2. Initialize Core (ONCE)
  const table = useMemo(() => {
    return new LijiTable(dataRef.current, columnsRef.current);
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

  // --- 5. RESIZE LOGIC (Headless & Performance Optimized) ---
  const [isResizing, setIsResizing] = useState(false);


  // We use direct DOM manipulation for the drag to avoid React render lag
  const getResizerProps = (colId: string) => ({
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      document.body.style.cursor = 'col-resize';

      const startX = e.pageX;
      // Get current width from state, default to 150 if undefined
      const startWidth = state.columnWidths[colId] || 150;

      // CRITICAL: Get the parent <TH> element to resize it directly
      const headerNode = (e.currentTarget as HTMLElement).closest('th');

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!headerNode) return;

        // Calculate new width
        const diff = moveEvent.pageX - startX;
        const newWidth = Math.max(50, startWidth + diff);

        // 🚀 DIRECT DOM UPDATE: No React State lag here!
        headerNode.style.width = `${newWidth}px`;
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        const diff = upEvent.pageX - startX;
        const newWidth = Math.max(50, startWidth + diff);

        // 💾 COMMIT: Now we tell React/Core about the new width
        table.setColumnWidth(colId, newWidth);

        // Cleanup
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
        setIsResizing(false);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  });

  // --- 6. DRAG & DROP LOGIC ---
  const getHeaderProps = (index: number, colId: string) => ({
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
  const totalVirtualHeight = allRows.length * rowHeight;

  // Buffer: render 5 extra rows above and below
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
  const endIndex = Math.min(allRows.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + 5);

  const virtualRows = allRows.slice(startIndex, endIndex);
  const virtualPaddingTop = startIndex * rowHeight;
  const virtualPaddingBottom = totalVirtualHeight - (endIndex * rowHeight);

  // --- 9. RETURN PUBLIC API ---
  return {
    state,
    rows: allRows, // Legacy support
    virtualRows, // New Virtual Rows
    virtualPaddingTop,
    virtualPaddingBottom,
    totalVirtualHeight,

    // Virtualization Handlers
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
      setContainerHeight(e.currentTarget.clientHeight);
    },

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

    // Sort
    toggleSort: (colId: string) => table.toggleSort(colId),
    setSortDirection: (colId: string, dir: SortDirection) => table.setSortDirection(colId, dir),
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
    toggleSelection: (id: number) => table.toggleSelection(id),
    toggleAllPage: () => table.toggleAllPage(),

    isAllPageSelected: () => {
      const rows = table.getRows();
      const leafRows = rows.filter(r => !(r as any).isGroup) as T[];
      return leafRows.length > 0 && leafRows.every(r => state.selectedIds.includes(r.id));
    },

    setColumnAlign: (colId: string, align: ColumnAlign) => table.setColumnAlign(colId, align),

    // --- NEW EXPORTS (Required for UI) ---
    pinColumn: (colId: string, pin: 'left' | 'right' | null) => table.pinColumn(colId, pin),
    autoResizeAllColumns: () => table.autoResizeAllColumns(),

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
export function useUniversalTable<T extends { id: any }>(data: T[], initialColumns: TableColumn[] = []) {
  // Show deprecation warning only once
  useEffect(() => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[Liji Table] useUniversalTable is deprecated. Please use useLijiTable instead. ' +
        'This alias will be removed in v2.0.0. ' +
        'See migration guide: https://github.com/yourrepo/liji-table#migration'
      );
    }
  }, []);

  return useLijiTable(data, initialColumns);
}
