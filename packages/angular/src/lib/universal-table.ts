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
  computeAutoFitWidths,
  GroupRow,
  isGroupRow
} from '@liji-table/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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

export class UniversalTable<T extends { id: any }> {
  // 1. Internal Brain
  private core: LijiTable<T>;

  // 2. Reactive State (RxJS)
  private stateSubject: BehaviorSubject<TableState>;
  public state$: Observable<TableState>;

  // 3. UI Helpers
  public isResizing = false;

  // 4. Layout Persistence
  private persistKey?: string;
  private initialColumns: TableColumn[];

  // 5. Auto-Fit Column Widths
  private containerWidthSubject = new BehaviorSubject<number>(0);
  public containerWidth$ = this.containerWidthSubject.asObservable();
  private reservedWidthSubject: BehaviorSubject<number>;

  constructor(data: T[], columns: TableColumn[] = [], persistKey?: string, reservedWidth: number = 0) {
    this.core = new LijiTable(data, columns);
    this.persistKey = persistKey;
    this.initialColumns = columns;
    this.reservedWidthSubject = new BehaviorSubject<number>(reservedWidth);

    if (persistKey) {
      const savedLayout = loadLayoutFromStorage(persistKey);
      if (savedLayout) this.core.applyLayoutSnapshot(savedLayout);
    }

    this.stateSubject = new BehaviorSubject(this.core.getState());
    this.state$ = this.stateSubject.asObservable();

    // Sync Core updates to RxJS
    this.core.subscribe((newState) => {
      this.stateSubject.next(newState);
    });
  }

  // --- Layout Persistence ---
  /** Persist the current column arrangement to localStorage (requires `persistKey` to have been passed to the constructor). */
  saveLayout() {
    if (!this.persistKey) {
      console.warn('[Liji Table] saveLayout() requires a `persistKey` to be passed to the UniversalTable constructor.');
      return;
    }
    saveLayoutToStorage(this.persistKey, this.core.getLayoutSnapshot());
  }

  /** Clear the saved layout and restore the original column arrangement. */
  resetLayout() {
    if (this.persistKey) clearLayoutFromStorage(this.persistKey);
    this.core.setState({ columns: this.initialColumns, columnWidths: {} });
  }

  hasSavedLayout(): boolean {
    return !!this.persistKey && loadLayoutFromStorage(this.persistKey) !== null;
  }

  get persistEnabled(): boolean {
    return !!this.persistKey;
  }

  // --- Auto-Fit Column Widths ---
  /** Call with the scrolling wrapper's current clientWidth (e.g. from a ResizeObserver) so un-resized columns can proportionally fill it. */
  updateContainerWidth(px: number) {
    if (this.isResizing) return;
    if (this.containerWidthSubject.value !== px) this.containerWidthSubject.next(px);
  }

  /** Width (px) to reserve for elements outside the column list, e.g. a checkbox column. */
  setReservedWidth(px: number) {
    if (this.reservedWidthSubject.value !== px) {
      this.reservedWidthSubject.next(px);
    }
  }

  /** Synchronously compute the current pixel width for every visible column - see computeAutoFitWidths in @liji-table/core. */
  getComputedColumnWidths(): Record<string, number> {
    const state = this.stateSubject.value;
    return computeAutoFitWidths(state.columns, state.columnWidths, this.containerWidthSubject.value, this.reservedWidthSubject.value);
  }

  /** Reactive stream of getComputedColumnWidths(), recomputed whenever state, container width, or reserved width changes. */
  get computedColumnWidths$(): Observable<Record<string, number>> {
    return combineLatest([this.state$, this.containerWidth$, this.reservedWidthSubject]).pipe(
      map(([state, containerWidth, reservedWidth]) => computeAutoFitWidths(state.columns, state.columnWidths, containerWidth, reservedWidth))
    );
  }

  // --- Data Sync ---
  setData(data: T[]) {
    this.core.setData(data);
  }

  // --- Getters ---
  get rows(): (T | GroupRow<T>)[] { return this.core.getRows(); }
  get totalPages(): number { return this.core.getTotalPages(); }

  // Virtualization State
  private scrollTop = 0;
  private containerHeight = 800;
  private rowHeight = 48;

  // Pinned rows must never be excluded by the scroll-position window below -
  // they're always rendered (as sticky rows, see the component template)
  // regardless of how far the scrollable middle has scrolled. `virtualRows`
  // covers only that scrollable middle; `pinnedTopRows`/`pinnedBottomRows`
  // are rendered separately, outside the windowing below.
  get pinnedTopRows(): T[] { return this.core.getPinnedRows().top; }
  get pinnedBottomRows(): T[] { return this.core.getPinnedRows().bottom; }

  private getScrollableRows(): (T | GroupRow<T>)[] {
    const allRows = this.core.getRows();
    const { top, bottom } = this.core.getPinnedRows();
    if (top.length === 0 && bottom.length === 0) return allRows;
    const pinnedIds = new Set([...top, ...bottom].map(r => r.id));
    return allRows.filter(r => !pinnedIds.has((r as any).id));
  }

  get virtualRows(): (T | GroupRow<T>)[] {
    const scrollableRows = this.getScrollableRows();
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - 5);
    const endIndex = Math.min(scrollableRows.length, Math.ceil((this.scrollTop + this.containerHeight) / this.rowHeight) + 5);
    return scrollableRows.slice(startIndex, endIndex);
  }

  get virtualPaddingTop(): number {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - 5);
    return startIndex * this.rowHeight;
  }

  get virtualPaddingBottom(): number {
    const scrollableRows = this.getScrollableRows();
    const totalHeight = scrollableRows.length * this.rowHeight;
    const endIndex = Math.min(scrollableRows.length, Math.ceil((this.scrollTop + this.containerHeight) / this.rowHeight) + 5);
    return Math.max(0, totalHeight - (endIndex * this.rowHeight));
  }

  updateScroll(scrollTop: number, containerHeight: number) {
    if (this.scrollTop !== scrollTop || this.containerHeight !== containerHeight) {
      this.scrollTop = scrollTop;
      this.containerHeight = containerHeight;
      // Trigger change awareness if using OnPush, otherwise direct binding is fine
    }
  }



  get visibleColumns$(): Observable<TableColumn[]> {
    return this.state$.pipe(map(s => s.columns.filter(c => !c.hidden)));
  }

  get allColumns() { return this.stateSubject.value.columns; }
  get selectedIds() { return this.stateSubject.value.selectedIds; }

  // --- Actions ---
  setSearch(q: string) { this.core.setSearch(q); }
  setFilter(colId: string, val: string) { this.core.setFilter(colId, val); }

  // Advanced Filters
  setAdvancedFilter(colId: string, condition: FilterCondition) { this.core.setAdvancedFilter(colId, condition); }
  clearAdvancedFilter(colId: string) { this.core.clearAdvancedFilter(colId); }
  clearAllAdvancedFilters() { this.core.clearAllAdvancedFilters(); }

  // Sorting (Single & Multi-Column)
  toggleSort(colId: string) { this.core.toggleSort(colId); }
  setSortDirection(colId: string, dir: SortDirection) { this.core.setSortDirection(colId, dir); }
  setSortColumns(sorts: SortEntry[]) { this.core.setSortColumns(sorts); }
  addSort(colId: string, dir: 'asc' | 'desc') { this.core.addSort(colId, dir); }
  removeSort(colId: string) { this.core.removeSort(colId); }

  // Row Grouping
  setGrouping(colIds: string[]) { this.core.setGrouping(colIds); }
  toggleGroup(groupKey: string) { this.core.toggleGroup(groupKey); }
  expandAll() { this.core.expandAll(); }
  collapseAll() { this.core.collapseAll(); }

  // Inline Cell Editing
  startEdit(rowId: string | number, colId: string) { return this.core.startEdit(rowId, colId); }
  setEditingValue(val: any) { this.core.setEditingValue(val); }
  saveEdit() { return this.core.saveEdit(); }
  cancelEdit() { this.core.cancelEdit(); }
  isEditing(rowId: string | number, colId: string) { return this.core.isEditing(rowId, colId); }
  onCellChange(cb: (rowId: string | number, columnId: string, newValue: any, oldValue: any) => void) { return this.core.onCellChange(cb); }

  // Pagination
  setPage(p: number) { this.core.setPage(p); }
  setPageSize(s: number) { this.core.setPageSize(s); }
  nextPage() { this.core.setPage(this.stateSubject.value.pageIndex + 1); }
  prevPage() { this.core.setPage(this.stateSubject.value.pageIndex - 1); }

  // Selection
  toggleSelection(id: string | number) { this.core.toggleSelection(id); }
  toggleAllPage() { this.core.toggleAllPage(); }
  isAllPageSelected() {
    const rows = this.core.getRows().filter((r): r is T => !isGroupRow(r)); // only leaf rows are selectable
    return rows.length > 0 && rows.every(r => this.stateSubject.value.selectedIds.includes(r.id));
  }

  // Row Pinning
  /** Pin a row to 'top' / 'bottom' (renders on every page), or unpin with `null`. */
  pinRow(id: string | number, pin: 'top' | 'bottom' | null) { this.core.pinRow(id, pin); }
  isRowPinned(id: string | number) { return this.core.isRowPinned(id); }

  // Columns
  toggleVisibility(colId: string) { this.core.toggleVisibility(colId); }
  setColumnAlign(colId: string, align: ColumnAlign) { this.core.setColumnAlign(colId, align); }
  pinColumn(colId: string, pin: 'left' | 'right' | null, options?: { reorder?: boolean }) { this.core.pinColumn(colId, pin, options); }
  reorderColumn(fromIndex: number, toIndex: number) { this.core.reorderColumn(fromIndex, toIndex); }
  setColumnWidth(colId: string, width: number) { this.core.setColumnWidth(colId, width); }
  setColumnWidths(widths: Record<string, number>) { this.core.setColumnWidths(widths); }
  getLayoutSnapshot(): LayoutSnapshot { return this.core.getLayoutSnapshot(); }
  applyLayoutSnapshot(snapshot: LayoutSnapshot) { this.core.applyLayoutSnapshot(snapshot); }
  autoResizeAllColumns() { this.core.autoResizeAllColumns(); }
  /**
   * Clears manually-set widths so `getComputedColumnWidths()`/`computedColumnWidths$` go back
   * to proportionally filling the container, instead of the possible-leftover-space
   * fit-to-content sizing `autoResizeAllColumns()` applies. Leaves order/pin/hidden/align untouched.
   */
  resetColumnWidths() { this.core.resetColumnWidths(); }

  // Export
  downloadCSV(fileName = 'export.csv') {
    const csvContent = this.core.getCSVContent();
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
  }

  // --- UI Logic: Sticky Offsets ---
  // Calculates 'left' and 'right' styles for sticky columns
  getStickyStyle(colId: string, showCheckboxes: boolean): { [key: string]: any } {
    const cols = this.stateSubject.value.columns.filter(c => !c.hidden);
    const col = cols.find(c => c.id === colId);
    if (!col || !col.pinned) return {};

    const widths = this.getComputedColumnWidths();
    // NOTE: z-index is intentionally left to CSS, not set inline here. The
    // component styles give a pinned *header* cell a higher z-index (20) than
    // a pinned *body* cell (2) so the header stays above scrolling body
    // content; forcing z-index inline here would flatten both to the same
    // value and let scrolling cells bleed over the pinned header.
    const style: any = { position: 'sticky' };

    if (col.pinned === 'left') {
      let left = showCheckboxes ? 40 : 0;
      for (const c of cols) {
        if (c.id === col.id) break;
        if (c.pinned === 'left') left += (widths[c.id] || c.width || 150);
      }
      style.left = `${left}px`;
    }

    if (col.pinned === 'right') {
      let right = 0;
      for (let i = cols.length - 1; i >= 0; i--) {
        const c = cols[i];
        if (c.id === col.id) break;
        if (c.pinned === 'right') right += (widths[c.id] || c.width || 150);
      }
      style.right = `${right}px`;
    }

    return style;
  }

  // --- UI Logic: Resize (Direct DOM) ---
  startResize(event: MouseEvent, colId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';

    const startX = event.pageX;
    const headerNode = (event.target as HTMLElement).closest('th') as HTMLTableCellElement | null;
    if (!headerNode) return;
    const tableNode = headerNode.closest('table');
    if (tableNode) {
      tableNode.style.tableLayout = 'fixed';
      tableNode.style.width = '0px';
      tableNode.style.minWidth = '0px';
    }

    const state = this.stateSubject.value;
    const computed = this.getComputedColumnWidths();
    const frozenWidths: Record<string, number> = { ...computed, ...state.columnWidths };

    if (tableNode) {
      const allThs = tableNode.querySelectorAll<HTMLTableCellElement>('thead tr:first-child th');
      allThs.forEach(th => {
        const cid = th.getAttribute('data-col-id');
        const w = Math.round(th.getBoundingClientRect().width);
        if (w > 0) {
          if (cid) frozenWidths[cid] = w;
          th.style.width = `${w}px`;
          th.style.minWidth = `${w}px`;
          th.style.maxWidth = `${w}px`;
        }
      });
    }

    const startWidth = frozenWidths[colId] ?? Math.round(headerNode.getBoundingClientRect().width);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!headerNode) return;
      const newWidth = Math.max(50, Math.round(startWidth + (moveEvent.pageX - startX)));
      headerNode.style.width = `${newWidth}px`;
      headerNode.style.minWidth = `${newWidth}px`;
      headerNode.style.maxWidth = `${newWidth}px`;
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      const newWidth = Math.max(50, Math.round(startWidth + (upEvent.pageX - startX)));
      if (tableNode) {
        const allThs = tableNode.querySelectorAll<HTMLTableCellElement>('thead tr:first-child th');
        allThs.forEach(th => {
          th.style.minWidth = '';
          th.style.maxWidth = '';
        });
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      this.isResizing = false;
      this.core.setColumnWidths({ ...frozenWidths, [colId]: newWidth });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // --- UI Logic: Drag & Drop ---
  onDragStart(event: DragEvent, index: number) {
    if (this.isResizing) { event.preventDefault(); return; }
    if (event.dataTransfer && event.currentTarget) {
      event.dataTransfer.setData('colIndex', index.toString());
      (event.currentTarget as HTMLElement).classList.add('liji-dragging');
    }
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (event.dataTransfer) {
      const fromIndex = parseInt(event.dataTransfer.getData('colIndex'), 10);
      if (!isNaN(fromIndex) && fromIndex !== targetIndex) {
        this.core.reorderColumn(fromIndex, targetIndex);
      }
    }
    (event.currentTarget as HTMLElement).classList.remove('liji-dragging');
  }

  onDragEnd(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('liji-dragging');
  }
}