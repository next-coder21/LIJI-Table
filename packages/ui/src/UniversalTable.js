"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalTable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = require("@liji-table/react");
const icons_1 = require("./icons");
require("./styles.css");
const EMPTY_DATA = [];
const EMPTY_COLUMNS = [];
const UniversalTable = ({ data = EMPTY_DATA, columns = EMPTY_COLUMNS, tableInstance, height = "100%", enableStriped = false, density = 'standard', showFilters = false, showCheckboxes = false // ✅ Default to false (Configurable)
 }) => {
    const internalHook = (0, react_2.useUniversalTable)(data, columns);
    const table = tableInstance || internalHook;
    const { rows, state, visibleColumns, totalPages, selectedIds, toggleSelection, toggleAllPage, isAllPageSelected, getHeaderProps, getResizerProps, setSortDirection, pinColumn, setColumnAlign, prevPage, nextPage, setPageSize, setFilter } = table;
    const [contextMenu, setContextMenu] = (0, react_1.useState)(null);
    // --- Sticky Logic (Updated for Checkbox) ---
    const stickyOffsets = (0, react_1.useMemo)(() => {
        const offsets = {};
        // ✅ FIX: If checkboxes are shown, start left offset at 40px. If hidden, start at 0.
        let currentLeft = showCheckboxes ? 40 : 0;
        let currentRight = 0;
        visibleColumns.forEach((c) => {
            if (c.pinned === 'left') {
                offsets[c.id] = { ...offsets[c.id], left: currentLeft };
                currentLeft += state.columnWidths[c.id] || c.width || 150;
            }
        });
        [...visibleColumns].reverse().forEach((c) => {
            if (c.pinned === 'right') {
                offsets[c.id] = { ...offsets[c.id], right: currentRight };
                currentRight += state.columnWidths[c.id] || c.width || 150;
            }
        });
        return offsets;
    }, [visibleColumns, state.columnWidths, showCheckboxes]); // ✅ Depend on showCheckboxes
    const getStickyStyle = (col) => {
        if (!col.pinned)
            return {};
        return {
            position: 'sticky',
            left: stickyOffsets[col.id]?.left,
            right: stickyOffsets[col.id]?.right,
        };
    };
    (0, react_1.useEffect)(() => {
        const close = () => setContextMenu(null);
        if (contextMenu)
            window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [contextMenu]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "liji-grid-wrapper", style: { height }, children: [(0, jsx_runtime_1.jsx)("div", { className: "liji-table-scroll", children: (0, jsx_runtime_1.jsxs)("table", { className: `liji-table liji-${density} ${enableStriped ? 'liji-striped' : ''}`, children: [(0, jsx_runtime_1.jsxs)("thead", { children: [(0, jsx_runtime_1.jsxs)("tr", { children: [showCheckboxes && ((0, jsx_runtime_1.jsx)("th", { className: "liji-th-checkbox", children: (0, jsx_runtime_1.jsx)("input", { type: "checkbox", onChange: toggleAllPage, checked: isAllPageSelected() }) })), visibleColumns.map((c, idx) => {
                                            const col = c;
                                            return ((0, jsx_runtime_1.jsxs)("th", { className: col.pinned ? `liji-pinned-${col.pinned}` : '', style: { width: state.columnWidths[col.id] || col.width, ...getStickyStyle(col) }, ...getHeaderProps(idx, col.id), onContextMenu: (e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, colId: col.id, sortable: col.sortable !== false, pinned: col.pinned }); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "liji-th-content", style: { justifyContent: col.align || 'flex-start' }, children: [col.pinned && (0, jsx_runtime_1.jsx)("span", { className: "liji-pin-icon", children: "\uD83D\uDCCC" }), col.label, state.sortColumn === col.id && (0, jsx_runtime_1.jsx)("span", { className: "liji-sort-icon", dangerouslySetInnerHTML: { __html: state.sortDirection === 'asc' ? icons_1.ICONS.sortAsc : icons_1.ICONS.sortDesc } })] }), (0, jsx_runtime_1.jsx)("div", { className: "liji-resizer", ...getResizerProps(col.id) })] }, col.id));
                                        })] }), showFilters && ((0, jsx_runtime_1.jsxs)("tr", { className: "liji-filter-row", children: [showCheckboxes && (0, jsx_runtime_1.jsx)("th", { className: "liji-th-checkbox", style: { top: 45 } }), visibleColumns.map((c) => {
                                            const col = c;
                                            return ((0, jsx_runtime_1.jsx)("th", { className: col.pinned ? `liji-pinned-${col.pinned}` : '', style: { ...getStickyStyle(col), top: 45, zIndex: col.pinned ? 21 : 9, padding: '4px' }, children: (0, jsx_runtime_1.jsx)("input", { className: "liji-filter-input", placeholder: `Filter...`, onChange: (e) => setFilter && setFilter(col.id, e.target.value) }) }, `${col.id}-filter`));
                                        })] }))] }), (0, jsx_runtime_1.jsx)("tbody", { children: rows.map((row) => {
                                const isSelected = selectedIds.includes(row.id);
                                return ((0, jsx_runtime_1.jsxs)("tr", { className: isSelected ? 'liji-row-selected' : '', children: [showCheckboxes && ((0, jsx_runtime_1.jsx)("td", { className: "liji-td-checkbox", children: (0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: isSelected, onChange: () => toggleSelection(row.id) }) })), visibleColumns.map((c) => {
                                            const col = c;
                                            return ((0, jsx_runtime_1.jsx)("td", { className: col.pinned ? `liji-pinned-${col.pinned}` : '', style: { textAlign: col.align || 'left', ...getStickyStyle(col) }, children: col.render ? col.render(row[col.id], row) : row[col.id] }, col.id));
                                        })] }, row.id));
                            }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "liji-footer", children: [(0, jsx_runtime_1.jsxs)("div", { className: "liji-footer-left", children: ["Rows: ", (0, jsx_runtime_1.jsxs)("select", { value: state.pageSize, onChange: (e) => setPageSize(+e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: 10, children: "10" }), (0, jsx_runtime_1.jsx)("option", { value: 20, children: "20" }), (0, jsx_runtime_1.jsx)("option", { value: 50, children: "50" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "liji-footer-right", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Page ", state.pageIndex + 1, " of ", totalPages] }), (0, jsx_runtime_1.jsx)("button", { className: "liji-btn-page", onClick: prevPage, disabled: state.pageIndex === 0, children: "Prev" }), (0, jsx_runtime_1.jsx)("button", { className: "liji-btn-page", onClick: nextPage, disabled: state.pageIndex >= totalPages - 1, children: "Next" })] })] }), contextMenu && ((0, jsx_runtime_1.jsxs)("div", { className: "liji-context-menu", style: { top: contextMenu.y, left: contextMenu.x }, children: [(0, jsx_runtime_1.jsx)("div", { className: "liji-menu-header", children: "Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "liji-menu-item", onClick: () => { table.autoResizeAllColumns(); setContextMenu(null); }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u27F7" }), " Autosize All"] }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-divider" }), contextMenu.sortable && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { setSortDirection(contextMenu.colId, 'asc'); setContextMenu(null); }, children: "Sort Asc" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { setSortDirection(contextMenu.colId, 'desc'); setContextMenu(null); }, children: "Sort Desc" })] }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-divider" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { pinColumn(contextMenu.colId, 'left'); setContextMenu(null); }, children: "Pin Left" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { pinColumn(contextMenu.colId, 'right'); setContextMenu(null); }, children: "Pin Right" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { pinColumn(contextMenu.colId, null); setContextMenu(null); }, children: "Unpin" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-divider" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { setColumnAlign(contextMenu.colId, 'left'); setContextMenu(null); }, children: "Align Left" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { setColumnAlign(contextMenu.colId, 'center'); setContextMenu(null); }, children: "Align Center" }), (0, jsx_runtime_1.jsx)("div", { className: "liji-menu-item", onClick: () => { setColumnAlign(contextMenu.colId, 'right'); setContextMenu(null); }, children: "Align Right" })] }))] }));
};
exports.UniversalTable = UniversalTable;
