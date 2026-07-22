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
              <th *ngIf="showRowPin" class="liji-th-row-pin"></th>
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
                    <span *ngIf="col.pinned" class="liji-pin-icon">📌</span>
                    {{ col.label }}
                    <span *ngIf="(table.state$ | async)?.sortColumn === col.id" class="liji-sort-icon">
                       {{ (table.state$ | async)?.sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                 </div>
                 <div class="liji-resizer" (mousedown)="table.startResize($event, col.id)"></div>
              </th>
            </tr>

            <tr *ngIf="showFilters" class="liji-filter-row">
               <th *ngIf="showRowPin" class="liji-th-row-pin" style="top:45px"></th>
               <th *ngIf="showCheckboxes" class="liji-th-checkbox" style="top:45px"></th>
               <th *ngFor="let col of (table.visibleColumns$ | async)"
                   [ngClass]="col.pinned ? 'liji-pinned-' + col.pinned : ''"
                   [ngStyle]="getFilterStickyStyle(col.id)"
                   style="top:45px; z-index: 9"
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
          <div class="liji-menu-item" (click)="action('sortAsc')">Sort Asc</div>
          <div class="liji-menu-item" (click)="action('sortDesc')">Sort Desc</div>
          <div class="liji-menu-divider"></div>
          <div class="liji-menu-item" (click)="action('pinLeft')">Pin Left</div>
          <div class="liji-menu-item" (click)="action('pinRight')">Pin Right</div>
          <div class="liji-menu-item" (click)="action('unpin')">Unpin</div>
          <ng-container *ngIf="table.persistEnabled">
            <div class="liji-menu-divider"></div>
            <div class="liji-menu-item" (click)="action('saveLayout')">💾 Save Layout</div>
            <div class="liji-menu-item" (click)="action('resetLayout')">♻ Reset Layout</div>
          </ng-container>
      </div>
      <div *ngIf="contextMenu" (click)="contextMenu = null" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;"></div>

    </div>

    <!-- Shared row markup for pinned-top / windowed / pinned-bottom rows. -->
    <ng-template #rowTpl let-row="row" let-sticky="sticky">
      <tr #rowEl
          [style]="sticky"
          [class.liji-row-selected]="table.selectedIds.includes($any(row).id)"
          [class.liji-row-pinned]="table.isRowPinned($any(row).id)"
          [attr.aria-selected]="table.selectedIds.includes($any(row).id)"
          role="row">

        <td *ngIf="showRowPin" class="liji-td-row-pin">
          <button
            type="button"
            class="liji-row-pin-btn"
            [class.liji-row-pin-btn-active]="table.isRowPinned($any(row).id)"
            [attr.aria-label]="table.isRowPinned($any(row).id) ? 'Unpin row' : 'Pin row to top'"
            (click)="table.pinRow($any(row).id, table.isRowPinned($any(row).id) ? null : 'top')"
          >📌</button>
        </td>
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
  /** Shows a per-row 📌 button that pins the row to the top (renders on every page). */
  @Input() showRowPin = false;
  @Input() density: 'standard' | 'compact' | 'comfortable' = 'standard';
  @Input() cellTemplates: Record<string, TemplateRef<any>> = {};

  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('theadEl') theadElRef!: ElementRef<HTMLTableSectionElement>;
  @ViewChildren('rowEl') rowEls!: QueryList<ElementRef<HTMLTableRowElement>>;

  private containerResizeObserver?: ResizeObserver;
  private headerResizeObserver?: ResizeObserver;
  private rowResizeObserver?: ResizeObserver;

  // Sticky row offsets: pinned rows need a *measured* header height and row
  // height (both vary with `density`/`showFilters`), not a guessed pixel
  // value, so they stack under the header and against each other without
  // gaps or overlap.
  headerHeight = 0;
  rowHeight = 41;

  contextMenu: { x: number, y: number, colId: string } | null = null;

  ngOnChanges() {
    // Keep the checkbox column's width reserved out of the auto-fit
    // calculation for un-resized columns (see computeAutoFitWidths).
    this.table?.setReservedWidth((this.showCheckboxes ? 40 : 0) + (this.showRowPin ? 32 : 0));
  }

  ngAfterViewInit() {
    const node = this.scrollContainerRef?.nativeElement;
    if (node && typeof ResizeObserver !== 'undefined') {
      this.table.updateContainerWidth(node.clientWidth);
      this.containerResizeObserver = new ResizeObserver(() => this.table.updateContainerWidth(node.clientWidth));
      this.containerResizeObserver.observe(node);
    }

    const theadEl = this.theadElRef?.nativeElement;
    if (theadEl && typeof ResizeObserver !== 'undefined') {
      this.headerHeight = theadEl.offsetHeight;
      this.headerResizeObserver = new ResizeObserver(() => { this.headerHeight = theadEl.offsetHeight; });
      this.headerResizeObserver.observe(theadEl);
    }

    this.observeFirstRow();
    this.rowEls.changes.subscribe(() => this.observeFirstRow());
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
    return { ...style, top: '45px', zIndex: style['zIndex'] ? 21 : 9 };
  }

  onContextMenu(e: MouseEvent, colId: string) {
    e.preventDefault();
    this.contextMenu = { x: e.clientX, y: e.clientY, colId };
  }

  action(type: string) {
    if (!this.contextMenu) return;
    const { colId } = this.contextMenu;

    if (type === 'sortAsc') this.table.setSortDirection(colId, 'asc');
    if (type === 'sortDesc') this.table.setSortDirection(colId, 'desc');
    if (type === 'pinLeft') this.table.pinColumn(colId, 'left');
    if (type === 'pinRight') this.table.pinColumn(colId, 'right');
    if (type === 'unpin') this.table.pinColumn(colId, null);
    if (type === 'saveLayout') this.table.saveLayout();
    if (type === 'resetLayout') this.table.resetLayout();

    this.contextMenu = null;
  }
}
