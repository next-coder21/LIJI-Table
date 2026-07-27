import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, CSSProperties } from 'react';
import { useUniversalTable } from '@liji-table/react';
import { ICONS } from './icons';
import './styles.css';

interface UniversalTableProps {
  data?: any[];
  columns?: any[];
  tableInstance?: any;
  height?: string | number;
  enableStriped?: boolean;
  density?: 'standard' | 'compact' | 'comfortable';
  showFilters?: boolean;
  showCheckboxes?: boolean; // ✅ NEW PROP
  /** Enables row pinning: right-click a row to pin it to top/bottom (pinned rows stay
   *  sticky on every page and are shown with a duller background — no pin column/icon). */
  showRowPin?: boolean;
  /** When provided, enables "Save Layout" / "Reset Layout" in the column context menu, persisting column order/width/pin/hidden/align to localStorage under this key. */
  persistKey?: string;
}

interface ColumnWithRender {
  id: string;
  label: string;
  width?: number;
  sortable?: boolean;
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right' | null;
  render?: (value: any, row: any) => React.ReactNode;
}

const EMPTY_DATA: any[] = [];
const EMPTY_COLUMNS: any[] = [];

export const UniversalTable: React.FC<UniversalTableProps> = ({
  data = EMPTY_DATA,
  columns = EMPTY_COLUMNS,
  tableInstance,
  height = "100%",
  enableStriped = false,
  density = 'standard',
  showFilters = false,
  showCheckboxes = false, // ✅ Default to false (Configurable)
  showRowPin = false,
  persistKey
}) => {
  const reservedWidth = showCheckboxes ? 40 : 0;
  const internalHook = useUniversalTable(data, columns, { persistKey, reservedWidth });
  const table = tableInstance || internalHook;

  const {
    state, visibleColumns, totalPages, selectedIds,
    toggleSelection, toggleAllPage, isAllPageSelected,
    getHeaderProps, getResizerProps,
    setSortDirection, pinColumn, setColumnAlign,
    pinRow, isRowPinned,
    prevPage, nextPage, setPageSize, setFilter,
    saveLayout, resetLayout,
    containerRef, computedColumnWidths,
    // Virtualization
    virtualRows, pinnedTopRows, pinnedBottomRows, virtualPaddingTop, virtualPaddingBottom, onScroll
  } = table;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; colId: string; sortable: boolean; pinned?: 'left' | 'right' | null; } | null>(null);
  // Right-click a body row to pin/unpin it (the dedicated pin column was
  // removed in favor of a duller "pinned" background + this menu).
  const [rowMenu, setRowMenu] = useState<{ x: number; y: number; rowId: any; pinned: 'top' | 'bottom' | null } | null>(null);

  // --- Sticky row offsets: pinned rows need a *measured* header height and
  // row height (both vary with `density`/`showFilters`), not a guessed
  // pixel value, so they stack under the header and against each other
  // without gaps or overlap. Falls back to sane defaults before the first
  // measurement (initial paint / SSR).
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const firstRowRef = useRef<HTMLTableRowElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  // The header <tr> height (where the filter row sticks). Hardcoding this
  // caused a gap/overlap between the header, filter row, and first pinned row.
  const [headerRowHeight, setHeaderRowHeight] = useState(45);
  const [rowHeight, setRowHeight] = useState(41);

  useLayoutEffect(() => {
    const theadEl = theadRef.current;
    if (!theadEl || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      setHeaderHeight(theadEl.offsetHeight);
      const headerRow = theadEl.querySelector('tr');
      if (headerRow) setHeaderRowHeight((headerRow as HTMLElement).offsetHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(theadEl);
    measure();
    return () => observer.disconnect();
  }, [showFilters, density]);

  useLayoutEffect(() => {
    const rowEl = firstRowRef.current;
    if (!rowEl || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setRowHeight(rowEl.offsetHeight));
    observer.observe(rowEl);
    setRowHeight(rowEl.offsetHeight);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, pinnedTopRows.length, virtualRows.length]);

  // --- Sticky Logic (Updated for Checkbox) ---
  const stickyOffsets = useMemo(() => {
    const offsets: Record<string, { left?: number; right?: number }> = {};

    // If checkboxes and/or the row-pin column are shown, start the left offset past them.
    let currentLeft = reservedWidth;
    let currentRight = 0;

    visibleColumns.forEach((c: any) => {
      if (c.pinned === 'left') {
        offsets[c.id] = { ...offsets[c.id], left: currentLeft };
        currentLeft += computedColumnWidths[c.id] || c.width || 150;
      }
    });

    [...visibleColumns].reverse().forEach((c: any) => {
      if (c.pinned === 'right') {
        offsets[c.id] = { ...offsets[c.id], right: currentRight };
        currentRight += computedColumnWidths[c.id] || c.width || 150;
      }
    });
    return offsets;
  }, [visibleColumns, computedColumnWidths, reservedWidth]);

  const getStickyStyle = (col: ColumnWithRender): CSSProperties => {
    if (!col.pinned) return {};
    return {
      position: 'sticky',
      left: stickyOffsets[col.id]?.left,
      right: stickyOffsets[col.id]?.right,
    };
  };

  useEffect(() => {
    const close = () => { setContextMenu(null); setRowMenu(null); };
    if (contextMenu || rowMenu) window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu, rowMenu]);

  /** Renders one data row. `rowRef`/`stickyStyle` are only passed for pinned rows. */
  const renderDataRow = (row: any, opts?: { rowRef?: React.Ref<HTMLTableRowElement>; stickyStyle?: CSSProperties }) => {
    const isSelected = selectedIds.includes(row.id);
    const pinned = showRowPin ? isRowPinned(row.id) : null;
    return (
      <tr
        key={row.id}
        ref={opts?.rowRef}
        className={`${isSelected ? 'liji-row-selected' : ''} ${pinned ? 'liji-row-pinned' : ''}`}
        style={opts?.stickyStyle}
        aria-selected={isSelected}
        role="row"
        onContextMenu={showRowPin ? (e: any) => { e.preventDefault(); setRowMenu({ x: e.clientX, y: e.clientY, rowId: row.id, pinned }); } : undefined}
      >
        {showCheckboxes && (
          <td className="liji-td-checkbox" role="cell">
            <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(row.id)} aria-label="Select Row" />
          </td>
        )}

        {visibleColumns.map((c: any) => {
          const col = c as ColumnWithRender;
          return (
            <td key={col.id}
              className={col.pinned ? `liji-pinned-${col.pinned}` : ''}
              style={{ textAlign: col.align || 'left', ...getStickyStyle(col) }}
              role="cell">
              {col.render ? col.render(row[col.id], row) : row[col.id]}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="liji-grid-wrapper" style={{ height }}>

      <div className="liji-table-scroll" ref={containerRef as any} onScroll={onScroll}>
        <table className={`liji-table liji-${density} ${enableStriped ? 'liji-striped' : ''}`} role="table" aria-label="Data Table">
          <thead ref={theadRef}>
            {/* Header Row */}
            <tr>
              {/* ✅ CONDITIONAL RENDER: Checkbox Header */}
              {showCheckboxes && (
                <th className="liji-th-checkbox">
                  <input type="checkbox" onChange={toggleAllPage} checked={isAllPageSelected()} />
                </th>
              )}

              {visibleColumns.map((c: any, idx: number) => {
                const col = c as ColumnWithRender;
                return (
                  <th key={col.id}
                    className={col.pinned ? `liji-pinned-${col.pinned}` : ''}
                    style={{ width: computedColumnWidths[col.id], ...getStickyStyle(col) }}
                    data-col-id={col.id}
                    {...getHeaderProps(idx, col.id)}
                    role="columnheader"
                    scope="col"
                    aria-sort={state.sortColumn === col.id ? (state.sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    onContextMenu={(e: any) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, colId: col.id, sortable: col.sortable !== false, pinned: col.pinned }); }}
                  >
                    <div className="liji-th-content" style={{ justifyContent: col.align || 'flex-start' }}>
                      {col.label}
                      {state.sortColumn === col.id && <span className="liji-sort-icon" dangerouslySetInnerHTML={{ __html: state.sortDirection === 'asc' ? ICONS.sortAsc : ICONS.sortDesc }} />}
                    </div>
                    <div className="liji-resizer" {...getResizerProps(col.id)} />
                  </th>
                );
              })}
            </tr>

            {/* Filter Row */}
            {showFilters && (
              <tr className="liji-filter-row">
                {/* ✅ CONDITIONAL RENDER: Checkbox Spacer in Filter Row */}
                {showCheckboxes && <th className="liji-th-checkbox" style={{ top: headerRowHeight }}></th>}

                {visibleColumns.map((c: any) => {
                  const col = c as ColumnWithRender;
                  return (
                    <th key={`${col.id}-filter`}
                      className={col.pinned ? `liji-pinned-${col.pinned}` : ''}
                      style={{ ...getStickyStyle(col), top: headerRowHeight, zIndex: col.pinned ? 21 : 9, padding: '4px' }}
                    >
                      <input
                        className="liji-filter-input"
                        placeholder={`Filter...`}
                        onChange={(e) => setFilter && setFilter(col.id, e.target.value)}
                      />
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>

          {/* Body */}
          <tbody>
            {/* Pinned-top rows: sticky, stacked directly under the header. Always
                rendered regardless of scroll position - see pinnedTopRows in the hook. */}
            {pinnedTopRows.map((row: any, i: number) =>
              renderDataRow(row, {
                rowRef: i === 0 ? firstRowRef : undefined,
                stickyStyle: { position: 'sticky', top: headerHeight + i * rowHeight, zIndex: 5 },
              })
            )}

            {virtualPaddingTop > 0 && <tr style={{ height: virtualPaddingTop }}><td colSpan={visibleColumns.length + (showCheckboxes ? 1 : 0)} /></tr>}
            {virtualRows.map((row: any, i: number) =>
              renderDataRow(row, { rowRef: pinnedTopRows.length === 0 && i === 0 ? firstRowRef : undefined })
            )}
            {virtualPaddingBottom > 0 && <tr style={{ height: virtualPaddingBottom }}><td colSpan={visibleColumns.length + (showCheckboxes ? 1 : 0)} /></tr>}

            {/* Pinned-bottom rows: sticky to the bottom of the scroll container
                (the footer sits outside .liji-table-scroll, so bottom:0 doesn't
                collide with it). Stacked from the last row upward. */}
            {pinnedBottomRows.map((row: any, i: number) =>
              renderDataRow(row, {
                stickyStyle: { position: 'sticky', bottom: (pinnedBottomRows.length - 1 - i) * rowHeight, zIndex: 5 },
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer (Same as before) */}
      <div className="liji-footer">
        <div className="liji-footer-left">
          Rows: <select value={state.pageSize} onChange={(e) => setPageSize(+e.target.value)}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
        </div>
        <div className="liji-footer-right">
          <span>Page {state.pageIndex + 1} of {totalPages}</span>
          <button className="liji-btn-page" onClick={prevPage} disabled={state.pageIndex === 0}>Prev</button>
          <button className="liji-btn-page" onClick={nextPage} disabled={state.pageIndex >= totalPages - 1}>Next</button>
        </div>
      </div>

      {/* Context Menu (Same as before) */}
      {contextMenu && (
        <div className="liji-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <div className="liji-menu-header">Actions</div>
          <div className="liji-menu-item" onClick={() => { table.autoResizeAllColumns(); setContextMenu(null); }}><span>⟷</span> Autosize All</div>
          <div className="liji-menu-item" onClick={() => { table.resetColumnWidths(); setContextMenu(null); }}><span>⤢</span> Fill Container</div>
          <div className="liji-menu-divider" />
          {contextMenu.sortable && <>
            <div className="liji-menu-item" onClick={() => { setSortDirection(contextMenu.colId, 'asc'); setContextMenu(null); }}>Sort Asc</div>
            <div className="liji-menu-item" onClick={() => { setSortDirection(contextMenu.colId, 'desc'); setContextMenu(null); }}>Sort Desc</div>
          </>}
          <div className="liji-menu-divider" />
          <div className="liji-menu-item" onClick={() => { pinColumn(contextMenu.colId, 'left'); setContextMenu(null); }}>Pin Left</div>
          <div className="liji-menu-item" onClick={() => { pinColumn(contextMenu.colId, 'right'); setContextMenu(null); }}>Pin Right</div>
          <div className="liji-menu-item" onClick={() => { pinColumn(contextMenu.colId, null); setContextMenu(null); }}>Unpin</div>
          <div className="liji-menu-divider" />
          <div className="liji-menu-item" onClick={() => { setColumnAlign(contextMenu.colId, 'left'); setContextMenu(null); }}>Align Left</div>
          <div className="liji-menu-item" onClick={() => { setColumnAlign(contextMenu.colId, 'center'); setContextMenu(null); }}>Align Center</div>
          <div className="liji-menu-item" onClick={() => { setColumnAlign(contextMenu.colId, 'right'); setContextMenu(null); }}>Align Right</div>
          {persistKey && <>
            <div className="liji-menu-divider" />
            <div className="liji-menu-item" onClick={() => { saveLayout(); setContextMenu(null); }}>💾 Save Layout</div>
            <div className="liji-menu-item" onClick={() => { resetLayout(); setContextMenu(null); }}>♻ Reset Layout</div>
          </>}
        </div>
      )}

      {/* Row Context Menu (pin/unpin a row) */}
      {rowMenu && (
        <div className="liji-context-menu" style={{ top: rowMenu.y, left: rowMenu.x }}>
          <div className="liji-menu-header">Row</div>
          {rowMenu.pinned ? (
            <div className="liji-menu-item" onClick={() => { pinRow(rowMenu.rowId, null); setRowMenu(null); }}>Unpin row</div>
          ) : (
            <>
              <div className="liji-menu-item" onClick={() => { pinRow(rowMenu.rowId, 'top'); setRowMenu(null); }}>Pin row to top</div>
              <div className="liji-menu-item" onClick={() => { pinRow(rowMenu.rowId, 'bottom'); setRowMenu(null); }}>Pin row to bottom</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};