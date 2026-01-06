import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
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
  showCheckboxes = false // ✅ Default to false (Configurable)
}) => {
  const internalHook = useUniversalTable(data, columns);
  const table = tableInstance || internalHook;

  const {
    rows, state, visibleColumns, totalPages, selectedIds,
    toggleSelection, toggleAllPage, isAllPageSelected,
    getHeaderProps, getResizerProps,
    setSortDirection, pinColumn, setColumnAlign,
    prevPage, nextPage, setPageSize, setFilter,
    // Virtualization
    virtualRows, virtualPaddingTop, virtualPaddingBottom, onScroll
  } = table;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; colId: string; sortable: boolean; pinned?: 'left' | 'right' | null; } | null>(null);

  // --- Sticky Logic (Updated for Checkbox) ---
  const stickyOffsets = useMemo(() => {
    const offsets: Record<string, { left?: number; right?: number }> = {};

    // ✅ FIX: If checkboxes are shown, start left offset at 40px. If hidden, start at 0.
    let currentLeft = showCheckboxes ? 40 : 0;
    let currentRight = 0;

    visibleColumns.forEach((c: any) => {
      if (c.pinned === 'left') {
        offsets[c.id] = { ...offsets[c.id], left: currentLeft };
        currentLeft += state.columnWidths[c.id] || c.width || 150;
      }
    });

    [...visibleColumns].reverse().forEach((c: any) => {
      if (c.pinned === 'right') {
        offsets[c.id] = { ...offsets[c.id], right: currentRight };
        currentRight += state.columnWidths[c.id] || c.width || 150;
      }
    });
    return offsets;
  }, [visibleColumns, state.columnWidths, showCheckboxes]); // ✅ Depend on showCheckboxes

  const getStickyStyle = (col: ColumnWithRender): CSSProperties => {
    if (!col.pinned) return {};
    return {
      position: 'sticky',
      left: stickyOffsets[col.id]?.left,
      right: stickyOffsets[col.id]?.right,
    };
  };

  useEffect(() => {
    const close = () => setContextMenu(null);
    if (contextMenu) window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  return (
    <div className="liji-grid-wrapper" style={{ height }}>

      <div className="liji-table-scroll" onScroll={onScroll}>
        <table className={`liji-table liji-${density} ${enableStriped ? 'liji-striped' : ''}`} role="table" aria-label="Data Table">
          <thead>
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
                    style={{ width: state.columnWidths[col.id] || col.width, ...getStickyStyle(col) }}
                    {...getHeaderProps(idx, col.id)}
                    role="columnheader"
                    scope="col"
                    aria-sort={state.sortColumn === col.id ? (state.sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    onContextMenu={(e: any) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, colId: col.id, sortable: col.sortable !== false, pinned: col.pinned }); }}
                  >
                    <div className="liji-th-content" style={{ justifyContent: col.align || 'flex-start' }}>
                      {col.pinned && <span className="liji-pin-icon">📌</span>}
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
                {showCheckboxes && <th className="liji-th-checkbox" style={{ top: 45 }}></th>}

                {visibleColumns.map((c: any) => {
                  const col = c as ColumnWithRender;
                  return (
                    <th key={`${col.id}-filter`}
                      className={col.pinned ? `liji-pinned-${col.pinned}` : ''}
                      style={{ ...getStickyStyle(col), top: 45, zIndex: col.pinned ? 21 : 9, padding: '4px' }}
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
            {rows.map((row: any) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr key={row.id} className={isSelected ? 'liji-row-selected' : ''} aria-selected={isSelected} role="row">
                  {/* ✅ CONDITIONAL RENDER: Checkbox Cell */}
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
            })}
            {virtualPaddingBottom > 0 && <tr style={{ height: virtualPaddingBottom }}><td colSpan={visibleColumns.length + (showCheckboxes ? 1 : 0)} /></tr>}
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
        </div>
      )}
    </div>
  );
};