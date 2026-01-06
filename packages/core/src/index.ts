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

  setColumnWidth(colId: string, width: number) {
    this.setState({
      columnWidths: { ...this.state.columnWidths, [colId]: width }
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

  pinColumn(colId: string, pin: 'left' | 'right' | null) {
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

  getAllFilteredRows(): (T | GroupRow<T>)[] {
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

  getRows(): (T | GroupRow<T>)[] {
    const allFiltered = this.getAllFilteredRows();
    const { pageIndex, pageSize } = this.state;
    const start = pageIndex * pageSize;
    return allFiltered.slice(start, start + pageSize);
  }

  getTotalPages() {
    return Math.ceil(this.getAllFilteredRows().length / this.state.pageSize);
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
