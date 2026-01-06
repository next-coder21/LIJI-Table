export type SortDirection = 'asc' | 'desc' | null;
export type ColumnAlign = 'left' | 'center' | 'right';
export interface TableColumn {
    id: string;
    label: string;
    width?: number;
    sortable?: boolean;
    hidden?: boolean;
    align?: ColumnAlign;
    pinned?: 'left' | 'right' | null;
}
export interface TableState {
    pageIndex: number;
    pageSize: number;
    searchQuery: string;
    sortColumn: string | null;
    sortDirection: SortDirection;
    columnWidths: {
        [key: string]: number;
    };
    columns: TableColumn[];
    selectedIds: number[];
    filters: {
        [key: string]: string;
    };
}
type Listener = (state: TableState) => void;
export declare class UniversalTableCore<T extends {
    id: any;
}> {
    private data;
    private listeners;
    private state;
    constructor(data: T[], columns?: TableColumn[]);
    setData(data: T[]): void;
    private naturalCompare;
    setColumnAlign(colId: string, align: ColumnAlign): void;
    toggleVisibility(colId: string): void;
    toggleSelection(id: number): void;
    toggleAllPage(): void;
    toggleSort(colId: string): void;
    setSortDirection(colId: string, direction: SortDirection): void;
    reorderColumn(fromIndex: number, toIndex: number): void;
    setColumnWidth(column: string, width: number): void;
    setSearch(query: string): void;
    setPage(index: number): void;
    setPageSize(size: number): void;
    setSort(column: string): void;
    getRows(): T[];
    getAllFilteredRows(): T[];
    setFilter(colId: string, value: string): void;
    getCSVContent(): string;
    pinColumn(colId: string, position: 'left' | 'right' | null): void;
    autoResizeAllColumns(font?: string, padding?: number): void;
    private getCanvasContext;
    getState(): {
        pageIndex: number;
        pageSize: number;
        searchQuery: string;
        sortColumn: string | null;
        sortDirection: SortDirection;
        columnWidths: {
            [key: string]: number;
        };
        columns: TableColumn[];
        selectedIds: number[];
        filters: {
            [key: string]: string;
        };
    };
    getTotalPages(): number;
    subscribe(listener: Listener): () => void;
    private notify;
}
export {};
