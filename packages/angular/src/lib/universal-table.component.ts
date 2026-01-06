import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalTable } from './universal-table';

@Component({
  selector: 'liji-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="liji-grid-wrapper" [style.height]="height">
      
      <div class="liji-table-scroll" (scroll)="onScroll($event)">
        <table class="liji-table" [ngClass]="'liji-' + density" [class.liji-striped]="enableStriped" role="table" aria-label="Data Table">
          <thead>
            <tr>
              <th *ngIf="showCheckboxes" class="liji-th-checkbox">
                <input type="checkbox" [checked]="table.isAllPageSelected()" (change)="table.toggleAllPage()">
              </th>

              <th *ngFor="let col of (table.visibleColumns$ | async); let i = index"
                  [style.width.px]="(table.state$ | async)?.columnWidths?.[col.id] || col.width"
                  [ngClass]="col.pinned ? 'liji-pinned-' + col.pinned : ''"
                  [ngStyle]="table.getStickyStyle(col.id, showCheckboxes)"
                  
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
            <tr [style.height.px]="table.virtualPaddingTop"></tr>
            <tr *ngFor="let row of table.virtualRows" [class.liji-row-selected]="table.selectedIds.includes(row.id)" [attr.aria-selected]="table.selectedIds.includes(row.id)" role="row">
              
              <td *ngIf="showCheckboxes" class="liji-td-checkbox">
                <input type="checkbox" [checked]="table.selectedIds.includes(row.id)" (change)="table.toggleSelection($any(row).id)">
              </td>

              <td *ngFor="let col of (table.visibleColumns$ | async)"
                  [style.text-align]="col.align || 'left'"
                  [ngClass]="col.pinned ? 'liji-pinned-' + col.pinned : ''"
                  [ngStyle]="table.getStickyStyle(col.id, showCheckboxes)"
              >
                <ng-container *ngIf="cellTemplates[col.id] as tpl; else defaultCell">
                   <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row[col.id], row: row }"></ng-container>
                </ng-container>
                <ng-template #defaultCell>{{ row[col.id] }}</ng-template>
              </td>
            </tr>
            <tr [style.height.px]="table.virtualPaddingBottom"></tr>
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
      </div>
      <div *ngIf="contextMenu" (click)="contextMenu = null" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;"></div>

    </div>
  `,
  styles: []
})
export class UniversalTableComponent {
  @Input() table!: UniversalTable<any>;
  @Input() height = '100%';
  @Input() enableStriped = false;
  @Input() showCheckboxes = false;
  @Input() showFilters = false;
  @Input() density: 'standard' | 'compact' | 'comfortable' = 'standard';
  @Input() cellTemplates: Record<string, TemplateRef<any>> = {};

  contextMenu: { x: number, y: number, colId: string } | null = null;

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

    this.contextMenu = null;
  }
}