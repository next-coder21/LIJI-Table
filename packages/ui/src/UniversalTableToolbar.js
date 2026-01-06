"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalTableToolbar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const UniversalTableToolbar = ({ table, title = "Table", onDensityChange, density = 'standard', onToggleFilter, showFilter = false }) => {
    const { downloadCSV, autoResizeAllColumns, allColumns, toggleVisibility } = table;
    // Local state for the "Cols" dropdown menu
    const [showColMenu, setShowColMenu] = (0, react_1.useState)(false);
    // Close menu when clicking outside
    (0, react_1.useEffect)(() => {
        const close = () => setShowColMenu(false);
        if (showColMenu)
            window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [showColMenu]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "liji-toolbar", children: [(0, jsx_runtime_1.jsx)("h3", { children: title }), (0, jsx_runtime_1.jsxs)("div", { className: "liji-toolbar-actions", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => downloadCSV && downloadCSV('export.csv'), className: "liji-btn-page", title: "Export CSV", children: "\u2B07 Export" }), onDensityChange && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => onDensityChange(density === 'standard' ? 'compact' : density === 'compact' ? 'comfortable' : 'standard'), className: "liji-btn-page", title: "Toggle Density", children: ["\uD83D\uDCD0 ", density === 'standard' ? 'Std' : density === 'compact' ? 'Cpt' : 'Com'] })), onToggleFilter && ((0, jsx_runtime_1.jsx)("button", { onClick: onToggleFilter, className: "liji-btn-page", style: { background: showFilter ? '#eff8ff' : '', borderColor: showFilter ? '#84CAFF' : '' }, title: "Toggle Filters", children: "\uD83D\uDD0D Filter" })), (0, jsx_runtime_1.jsx)("div", { className: "liji-divider-vertical", style: { width: 1, height: 20, background: '#eaecf0', margin: '0 4px' } }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => autoResizeAllColumns(), className: "liji-btn-page", title: "Autosize Columns", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u27F7" }), " Fit"] }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative' }, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: (e) => { e.stopPropagation(); setShowColMenu(!showColMenu); }, className: "liji-btn-page", title: "Show/Hide Columns", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDC41" }), " Cols"] }), showColMenu && ((0, jsx_runtime_1.jsxs)("div", { className: "liji-context-menu", onClick: (e) => e.stopPropagation(), style: { top: 35, right: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "liji-menu-header", children: "Visible Columns" }), allColumns.map((col) => ((0, jsx_runtime_1.jsxs)("div", { className: "liji-menu-item", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !col.hidden, onChange: () => toggleVisibility(col.id) }), (0, jsx_runtime_1.jsx)("span", { children: col.label })] }, col.id)))] }))] })] })] }));
};
exports.UniversalTableToolbar = UniversalTableToolbar;
