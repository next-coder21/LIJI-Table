import { UniversalTableCore, TableState, TableColumn, ColumnAlign, SortDirection } from '@liji-table/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class UniversalTable<T extends { id: any }> {
  // 1. Internal Brain
  private core: UniversalTableCore<T>;

  // 2. Reactive State (RxJS)
  private stateSubject: BehaviorSubject<TableState>;
  public state$: Observable<TableState>;

  // 3. UI Helpers
  public isResizing = false;

  constructor(data: T[], columns: TableColumn[] = []) {
    this.core = new UniversalTableCore(data, columns);
    this.stateSubject = new BehaviorSubject(this.core.getState());
    this.state$ = this.stateSubject.asObservable();

    // Sync Core updates to RxJS
    this.core.subscribe((newState) => {
      this.stateSubject.next(newState);
    });
  }

  // --- Data Sync ---
  setData(data: T[]) {
    this.core.setData(data);
  }

  // --- Getters ---
  // --- Getters ---
  get rows(): T[] { return this.core.getRows(); }
  get totalPages(): number { return this.core.getTotalPages(); }

  // Virtualization State
  private scrollTop = 0;
  private containerHeight = 800;
  private rowHeight = 48;

  get virtualRows(): T[] {
    const allRows = this.core.getRows();
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - 5);
    const endIndex = Math.min(allRows.length, Math.ceil((this.scrollTop + this.containerHeight) / this.rowHeight) + 5);
    return allRows.slice(startIndex, endIndex);
  }

  get virtualPaddingTop(): number {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - 5);
    return startIndex * this.rowHeight;
  }

  get virtualPaddingBottom(): number {
    const allRows = this.core.getRows();
    const totalHeight = allRows.length * this.rowHeight;
    const endIndex = Math.min(allRows.length, Math.ceil((this.scrollTop + this.containerHeight) / this.rowHeight) + 5);
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

  // Sorting
  toggleSort(colId: string) { this.core.toggleSort(colId); }
  setSortDirection(colId: string, dir: SortDirection) { this.core.setSortDirection(colId, dir); }

  // Pagination
  setPage(p: number) { this.core.setPage(p); }
  setPageSize(s: number) { this.core.setPageSize(s); }
  nextPage() { this.core.setPage(this.stateSubject.value.pageIndex + 1); }
  prevPage() { this.core.setPage(this.stateSubject.value.pageIndex - 1); }

  // Selection
  toggleSelection(id: number) { this.core.toggleSelection(id); }
  toggleAllPage() { this.core.toggleAllPage(); }
  isAllPageSelected() {
    const rows = this.core.getRows();
    return rows.length > 0 && rows.every(r => this.stateSubject.value.selectedIds.includes(r.id));
  }

  // Columns
  toggleVisibility(colId: string) { this.core.toggleVisibility(colId); }
  setColumnAlign(colId: string, align: ColumnAlign) { this.core.setColumnAlign(colId, align); }
  pinColumn(colId: string, pin: 'left' | 'right' | null) { this.core.pinColumn(colId, pin); }
  autoResizeAllColumns() { this.core.autoResizeAllColumns(); }

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

    const widths = this.stateSubject.value.columnWidths;
    const style: any = { position: 'sticky', zIndex: 2 };

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
    const startWidth = this.stateSubject.value.columnWidths[colId] || 150;
    const headerNode = (event.target as HTMLElement).closest('th');

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!headerNode) return;
      const newWidth = Math.max(50, startWidth + (moveEvent.pageX - startX));
      headerNode.style.width = `${newWidth}px`;
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (upEvent.pageX - startX));
      this.core.setColumnWidth(colId, newWidth);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      this.isResizing = false;
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