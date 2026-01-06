"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalTableCore = void 0;
// Generic T must have an 'id' property
class UniversalTableCore {
    data;
    listeners = new Set();
    state = {
        pageIndex: 0,
        pageSize: 10,
        searchQuery: '',
        filters: {},
        sortColumn: null,
        sortDirection: null,
        columnWidths: {},
        columns: [],
        selectedIds: []
    };
    constructor(data, columns = []) {
        this.data = data;
        this.state.columns = columns;
    }
    // --- MISSING METHOD FIXED: setData ---
    setData(data) {
        this.data = data;
        // Optional: If data changes, you might want to reset page index or selection
        // this.state.selectedIds = []; 
        this.notify();
    }
    // --- HELPER: Natural Sort Logic ---
    naturalCompare(a, b) {
        const strA = a === null || a === undefined ? '' : String(a);
        const strB = b === null || b === undefined ? '' : String(b);
        return strA.localeCompare(strB, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    }
    // --- 1. CONFIGURATION ACTIONS ---
    setColumnAlign(colId, align) {
        const col = this.state.columns.find(c => c.id === colId);
        if (col) {
            col.align = align;
            this.notify();
        }
    }
    toggleVisibility(colId) {
        const col = this.state.columns.find(c => c.id === colId);
        if (col) {
            col.hidden = !col.hidden;
            this.notify();
        }
    }
    // --- 2. SELECTION ACTIONS ---
    toggleSelection(id) {
        const index = this.state.selectedIds.indexOf(id);
        if (index === -1) {
            this.state.selectedIds = [...this.state.selectedIds, id];
        }
        else {
            this.state.selectedIds = this.state.selectedIds.filter(x => x !== id);
        }
        this.notify();
    }
    toggleAllPage() {
        const currentRows = this.getRows();
        const currentIds = currentRows.map(r => r.id);
        const allSelected = currentIds.every(id => this.state.selectedIds.includes(id));
        if (allSelected) {
            // Unselect ONLY the current page's rows
            this.state.selectedIds = this.state.selectedIds.filter(id => !currentIds.includes(id));
        }
        else {
            // Select all on current page (merge unique)
            const newIds = new Set([...this.state.selectedIds, ...currentIds]);
            this.state.selectedIds = Array.from(newIds);
        }
        this.notify();
    }
    // --- 3. SORTING & REORDERING ---
    // Method 1: Cycle through sorts (Null -> Asc -> Desc)
    toggleSort(colId) {
        const col = this.state.columns.find(c => c.id === colId);
        if (col && col.sortable === false)
            return;
        const { sortColumn, sortDirection } = this.state;
        if (sortColumn !== colId) {
            this.state.sortColumn = colId;
            this.state.sortDirection = 'asc';
        }
        else if (sortDirection === 'asc') {
            this.state.sortDirection = 'desc';
        }
        else {
            this.state.sortColumn = null;
            this.state.sortDirection = null;
        }
        this.notify();
    }
    // Method 2: Explicitly set sort (Used by Context Menu)
    setSortDirection(colId, direction) {
        const col = this.state.columns.find(c => c.id === colId);
        if (col && col.sortable === false)
            return;
        this.state.sortColumn = colId;
        this.state.sortDirection = direction;
        this.notify();
    }
    // --- RENAMED: moveColumn -> reorderColumn (Matches React Hook) ---
    reorderColumn(fromIndex, toIndex) {
        if (fromIndex === toIndex)
            return;
        const newCols = [...this.state.columns];
        const [movedCol] = newCols.splice(fromIndex, 1);
        newCols.splice(toIndex, 0, movedCol);
        this.state.columns = newCols;
        this.notify();
    }
    // --- 4. STANDARD ACTIONS ---
    setColumnWidth(column, width) {
        this.state.columnWidths = { ...this.state.columnWidths, [column]: width };
        this.notify();
    }
    setSearch(query) { this.state.searchQuery = query; this.state.pageIndex = 0; this.notify(); }
    setPage(index) { this.state.pageIndex = index; this.notify(); }
    setPageSize(size) { this.state.pageSize = size; this.state.pageIndex = 0; this.notify(); }
    setSort(column) { this.toggleSort(column); } // Legacy support
    // --- GETTERS & PROCESSING ---
    getRows() {
        let result = [...this.data];
        // 1. Global Search
        if (this.state.searchQuery) {
            const lowerQuery = this.state.searchQuery.toLowerCase();
            result = result.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(lowerQuery)));
        }
        // 2. NEW: Column Filters
        const activeFilters = Object.entries(this.state.filters);
        if (activeFilters.length > 0) {
            result = result.filter(row => {
                return activeFilters.every(([colId, filterVal]) => {
                    const rowVal = String(row[colId] || '').toLowerCase();
                    return rowVal.includes(filterVal.toLowerCase());
                });
            });
        }
        // 3. Sort (Natural Sort)
        if (this.state.sortColumn && this.state.sortDirection) {
            const { sortColumn, sortDirection } = this.state;
            result.sort((a, b) => {
                const valA = a[sortColumn];
                const valB = b[sortColumn];
                const comparison = this.naturalCompare(valA, valB);
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }
        // 4. Paginate
        const start = this.state.pageIndex * this.state.pageSize;
        return result.slice(start, start + this.state.pageSize);
    }
    getAllFilteredRows() {
        let result = [...this.data];
        if (this.state.searchQuery) {
            const lowerQuery = this.state.searchQuery.toLowerCase();
            result = result.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(lowerQuery)));
        }
        // Sort (UPDATED for Natural Sort)
        if (this.state.sortColumn && this.state.sortDirection) {
            const { sortColumn, sortDirection } = this.state;
            result.sort((a, b) => {
                const valA = a[sortColumn];
                const valB = b[sortColumn];
                const comparison = this.naturalCompare(valA, valB);
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }
        return result;
    }
    // --- NEW FEATURE: Column Filter ---
    setFilter(colId, value) {
        if (!value) {
            delete this.state.filters[colId];
        }
        else {
            this.state.filters[colId] = value;
        }
        this.state.pageIndex = 0; // Reset to page 1 on filter
        this.notify();
    }
    // --- NEW FEATURE: Export to CSV String ---
    getCSVContent() {
        const rows = this.getAllFilteredRows();
        if (rows.length === 0)
            return '';
        // Get visible columns only
        const visibleCols = this.state.columns.filter(c => !c.hidden);
        // 1. Headers
        const headers = visibleCols.map(c => `"${c.label}"`).join(',');
        // 2. Rows
        const csvRows = rows.map(row => {
            return visibleCols.map(col => {
                const val = row[col.id];
                // Handle strings with commas or quotes
                const safeVal = val === null || val === undefined ? '' : String(val).replace(/"/g, '""');
                return `"${safeVal}"`;
            }).join(',');
        });
        return [headers, ...csvRows].join('\n');
    }
    // =========================================================
    // NEW FEATURE: COLUMN PINNING
    // =========================================================
    pinColumn(colId, position) {
        const col = this.state.columns.find(c => c.id === colId);
        if (!col)
            return;
        // 1. Update the column's pinned status
        col.pinned = position;
        // 2. Reorder columns logic: Left Pinned -> Unpinned -> Right Pinned
        this.state.columns.sort((a, b) => {
            const score = (c) => {
                if (c.pinned === 'left')
                    return 0;
                if (c.pinned === 'right')
                    return 2;
                return 1; // Unpinned
            };
            return score(a) - score(b);
        });
        this.notify();
    }
    // =========================================================
    // NEW FEATURE: AUTO RESIZE (SMART MEASUREMENT)
    // =========================================================
    autoResizeAllColumns(font = '14px sans-serif', padding = 24) {
        const ctx = this.getCanvasContext(font);
        const newWidths = {};
        this.state.columns.forEach(col => {
            if (col.hidden)
                return;
            let maxWidth = 0;
            maxWidth = Math.max(maxWidth, ctx.measureText(col.label).width);
            this.data.forEach(row => {
                const val = row[col.id];
                const strVal = val === null || val === undefined ? '' : String(val);
                const width = ctx.measureText(strVal).width;
                if (width > maxWidth)
                    maxWidth = width;
            });
            newWidths[col.id] = Math.min(Math.ceil(maxWidth + padding), 500);
        });
        this.state.columnWidths = { ...this.state.columnWidths, ...newWidths };
        this.notify();
    }
    getCanvasContext(font) {
        if (typeof document === 'undefined') {
            return {
                measureText: (text) => ({ width: text.length * 8 })
            };
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx)
            ctx.font = font;
        return ctx || {};
    }
    getState() { return { ...this.state }; }
    getTotalPages() { return Math.ceil(this.data.length / this.state.pageSize); }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    notify() {
        this.listeners.forEach(listener => listener({ ...this.state }));
    }
}
exports.UniversalTableCore = UniversalTableCore;
