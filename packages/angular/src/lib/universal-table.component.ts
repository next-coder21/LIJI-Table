import { Component, Input, TemplateRef, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalTable } from './universal-table';

@Component({
  selector: 'liji-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="liji-grid-wrapper" [style.height]="height">

      <div class="liji-table-scroll" #scrollContainer (scroll)="onScroll($event)">
        <table class="liji-table" [ngClass]="'liji-' + density" [class.liji-striped]="enableStriped" role="table" aria-label="Data Table">
          <thead #theadEl>
            <tr>
              <th *ngIf="showCheckboxes" class="liji-th-checkbox">
                <input type="checkbox" [checked]="table.isAllPageSelected()" (change)="table.toggleAllPage()">
              </th>

              <th *ngFor="let col of (table.visibleColumns$ | async); let i = index"
                  [style.width.px]="(table.computedColumnWidths$ | async)?.[col.id]"
                  [ngClass]="col.pinned ? 'liji-pinned-' + col.pinned : ''"
                  [ngStyle]="table.getStickyStyle(col.id, showCheckboxes)"
                  [attr.data-col-id]="col.id"

                  draggable="true"
                  (dragstart)="table.onDragStart($event, i)"
                  (dragover)="table.onDragOver($event)"
                  (drop)="table.onDrop($event, i)"
                  (dragend)="table.onDragEnd($event)"
                  (contextmenu)="onContextMenu($event, col.id)"
                  role="columnheader"
                  scope="col"
                  [attr.aria-sort]="(table.state$ | async)?.sortColumn === col.id ? ((table.state$ | async)?.sortDirection === 'asc' ? 'ascending' : 'descending') : null"
              >
                 <div class="liji-th-content" [style.justify-content]="col.align || 'flex-start'">
                    {{ col.label }}
                    <span *ngIf="(table.state$ | async)?.sortColumn === col.id" class="liji-sort-icon">
                       {{ (table.state$ | async)?.sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                 </div>
                 <div class="liji-resizer" (mousedown)="table.startResize($event, col.id)"></div>
              </th>
            </tr>

            <tr *ngIf="showFilters" class="liji-filter-row">
               <th *ngIf="showCheckboxes" class="liji-th-checkbox" [style.top.px]="headerRowHeight"></th>
               <th *ngFor="let col of (table.visibleColumns$ | async)"
                   [ngClass]="col.pinned ? 'liji-pinned-' + col.pinned : ''"
                   [ngStyle]="getFilterStickyStyle(col.id)"
               >
                 <input class="liji-filter-input" placeholder="Filter..."
                        (input)="onFilterChange(col.id, $event)">
               </th>
            </tr>
          </thead>

          <tbody>
            <!-- Pinned-top rows: sticky, stacked directly under the header.
                 Always rendered regardless of scroll position - see table.pinnedTopRows. -->
            <ng-container *ngFor="let row of table.pinnedTopRows; let i = index">
              <ng-container *ngTemplateOutlet="rowTpl; context: { row: row, sticky: pinnedTopStyle(i) }"></ng-container>
            </ng-container>

            <tr [style.height.px]="table.virtualPaddingTop"></tr>
            <ng-container *ngFor="let row of table.virtualRows">
              <ng-container *ngTemplateOutlet="rowTpl; context: { row: row, sticky: null }"></ng-container>
            </ng-container>
            <tr [style.height.px]="table.virtualPaddingBottom"></tr>

            <!-- Pinned-bottom rows: sticky to the bottom of .liji-table-scroll
                 (the footer sits outside it, so bottom:0 doesn't collide). -->
            <ng-container *ngFor="let row of table.pinnedBottomRows; let i = index">
              <ng-container *ngTemplateOutlet="rowTpl; context: { row: row, sticky: pinnedBottomStyle(i) }"></ng-container>
            </ng-container>
          </tbody>
        </table>
      </div>

      <div class="liji-footer">
        <div class="liji-footer-left">
           <label>Rows: <select (change)="table.setPageSize(+$any($event.target).value)" aria-label="Rows per page">
             <option [value]="10">10</option>
             <option [value]="20">20</option>
             <option [value]="50">50</option>
           </select></label>
        </div>
        <div class="liji-footer-right">
           <span>Page {{ (table.state$ | async)?.pageIndex! + 1 }} of {{ table.totalPages }}</span>
           <button class="liji-btn-page" (click)="table.prevPage()" [disabled]="(table.state$ | async)?.pageIndex === 0">Prev</button>
           <button class="liji-btn-page" (click)="table.nextPage()" [disabled]="(table.state$ | async)?.pageIndex! >= table.totalPages - 1">Next</button>
        </div>
      </div>

      <div *ngIf="contextMenu" class="liji-context-menu" [style.top.px]="contextMenu.y" [style.left.px]="contextMenu.x">
          <div class="liji-menu-header">Actions</div>
          <div class="liji-menu-item" (click)="action('autosizeAll')"><span>⟷</span> Autosize All</div>
          <div class="liji-menu-item" (click)="action('fillContainer')"><span>⤢</span> Fill Container</div>
          <div class="liji-menu-divider"></div>
          <div class="liji-menu-item" (click)="action('sortAsc')">Sort Asc</div>
          <div class="liji-menu-item" (click)="action('sortDesc')">Sort Desc</div>
          <div class="liji-menu-divider"></div>
          <div class="liji-menu-item" (click)="action('pinLeft')">Pin Left</div>
          <div class="liji-menu-item" (click)="action('pinRight')">Pin Right</div>
          <div class="liji-menu-item" (click)="action('unpin')">Unpin</div>
          <div class="liji-menu-divider"></div>
          <div class="liji-menu-item" (click)="action('alignLeft')">Align Left</div>
          <div class="liji-menu-item" (click)="action('alignCenter')">Align Center</div>
          <div class="liji-menu-item" (click)="action('alignRight')">Align Right</div>
          <ng-container *ngIf="table.persistEnabled">
            <div class="liji-menu-divider"></div>
            <div class="liji-menu-item" (click)="action('saveLayout')">💾 Save Layout</div>
            <div class="liji-menu-item" (click)="action('resetLayout')">♻ Reset Layout</div>
          </ng-container>
      </div>
      <div *ngIf="contextMenu" (click)="contextMenu = null" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;"></div>

      <!-- Row context menu (pin/unpin a row) -->
      <div *ngIf="rowMenu" class="liji-context-menu" [style.top.px]="rowMenu.y" [style.left.px]="rowMenu.x">
          <div class="liji-menu-header">Row</div>
          <ng-container *ngIf="rowMenu.pinned; else notPinned">
            <div class="liji-menu-item" (click)="rowAction(null)">Unpin row</div>
          </ng-container>
          <ng-template #notPinned>
            <div class="liji-menu-item" (click)="rowAction('top')">Pin row to top</div>
            <div class="liji-menu-item" (click)="rowAction('bottom')">Pin row to bottom</div>
          </ng-template>
      </div>
      <div *ngIf="rowMenu" (click)="rowMenu = null" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;"></div>

    </div>

    <!-- Shared row markup for pinned-top / windowed / pinned-bottom rows. -->
    <ng-template #rowTpl let-row="row" let-sticky="sticky">
      <tr #rowEl
          [ngStyle]="sticky"
          [class.liji-row-selected]="table.selectedIds.includes($any(row).id)"
          [class.liji-row-pinned]="table.isRowPinned($any(row).id)"
          [attr.aria-selected]="table.selectedIds.includes($any(row).id)"
          (contextmenu)="showRowPin && onRowContextMenu($event, $any(row).id)"
          role="row">

        <td *ngIf="showCheckboxes" class="liji-td-checkbox">
          <input type="checkbox" [checked]="table.selectedIds.includes($any(row).id)" (change)="table.toggleSelection($any(row).id)">
        </td>

        <td *ngFor="let col of (table.visibleColumns$ | async)"
            [style.text-align]="col.align || 'left'"
            [ngClass]="col.pinned ? 'liji-pinned-' + col.pinned : ''"
            [ngStyle]="table.getStickyStyle(col.id, showCheckboxes)"
        >
          <ng-container *ngIf="cellTemplates[col.id] as tpl; else defaultCell">
             <ng-container *ngTemplateOutlet="tpl; context: { $implicit: $any(row)[col.id], row: row }"></ng-container>
          </ng-container>
          <ng-template #defaultCell>{{ $any(row)[col.id] }}</ng-template>
        </td>
      </tr>
    </ng-template>
  `,
  styles: []
})
export class UniversalTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() table!: UniversalTable<any>;
  @Input() height = '100%';
  @Input() enableStriped = false;
  @Input() showCheckboxes = false;
  @Input() showFilters = false;
  /** Enables row pinning: right-click a row to pin it to top/bottom. Pinned rows stay
   *  sticky on every page and are shown with a duller background (no pin column/icon). */
  @Input() showRowPin = false;
  @Input() density: 'standard' | 'compact' | 'comfortable' = 'standard';
  @Input() cellTemplates: Record<string, TemplateRef<any>> = {};

  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('theadEl') theadElRef!: ElementRef<HTMLTableSectionElement>;
  @ViewChildren('rowEl') rowEls!: QueryList<ElementRef<HTMLTableRowElement>>;

  private containerResizeObserver?: ResizeObserver;
  private headerResizeObserver?: ResizeObserver;
  private rowResizeObserver?: ResizeObserver;

  // Sticky offsets need *measured* heights (they vary with `density`/font),
  // not guessed pixel values:
  //  - headerHeight    = full <thead> height → where pinned rows stick.
  //  - headerRowHeight = the header <tr> height → where the filter <tr> sticks
  //    (a hardcoded value here is the classic cause of a 1-row gap/overlap
  //     between the header, the filter row, and the first pinned row).
  headerHeight = 0;
  headerRowHeight = 45;
  rowHeight = 41;

  contextMenu: { x: number, y: number, colId: string } | null = null;
  rowMenu: { x: number, y: number, rowId: any, pinned: 'top' | 'bottom' | null } | null = null;

  ngOnChanges() {
    // Keep the checkbox column's width reserved out of the auto-fit
    // calculation for un-resized columns (see computeAutoFitWidths).
    this.table?.setReservedWidth(this.showCheckboxes ? 40 : 0);
  }

  ngAfterViewInit() {
    // Deferred to a new macrotask: measuring here and writing it back
    // synchronously (updateContainerWidth -> computedColumnWidths$ emits ->
    // width bindings change) would land inside the same change-detection
    // cycle Angular's dev-mode "no changes" pass just verified, triggering
    // NG0100 (ExpressionChangedAfterItHasBeenCheckedError). Deferring runs
    // it in a fresh cycle instead.
    setTimeout(() => {
      const node = this.scrollContainerRef?.nativeElement;
      if (node && typeof ResizeObserver !== 'undefined') {
        this.table.updateContainerWidth(node.clientWidth);
        this.containerResizeObserver = new ResizeObserver(() => this.table.updateContainerWidth(node.clientWidth));
        this.containerResizeObserver.observe(node);
      }

      const theadEl = this.theadElRef?.nativeElement;
      if (theadEl && typeof ResizeObserver !== 'undefined') {
        const measure = () => {
          this.headerHeight = theadEl.offsetHeight;
          // First <tr> in the thead = the header row; the filter row sticks
          // right below it.
          const headerRow = theadEl.querySelector('tr');
          if (headerRow) this.headerRowHeight = (headerRow as HTMLElement).offsetHeight;
        };
        measure();
        this.headerResizeObserver = new ResizeObserver(measure);
        this.headerResizeObserver.observe(theadEl);
      }

      this.observeFirstRow();
      this.rowEls.changes.subscribe(() => this.observeFirstRow());
    });
  }

  /** Re-measures row height off whichever row renders first (pinned or windowed) - re-run whenever the rendered row set changes. */
  private observeFirstRow() {
    this.rowResizeObserver?.disconnect();
    const rowEl = this.rowEls.first?.nativeElement;
    if (!rowEl || typeof ResizeObserver === 'undefined') return;
    this.rowHeight = rowEl.offsetHeight;
    this.rowResizeObserver = new ResizeObserver(() => { this.rowHeight = rowEl.offsetHeight; });
    this.rowResizeObserver.observe(rowEl);
  }

  pinnedTopStyle(index: number) {
    return { position: 'sticky', top: `${this.headerHeight + index * this.rowHeight}px`, zIndex: 5 };
  }

  pinnedBottomStyle(index: number) {
    const fromEnd = this.table.pinnedBottomRows.length - 1 - index;
    return { position: 'sticky', bottom: `${fromEnd * this.rowHeight}px`, zIndex: 5 };
  }

  ngOnDestroy() {
    this.containerResizeObserver?.disconnect();
    this.headerResizeObserver?.disconnect();
    this.rowResizeObserver?.disconnect();
  }

  onFilterChange(colId: string, event: Event) {
    this.table.setFilter(colId, (event.target as HTMLInputElement).value);
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.table.updateScroll(target.scrollTop, target.clientHeight);
  }

  getFilterStickyStyle(colId: string) {
    const style = this.table.getStickyStyle(colId, this.showCheckboxes);
    // `style` now carries `position: 'sticky'` only for pinned columns, so use
    // that as the "is this column pinned?" signal for the higher z-index.
    return { ...style, top: `${this.headerRowHeight}px`, zIndex: style['position'] ? 21 : 9 };
  }

  onContextMenu(e: MouseEvent, colId: string) {
    e.preventDefault();
    this.contextMenu = { x: e.clientX, y: e.clientY, colId };
  }

  onRowContextMenu(e: MouseEvent, rowId: any) {
    e.preventDefault();
    this.rowMenu = { x: e.clientX, y: e.clientY, rowId, pinned: this.table.isRowPinned(rowId) };
  }

  rowAction(pin: 'top' | 'bottom' | null) {
    if (this.rowMenu) this.table.pinRow(this.rowMenu.rowId, pin);
    this.rowMenu = null;
  }

  action(type: string) {
    if (!this.contextMenu) return;
    const { colId } = this.contextMenu;

    if (type === 'autosizeAll') this.table.autoResizeAllColumns();
    if (type === 'fillContainer') this.table.resetColumnWidths();
    if (type === 'sortAsc') this.table.setSortDirection(colId, 'asc');
    if (type === 'sortDesc') this.table.setSortDirection(colId, 'desc');
    if (type === 'pinLeft') this.table.pinColumn(colId, 'left');
    if (type === 'pinRight') this.table.pinColumn(colId, 'right');
    if (type === 'unpin') this.table.pinColumn(colId, null);
    if (type === 'alignLeft') this.table.setColumnAlign(colId, 'left');
    if (type === 'alignCenter') this.table.setColumnAlign(colId, 'center');
    if (type === 'alignRight') this.table.setColumnAlign(colId, 'right');
    if (type === 'saveLayout') this.table.saveLayout();
    if (type === 'resetLayout') this.table.resetLayout();

    this.contextMenu = null;
  }
}
