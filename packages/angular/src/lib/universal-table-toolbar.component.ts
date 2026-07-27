import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalTable } from './universal-table';

@Component({
  selector: 'liji-table-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="liji-toolbar">
      <h3>{{ title }}</h3>
      <div class="liji-toolbar-actions">
        <button class="liji-btn-page" (click)="table.downloadCSV()">⬇ Export</button>
        
        <button class="liji-btn-page" (click)="toggleDensity()">
          📐 {{ density === 'standard' ? 'Std' : density === 'compact' ? 'Cpt' : 'Com' }}
        </button>

        <button class="liji-btn-page" 
                [style.background]="showFilter ? '#eff8ff' : ''"
                (click)="toggleFilter.emit()">
          🔍 Filter
        </button>

        <div class="liji-divider-vertical" style="width:1px; height:20px; background:#eaecf0; margin:0 4px"></div>

        <button class="liji-btn-page" title="Fit each column to its content (may leave empty space)" (click)="table.autoResizeAllColumns()"><span>⟷</span> Fit</button>
        <button class="liji-btn-page" title="Clear manual widths and fill the container" (click)="table.resetColumnWidths()"><span>⤢</span> Fill</button>

        <div style="position: relative;">
          <button class="liji-btn-page" (click)="showColMenu = !showColMenu"><span>👁</span> Cols</button>
          
          <div *ngIf="showColMenu" class="liji-context-menu" style="top:35px; right:0" (click)="$event.stopPropagation()">
             <div class="liji-menu-header">Visible Columns</div>
             <div *ngFor="let col of table.allColumns" class="liji-menu-item">
               <input type="checkbox" [checked]="!col.hidden" (change)="table.toggleVisibility(col.id)">
               <span>{{ col.label }}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
    <div *ngIf="showColMenu" (click)="showColMenu = false" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;"></div>
  `,
  styles: [] // Global styles loaded elsewhere
})
export class UniversalTableToolbarComponent {
  @Input() table!: UniversalTable<any>;
  @Input() title = 'Table';
  @Input() density: 'standard' | 'compact' | 'comfortable' = 'standard';
  @Input() showFilter = false;

  @Output() densityChange = new EventEmitter<string>();
  @Output() toggleFilter = new EventEmitter<void>();

  showColMenu = false;

  toggleDensity() {
    const next = this.density === 'standard' ? 'compact' : this.density === 'compact' ? 'comfortable' : 'standard';
    this.densityChange.emit(next);
  }
}