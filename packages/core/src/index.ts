export type SortDirection = 'asc' | 'desc' | null;
export type ColumnAlign = 'left' | 'center' | 'right';

/** Filter operators for advanced filtering (v0.0.6+) */
export type FilterOperator =
  | 'equals' | 'notEquals'
  | 'contains' | 'notContains'
  | 'startsWith' | 'endsWith'
  | 'greaterThan' | 'lessThan'
  | 'greaterThanOrEqual' | 'lessThanOrEqual'
  | 'between' | 'inList'
  | 'isEmpty' | 'isNotEmpty';

/** Advanced filter condition */
export interface FilterCondition {
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator
  caseSensitive?: boolean;
}

/** Cell editor types */
export type CellEditorType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom';

/** Cell validator function */
export type CellValidator = (value: any, row: any) => boolean | string;

export interface TableColumn {
  id: string;
  label: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  hidden?: boolean;
  sortable?: boolean;
  align?: ColumnAlign;
  pinned?: 'left' | 'right' | null;

  // Advanced filtering (v0.0.6+)
  filterable?: boolean;
  filterOperator?: FilterOperator;

  // Inline editing (v0.0.6+)
  editable?: boolean;
  editor?: CellEditorType;
  editorOptions?: any; // e.g., { options: ['Option 1', 'Option 2'] } for select
  validate?: CellValidator;
}

/** Multi-column sort entry */
export interface SortEntry {
  columnId: string;
  direction: 'asc' | 'desc';
}

/**
 * Serializable snapshot of the column arrangement (order, width, pin, hidden, align).
 * Used to persist and restore a user's column layout (v0.0.8+).
 */
export interface LayoutSnapshot {
  columns: {
    id: string;
    hidden?: boolean;
    pinned?: 'left' | 'right' | null;
    align?: ColumnAlign;
  }[];
  columnWidths: Record<string, number>;
}

/**
 * Compute the actual pixel width to render for every visible column.
 *
 * Columns present in `columnWidths` (i.e. the user has manually dragged
 * their resize handle at some point) keep that exact pixel value forever,
 * unaffected by anything else. Any column NOT in `columnWidths` is "auto":
 * the leftover container space (containerWidth - reservedWidth - sum of
 * manual widths) is split among the auto columns proportionally to their
 * configured `width` (default 150), so the table fills its container by
 * default with no configuration needed.
 *
 * This deliberately replaces relying on the browser's native
 * `table-layout: fixed` leftover-redistribution behavior, which spreads
 * any shortfall across *every* column (including ones the user just
 * manually sized) on every reflow - that's what caused a column's resize
 * handle to lag behind the cursor and unrelated columns to shift during a
 * drag. With this function, every column always gets an explicit pixel
 * width, so there is never a "leftover" for the browser to redistribute,
 * and dragging one column can only ever change that one column.
 */
export function computeAutoFitWidths(
  columns: TableColumn[],
  columnWidths: Record<string, number>,
  containerWidth: number,
  reservedWidth: number = 0
): Record<string, number> {
  const visible = columns.filter(c => !c.hidden);
  const hidden = columns.filter(c => c.hidden);
  const result: Record<string, number> = {};
  const autoCols: TableColumn[] = [];
  let manualSum = 0;

  visible.forEach(c => {
    const stored = columnWidths[c.id];
    if (stored != null) {
      result[c.id] = stored;
      manualSum += stored;
    } else {
      autoCols.push(c);
    }
  });

  // Hidden columns don't participate in the fill calculation, but every
  // column still gets an entry so `computedColumnWidths[colId]` is never
  // `undefined` regardless of a column's hidden/visible state.
  hidden.forEach(c => {
    result[c.id] = columnWidths[c.id] ?? (c.width || 150);
  });

  if (autoCols.length === 0) return result;

  const available = Math.max(0, containerWidth - reservedWidth - manualSum);
  const autoDefaultTotal = autoCols.reduce((sum, c) => sum + (c.width || 150), 0) || 1;

  autoCols.forEach(c => {
    const defaultW = c.width || 150;
    const minW = c.minWidth || 50;
    const share = (defaultW / autoDefaultTotal) * available;
    result[c.id] = Math.max(minW, Math.round(share));
  });

  return result;
}

export interface TableState {
  columns: TableColumn[];
  columnWidths: Record<string, number>;

  // Single-column sort (backward compatibility)
  sortColumn: string | null;
  sortDirection: SortDirection;

  // Multi-column sort (new in v0.0.5)
  sortColumns: SortEntry[]; // Priority order: first = primary sort

  pageIndex: number;
  pageSize: number;

  // Basic filters (backward compatibility)
  filters: Record<string, string>;
  globalSearch: string;

  // Advanced filters (v0.0.6+)
  advancedFilters: Record<string, FilterCondition>;

  selectedIds: (string | number)[];

  /**
   * Row pinning (v0.0.9+): rows pinned "top" always render before the
   * current page's rows, "bottom" always after - regardless of sort order
   * or which page you're on. A pinned row that no longer matches the
   * current filter/search is omitted, same as any other row. Ignored while
   * `grouping` is active.
   */
  pinnedRowIds: { top: (string | number)[]; bottom: (string | number)[] };

  // Row Grouping State
  grouping: string[]; // Column IDs to group by
  expandedGroupIds: string[]; // Keys of expanded groups

  // Inline Editing (v0.0.6+)
  editingCell: { rowId: string | number; columnId: string } | null;
  editingValue: any;
}

// Group Row Type
export interface GroupRow<T> {
  isGroup: true;
  groupKey: string; // Unique ID (e.g., "Role:Admin")
  value: any; // The value (e.g., "Admin")
  depth: number;
  children: (T | GroupRow<T>)[];
  expanded: boolean;
  rowId: string; // Synthetic ID for selection/rendering compatibility
  leafCount: number; // Total children count
}

/**
 * Type guard for narrowing a `T | GroupRow<T>` union (returned by `rows` /
 * `visibleColumns` when grouping is enabled) down to the group-row case.
 * Equivalent to checking `row.isGroup`, but usable directly as a type guard.
 */
export function isGroupRow<T>(row: T | GroupRow<T>): row is GroupRow<T> {
  return (row as any)?.isGroup === true;
}

/**
 * LijiTable - The core table engine
 * 
 * A framework-agnostic, high-performance table engine that provides:
 * - Sorting (natural sort with multi-column support)
 * - Filtering (global + column-level)
 * - Pagination (client-side)
 * - Row selection
 * - Column management (resize, reorder, pin)
 * - Row grouping
 * - CSV export
 * 
 * @example
 * ```ts
 * const table = new LijiTable(data, columns);
 * table.subscribe(state => console.log(state));
 * table.setSearch('query');
 * ```
 */
export class LijiTable<T extends { id: any }> {
  private data: T[] = [];
  private state: TableState;
  private listeners: ((state: TableState) => void)[] = [];
  private cellChangeCallbacks: ((rowId: string | number, columnId: string, newValue: any, oldValue: any) => void)[] = [];

  constructor(initialData: T[], initialColumns: TableColumn[]) {
    this.data = initialData;
    this.state = {
      columns: initialColumns,
      columnWidths: {},
      sortColumn: null,
      sortDirection: null,
      sortColumns: [], // Multi-column sort (empty = no sort)
      pageIndex: 0,
      pageSize: 10,
      filters: {},
      globalSearch: '',
      advancedFilters: {}, // Advanced filters (empty = no filter)
      selectedIds: [],
      pinnedRowIds: { top: [], bottom: [] },
      grouping: [],
      expandedGroupIds: [],
      editingCell: null,
      editingValue: null
    };
  }

  getState(): TableState {
    return this.state;
  }

  setState(newState: Partial<TableState>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener: (state: TableState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  setData(data: T[]) {
    this.data = data;
    this.notify(); // Recalculate derived data
  }

  // --- ACTIONS ---

  setSearch(query: string) {
    this.setState({ globalSearch: query, pageIndex: 0 });
  }

  setFilter(colId: string, value: string) {
    this.setState({
      filters: { ...this.state.filters, [colId]: value },
      pageIndex: 0
    });
  }

  /**
   * Set advanced filter with operator (v0.0.6+)
   * @param columnId - Column to filter
   * @param condition - Filter condition with operator and value
   * @example
   * ```ts
   * // Price greater than 100
   * table.setAdvancedFilter('price', {
   *   operator: 'greaterThan',
   *   value: 100
   * });
   * 
   * // Name contains "Apple"
   * table.setAdvancedFilter('name', {
   *   operator: 'contains',
   *   value: 'Apple',
   *   caseSensitive: false
   * });
   * ```
   */
  setAdvancedFilter(columnId: string, condition: FilterCondition) {
    this.setState({
      advancedFilters: { ...this.state.advancedFilters, [columnId]: condition },
      pageIndex: 0
    });
  }

  /**
   * Clear advanced filter for a column
   */
  clearAdvancedFilter(columnId: string) {
    const { [columnId]: removed, ...remaining } = this.state.advancedFilters;
    this.setState({ advancedFilters: remaining });
  }

  /**
   * Clear all advanced filters
   */
  clearAllAdvancedFilters() {
    this.setState({ advancedFilters: {} });
  }

  /**
   * Helper: Evaluate a filter condition against a value
   */
  private evaluateFilter(value: any, condition: FilterCondition): boolean {
    const { operator, value: filterValue, value2, caseSensitive = false } = condition;

    // Handle null/undefined
    if (value == null) {
      return operator === 'isEmpty';
    }

    if (operator === 'isNotEmpty') {
      return value != null;
    }

    // Convert to string for string operations
    const strValue = caseSensitive ? String(value) : String(value).toLowerCase();
    const strFilter = caseSensitive ? String(filterValue) : String(filterValue).toLowerCase();

    switch (operator) {
      case 'equals':
        return value === filterValue;
      case 'notEquals':
        return value !== filterValue;
      case 'contains':
        return strValue.includes(strFilter);
      case 'notContains':
        return !strValue.includes(strFilter);
      case 'startsWith':
        return strValue.startsWith(strFilter);
      case 'endsWith':
        return strValue.endsWith(strFilter);
      case 'greaterThan':
        return value > filterValue;
      case 'lessThan':
        return value < filterValue;
      case 'greaterThanOrEqual':
        return value >= filterValue;
      case 'lessThanOrEqual':
        return value <= filterValue;
      case 'between':
        return value >= filterValue && value <= (value2 ?? filterValue);
      case 'inList':
        return Array.isArray(filterValue) && filterValue.includes(value);
      case 'isEmpty':
        return false; // Already handled above
      default:
        return true;
    }
  }

  // --- INLINE EDITING METHODS (v0.0.6+) ---

  /**
   * Register a callback for cell changes
   * @param callback - Function called when a cell is edited
   * @returns Unsubscribe function
   */
  onCellChange(callback: (rowId: string | number, columnId: string, newValue: any, oldValue: any) => void) {
    this.cellChangeCallbacks.push(callback);
    return () => {
      this.cellChangeCallbacks = this.cellChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Start editing a cell
   * @param rowId - Row ID to edit
   * @param columnId - Column ID to edit
   */
  startEdit(rowId: string | number, columnId: string) {
    const row = this.data.find(r => r.id === rowId);
    if (!row) return;

    const column = this.state.columns.find(c => c.id === columnId);
    if (!column?.editable) return;

    const currentValue = (row as any)[columnId];
    this.setState({
      editingCell: { rowId, columnId },
      editingValue: currentValue
    });
  }

  /**
   * Update the editing value (while editing)
   */
  setEditingValue(value: any) {
    if (!this.state.editingCell) return;
    this.setState({ editingValue: value });
  }

  /**
   * Save the current edit
   * @returns true if saved successfully, false if validation failed
   */
  saveEdit(): boolean {
    const { editingCell, editingValue } = this.state;
    if (!editingCell) return false;

    const { rowId, columnId } = editingCell;
    const row = this.data.find(r => r.id === rowId);
    if (!row) return false;

    const column = this.state.columns.find(c => c.id === columnId);
    if (!column) return false;

    // Validate
    if (column.validate) {
      const result = column.validate(editingValue, row);
      if (result === false || typeof result === 'string') {
        console.warn(`Validation failed: ${result}`);
        return false;
      }
    }

    // Save
    const oldValue = (row as any)[columnId];
    (row as any)[columnId] = editingValue;

    // Clear editing state
    this.setState({
      editingCell: null,
      editingValue: null
    });

    // Notify
    this.notify();
    this.cellChangeCallbacks.forEach(cb => cb(rowId, columnId, editingValue, oldValue));

    return true;
  }

  /**
   * Cancel the current edit
   */
  cancelEdit() {
    this.setState({
      editingCell: null,
      editingValue: null
    });
  }

  /**
   * Check if a cell is being edited
   */
  isEditing(rowId: string | number, columnId: string): boolean {
    const { editingCell } = this.state;
    return editingCell !== null &&
      editingCell.rowId === rowId &&
      editingCell.columnId === columnId;
  }

  toggleSort(colId: string) {
    const { sortColumn, sortDirection } = this.state;
    let newDir: SortDirection = 'asc';

    if (sortColumn === colId) {
      if (sortDirection === 'asc') newDir = 'desc';
      else if (sortDirection === 'desc') newDir = null;
    }

    // Update both single and multi-column sort states
    const sortColumns = newDir
      ? [{ columnId: colId, direction: newDir as 'asc' | 'desc' }]
      : [];

    this.setState({
      sortColumn: newDir ? colId : null,
      sortDirection: newDir,
      sortColumns
    });
  }

  setSortDirection(colId: string, direction: SortDirection) {
    const sortColumns = direction
      ? [{ columnId: colId, direction: direction as 'asc' | 'desc' }]
      : [];
    this.setState({ sortColumn: colId, sortDirection: direction, sortColumns });
  }

  /**
   * Set multiple sort columns (new in v0.0.5)
   * @param sorts - Array of sort entries in priority order
   * @example
   * ```ts
   * // Sort by category (asc), then by price (desc)
   * table.setSortColumns([
   *   { columnId: 'category', direction: 'asc' },
   *   { columnId: 'price', direction: 'desc' }
   * ]);
   * ```
   */
  setSortColumns(sorts: SortEntry[]) {
    // Update legacy single-column sort for backward compatibility
    const primarySort = sorts.length > 0 ? sorts[0] : null;
    this.setState({
      sortColumn: primarySort ? primarySort.columnId : null,
      sortDirection: primarySort ? primarySort.direction : null,
      sortColumns: sorts
    });
  }

  /**
   * Add or update a column in the multi-sort
   * @param columnId - Column to sort by
   * @param direction - Sort direction
   * @param replace - If true, replace existing sorts. If false, add to multi-sort
   */
  addSort(columnId: string, direction: 'asc' | 'desc', replace: boolean = false) {
    if (replace) {
      this.setSortColumns([{ columnId, direction }]);
    } else {
      // Remove existing sort for this column if any
      const existing = this.state.sortColumns.filter(s => s.columnId !== columnId);
      this.setSortColumns([...existing, { columnId, direction }]);
    }
  }

  /**
   * Remove a column from multi-sort
   */
  removeSort(columnId: string) {
    const updated = this.state.sortColumns.filter(s => s.columnId !== columnId);
    this.setSortColumns(updated);
  }

  setPage(pageIndex: number) {
    const total = this.getTotalPages();
    if (pageIndex >= 0 && pageIndex < total) {
      this.setState({ pageIndex });
    }
  }

  setPageSize(pageSize: number) {
    this.setState({ pageSize, pageIndex: 0 });
  }

  toggleSelection(id: number | string) {
    const { selectedIds } = this.state;
    if (selectedIds.includes(id)) {
      this.setState({ selectedIds: selectedIds.filter(sid => sid !== id) });
    } else {
      this.setState({ selectedIds: [...selectedIds, id] });
    }
  }

  toggleAllPage() {
    const rows = this.getRows().filter(r => !(r as any).isGroup) as T[]; // Only select leaf rows
    const allSelected = rows.every(r => this.state.selectedIds.includes(r.id));

    if (allSelected) {
      // Deselect all on this page
      const idsToRemove = rows.map(r => r.id);
      this.setState({ selectedIds: this.state.selectedIds.filter(id => !idsToRemove.includes(id)) });
    } else {
      // Select all on this page
      const idsToAdd = rows.map(r => r.id);
      const newSelected = [...new Set([...this.state.selectedIds, ...idsToAdd])];
      this.setState({ selectedIds: newSelected });
    }
  }

  /** Pin a row to 'top' / 'bottom' (always renders on every page), or unpin with `null`. */
  pinRow(id: string | number, pin: 'top' | 'bottom' | null) {
    const top = this.state.pinnedRowIds.top.filter(x => x !== id);
    const bottom = this.state.pinnedRowIds.bottom.filter(x => x !== id);
    if (pin === 'top') top.push(id);
    else if (pin === 'bottom') bottom.push(id);
    this.setState({ pinnedRowIds: { top, bottom } });
  }

  isRowPinned(id: string | number): 'top' | 'bottom' | null {
    if (this.state.pinnedRowIds.top.includes(id)) return 'top';
    if (this.state.pinnedRowIds.bottom.includes(id)) return 'bottom';
    return null;
  }

  setColumnWidth(colId: string, width: number) {
    this.setState({
      columnWidths: { ...this.state.columnWidths, [colId]: width }
    });
  }

  /**
   * Batch-set multiple column widths in a single update (one notify/re-render).
   * Used to "freeze" every column's currently-rendered pixel width the instant
   * a resize drag starts, so the browser's fixed-table-layout auto-fit
   * (which otherwise redistributes leftover space across every column on
   * each reflow) can't shift columns other than the one being dragged.
   */
  setColumnWidths(widths: Record<string, number>) {
    this.setState({
      columnWidths: { ...this.state.columnWidths, ...widths }
    });
  }

  toggleVisibility(colId: string) {
    const columns = this.state.columns.map(c =>
      c.id === colId ? { ...c, hidden: !c.hidden } : c
    );
    this.setState({ columns });
  }

  reorderColumn(fromIndex: number, toIndex: number) {
    const columns = [...this.state.columns];
    const [moved] = columns.splice(fromIndex, 1);
    columns.splice(toIndex, 0, moved);
    this.setState({ columns });
  }

  setColumnAlign(colId: string, align: ColumnAlign) {
    const columns = this.state.columns.map(c =>
      c.id === colId ? { ...c, align } : c
    );
    this.setState({ columns });
  }

  /**
   * @param options.reorder When `false`, only the `pinned` flag changes -
   *   the column stays at its current index instead of snapping to the
   *   left/right edge (or back to where auto-reorder would place it on
   *   unpin). Useful for a "reset width, keep position" action that
   *   shouldn't move the column. Defaults to `true` (existing behavior).
   */
  pinColumn(colId: string, pin: 'left' | 'right' | null, options: { reorder?: boolean } = {}) {
    const { reorder = true } = options;

    if (!reorder) {
      this.setState({
        columns: this.state.columns.map(c => c.id === colId ? { ...c, pinned: pin } : c)
      });
      return;
    }

    let columns = this.state.columns.map(c =>
      c.id === colId ? { ...c, pinned: pin } : c
    );

    // Auto-reorder: Move pinned columns to appropriate positions
    // Left-pinned columns go first, then unpinned, then right-pinned
    const targetColumn = columns.find(c => c.id === colId)!;
    columns = columns.filter(c => c.id !== colId);

    if (pin === 'left') {
      // Insert after existing left-pinned columns
      const lastLeftPinnedIndex = columns.findIndex(c => c.pinned !== 'left');
      const insertIndex = lastLeftPinnedIndex === -1 ? columns.length : lastLeftPinnedIndex;
      columns.splice(insertIndex, 0, targetColumn);
    } else if (pin === 'right') {
      // Insert before existing right-pinned columns
      const firstRightPinnedIndex = columns.findIndex(c => c.pinned === 'right');
      const insertIndex = firstRightPinnedIndex === -1 ? columns.length : firstRightPinnedIndex;
      columns.splice(insertIndex, 0, targetColumn);
    } else {
      // Unpinned: Insert after left-pinned, before right-pinned
      const firstRightPinnedIndex = columns.findIndex(c => c.pinned === 'right');
      const insertIndex = firstRightPinnedIndex === -1 ? columns.length : firstRightPinnedIndex;
      columns.splice(insertIndex, 0, targetColumn);
    }

    this.setState({ columns });
  }

  /**
   * Fit-to-**content**: sets every visible column's width from a character-length
   * heuristic over its label and (a sample of) its cell values, clamped to
   * 50-300px. This is unrelated to `computeAutoFitWidths` (used automatically by
   * the React hook's `computedColumnWidths` to fill the container for columns
   * that haven't been resized) - that one is fit-to-**container**, this one is
   * fit-to-**content**. If the container is much wider than 300px per column,
   * calling this will visibly shrink columns and leave empty space, not fill it.
   */
  autoResizeAllColumns() {
    // Basic heuristic: average char width * max length
    // In a real app, this would use canvas measurement or DOM measurement
    const newWidths: Record<string, number> = {};
    this.state.columns.forEach(col => {
      if (col.hidden) return;
      const maxContentLen = Math.max(
        col.label.length,
        ...this.data.map(r => String((r as any)[col.id]).length).slice(0, 100) // Sample 100
      );
      newWidths[col.id] = Math.max(50, Math.min(300, maxContentLen * 10)); // Clamp 50-300
    });
    this.setState({ columnWidths: { ...this.state.columnWidths, ...newWidths } });
  }

  // --- LAYOUT PERSISTENCE ---

  /**
   * Capture the current column arrangement (order, width, pin, hidden, align)
   * as a serializable snapshot that can be saved and restored later.
   */
  getLayoutSnapshot(): LayoutSnapshot {
    return {
      columns: this.state.columns.map(c => ({
        id: c.id,
        hidden: c.hidden,
        pinned: c.pinned,
        align: c.align
      })),
      columnWidths: { ...this.state.columnWidths }
    };
  }

  /**
   * Restore a previously captured layout snapshot.
   * Columns present in the snapshot are reordered/updated to match it;
   * any columns not present in the snapshot (e.g. added later) are appended at the end.
   */
  applyLayoutSnapshot(snapshot: LayoutSnapshot) {
    const remaining = new Map(this.state.columns.map(c => [c.id, c]));
    const orderedColumns: TableColumn[] = [];

    snapshot.columns.forEach(s => {
      const col = remaining.get(s.id);
      if (!col) return; // column no longer exists, skip
      orderedColumns.push({ ...col, hidden: s.hidden, pinned: s.pinned, align: s.align });
      remaining.delete(s.id);
    });

    // Append any columns that weren't part of the saved snapshot
    remaining.forEach(col => orderedColumns.push(col));

    this.setState({
      columns: orderedColumns,
      columnWidths: { ...this.state.columnWidths, ...snapshot.columnWidths }
    });
  }

  // --- ROW GROUPING ---

  setGrouping(colIds: string[]) {
    this.setState({ grouping: colIds, expandedGroupIds: [] });
  }

  toggleGroup(groupKey: string) {
    const { expandedGroupIds } = this.state;
    if (expandedGroupIds.includes(groupKey)) {
      this.setState({ expandedGroupIds: expandedGroupIds.filter(k => k !== groupKey) });
    } else {
      this.setState({ expandedGroupIds: [...expandedGroupIds, groupKey] });
    }
  }

  expandAll() {
    // Ideally we would traverse all groups, but for now we might need a way to get all group keys.
    // Lazy approach: we can't easily enable "all" unless we walk the tree.
    // TODO: Implement recursive collection of group keys.
  }

  collapseAll() {
    this.setState({ expandedGroupIds: [] });
  }

  // --- QUERY PIPELINE ---

  // Memoizes the filtered+sorted (or grouped) row computation: `getRows()`,
  // `getTotalPages()`, and `getPinnedRows()` all call `getAllFilteredRows()`
  // internally, and the same computation is re-requested many times per
  // scroll/render cycle without the underlying data or query state having
  // changed. Re-filtering and re-sorting the full dataset on every one of
  // those calls is the actual bottleneck at large row counts (millions of
  // rows) - not row pinning itself. The cache key covers every input the
  // computation reads; a stale `this.data` reference (set via `setData()`)
  // or any query-state change invalidates it automatically.
  private filteredRowsCache: { dataRef: T[]; key: string; rows: (T | GroupRow<T>)[] } | null = null;

  private getFilterCacheKey(): string {
    const s = this.state;
    return JSON.stringify([
      s.globalSearch, s.filters, s.advancedFilters,
      s.grouping, s.expandedGroupIds,
      s.sortColumns, s.sortColumn, s.sortDirection,
    ]);
  }

  getAllFilteredRows(): (T | GroupRow<T>)[] {
    const key = this.getFilterCacheKey();
    const cached = this.filteredRowsCache;
    if (cached && cached.dataRef === this.data && cached.key === key) {
      return cached.rows;
    }
    const rows = this.computeFilteredRows();
    this.filteredRowsCache = { dataRef: this.data, key, rows };
    return rows;
  }

  private computeFilteredRows(): (T | GroupRow<T>)[] {
    let rows: (T | GroupRow<T>)[] = this.data;

    // 1. Global Search
    if (this.state.globalSearch) {
      const q = this.state.globalSearch.toLowerCase();
      rows = (rows as T[]).filter(row =>
        Object.values(row as any).some(val => String(val).toLowerCase().includes(q))
      );
    }

    // 2. Basic Filters (backward compatibility)
    Object.entries(this.state.filters).forEach(([key, val]) => {
      if (val) {
        rows = (rows as T[]).filter((row: T) => String((row as any)[key]).toLowerCase().includes(val.toLowerCase()));
      }
    });

    // 3. Advanced Filters (v0.0.6+)
    Object.entries(this.state.advancedFilters).forEach(([key, condition]) => {
      rows = (rows as T[]).filter((row: T) => {
        const cellValue = (row as any)[key];
        return this.evaluateFilter(cellValue, condition);
      });
    });

    // 3. Grouping Transform (Flat T[] -> (T | GroupRow)[])
    if (this.state.grouping.length > 0) {
      return this.groupData(rows as T[], 0, []);
    }

    // 4. Sort (multi-column or single-column)
    // Use sortColumns if available (v0.0.5+), otherwise fall back to sortColumn
    const sortsToApply = this.state.sortColumns.length > 0
      ? this.state.sortColumns
      : (this.state.sortColumn ? [{ columnId: this.state.sortColumn, direction: this.state.sortDirection as 'asc' | 'desc' }] : []);

    if (sortsToApply.length > 0) {
      rows = [...rows] as T[];
      const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

      (rows as T[]).sort((a, b) => {
        // Apply sorts in priority order
        for (const sort of sortsToApply) {
          const valA = (a as any)[sort.columnId];
          const valB = (b as any)[sort.columnId];

          // Natural sort for strings, numeric for numbers
          let comparison: number;
          if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = collator.compare(valA, valB);
          } else {
            comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
          }

          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
          // If equal, continue to next sort column
        }
        return 0; // All sort columns equal
      });
    }

    return rows;
  }

  // Recursively Group Data and Flatten Visible Rows
  private groupData(rows: T[], depth: number, parentKeyParts: any[]): (T | GroupRow<T>)[] {
    if (depth >= this.state.grouping.length) {
      // Leaf level: return sorted rows
      if (this.state.sortColumn) {
        const { sortColumn, sortDirection } = this.state;
        const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
        return [...rows].sort((a, b) => {
          const valA = (a as any)[sortColumn!];
          const valB = (b as any)[sortColumn!];
          // Use natural sort for strings, numeric comparison for numbers
          const comparison = typeof valA === 'string' && typeof valB === 'string'
            ? collator.compare(valA, valB)
            : valA < valB ? -1 : valA > valB ? 1 : 0;
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      return rows;
    }

    const colId = this.state.grouping[depth];
    const groups = new Map<any, T[]>();

    // bucket rows
    rows.forEach(row => {
      const val = (row as any)[colId];
      const key = val === null || val === undefined ? '' : String(val); // Ensure Map Key consistency
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    });

    const result: (T | GroupRow<T>)[] = [];

    // Sort groups by key? Or user sort? For now, sort keys alphabetically.
    const sortedKeys = Array.from(groups.keys()).sort();

    for (const key of sortedKeys) {
      const groupRows = groups.get(key)!;
      const groupKey = [...parentKeyParts, key].join('::');
      const isExpanded = this.state.expandedGroupIds.includes(groupKey);

      const groupRow: GroupRow<T> = {
        isGroup: true,
        groupKey,
        value: key,
        depth,
        expanded: isExpanded,
        children: [], // Populated purely for API, but flat list relies on recursion below
        rowId: `g_${groupKey}`,
        leafCount: groupRows.length
      };

      result.push(groupRow);

      if (isExpanded) {
        const children = this.groupData(groupRows, depth + 1, [...parentKeyParts, key]);
        groupRow.children = children; // Store for reference
        result.push(...children);
      }
    }

    return result;
  }

  /**
   * Splits filtered rows into pinned-top / unpinned / pinned-bottom.
   * Pinned rows are looked up from the already-filtered set, so a pinned
   * row that no longer matches the current filter/search is simply
   * omitted, like any other row. No-op (returns everything as "unpinned")
   * while grouping is active, or if nothing is pinned.
   */
  private splitPinnedRows(rows: (T | GroupRow<T>)[]): { top: T[]; unpinned: (T | GroupRow<T>)[]; bottom: T[] } {
    const { top: topIds, bottom: bottomIds } = this.state.pinnedRowIds;
    if (this.state.grouping.length > 0 || (topIds.length === 0 && bottomIds.length === 0)) {
      return { top: [], unpinned: rows, bottom: [] };
    }
    const flat = rows as T[];
    const topSet = new Set(topIds);
    const bottomSet = new Set(bottomIds);
    const byId = new Map(flat.map(r => [r.id, r]));
    const top = topIds.map(id => byId.get(id)).filter((r): r is T => r != null);
    const bottom = bottomIds.map(id => byId.get(id)).filter((r): r is T => r != null);
    const unpinned = flat.filter(r => !topSet.has(r.id) && !bottomSet.has(r.id));
    return { top, unpinned, bottom };
  }

  getRows(): (T | GroupRow<T>)[] {
    const allFiltered = this.getAllFilteredRows();
    const { pageIndex, pageSize } = this.state;
    const { top, unpinned, bottom } = this.splitPinnedRows(allFiltered);
    const start = pageIndex * pageSize;
    const page = unpinned.slice(start, start + pageSize);
    return top.length === 0 && bottom.length === 0 ? page : [...top, ...page, ...bottom];
  }

  getTotalPages() {
    const { unpinned } = this.splitPinnedRows(this.getAllFilteredRows());
    return Math.ceil(unpinned.length / this.state.pageSize);
  }

  /**
   * Pinned rows resolved against the current filtered set, in pin order.
   * Lets a renderer render them as permanently-visible sticky rows outside
   * of its normal scroll/virtualization windowing, instead of re-deriving
   * "which rows are pinned" from `getRows()`'s output by id. Empty while
   * grouping is active, same as `pinRow()` itself is a no-op there.
   */
  getPinnedRows(): { top: T[]; bottom: T[] } {
    const { top, bottom } = this.splitPinnedRows(this.getAllFilteredRows());
    return { top, bottom };
  }

  getCSVContent() {
    // Export only leaf nodes for now? Or indented?
    // Simple implementation: Flat export ignoring groups
    const rows = this.data; // export all data, or filtered?
    if (rows.length === 0) return '';

    const header = this.state.columns.map(c => c.label).join(',');
    const body = rows.map(r => {
      return this.state.columns.map(c => JSON.stringify((r as any)[c.id])).join(',');
    }).join('\n');

    return `${header}\n${body}`;
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use `LijiTable` instead. This alias will be removed in v2.0.0
 * 
 * @example
 * ```ts
 * // ❌ Old (deprecated)
 * const table = new UniversalTableCore(data, columns);
 * 
 * // ✅ New (recommended)
 * const table = new LijiTable(data, columns);
 * ```
 */
export class UniversalTableCore<T extends { id: any }> extends LijiTable<T> {
  constructor(initialData: T[], initialColumns: TableColumn[]) {
    super(initialData, initialColumns);
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[Liji Table] UniversalTableCore is deprecated. Please use LijiTable instead. ' +
        'This alias will be removed in v2.0.0. ' +
        'See migration guide: https://github.com/yourrepo/liji-table#migration'
      );
    }
  }
}
