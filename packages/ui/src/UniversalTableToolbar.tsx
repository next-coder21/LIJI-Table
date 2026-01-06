import React, { useState, useEffect } from 'react';

interface ToolbarProps {
  table: any; // The hook result
  title?: string;
  // Feature flags
  onDensityChange?: (density: 'standard' | 'compact' | 'comfortable') => void;
  density?: 'standard' | 'compact' | 'comfortable';
  onToggleFilter?: () => void;
  showFilter?: boolean;
}

export const UniversalTableToolbar: React.FC<ToolbarProps> = ({
  table,
  title = "Table",
  onDensityChange,
  density = 'standard',
  onToggleFilter,
  showFilter = false
}) => {
  const { downloadCSV, autoResizeAllColumns, allColumns, toggleVisibility } = table;
  
  // Local state for the "Cols" dropdown menu
  const [showColMenu, setShowColMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const close = () => setShowColMenu(false);
    if (showColMenu) window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showColMenu]);

  return (
    <div className="liji-toolbar">
      <h3>{title}</h3>
      <div className="liji-toolbar-actions">
        {/* --- GROUP 1: Data Actions --- */}
        <button onClick={() => downloadCSV && downloadCSV('export.csv')} className="liji-btn-page" title="Export CSV">
           ⬇ Export
        </button>
        
        {onDensityChange && (
          <button 
            onClick={() => onDensityChange(density === 'standard' ? 'compact' : density === 'compact' ? 'comfortable' : 'standard')} 
            className="liji-btn-page"
            title="Toggle Density"
          >
             📐 {density === 'standard' ? 'Std' : density === 'compact' ? 'Cpt' : 'Com'}
          </button>
        )}

        {onToggleFilter && (
          <button 
            onClick={onToggleFilter} 
            className="liji-btn-page" 
            style={{ background: showFilter ? '#eff8ff' : '', borderColor: showFilter ? '#84CAFF' : '' }}
            title="Toggle Filters"
          >
             🔍 Filter
          </button>
        )}
        
        <div className="liji-divider-vertical" style={{ width: 1, height: 20, background: '#eaecf0', margin: '0 4px' }} />

        {/* --- GROUP 2: Layout Actions (Moved from Table) --- */}
        
        {/* 1. Fit / Autosize */}
        <button onClick={() => autoResizeAllColumns()} className="liji-btn-page" title="Autosize Columns">
            <span>⟷</span> Fit
        </button>
        
        {/* 2. Column Visibility Menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={(e) => { e.stopPropagation(); setShowColMenu(!showColMenu); }} className="liji-btn-page" title="Show/Hide Columns">
            <span>👁</span> Cols
          </button>
          
          {showColMenu && (
            <div className="liji-context-menu" onClick={(e) => e.stopPropagation()} style={{ top: 35, right: 0 }}>
              <div className="liji-menu-header">Visible Columns</div>
              {allColumns.map((col: any) => (
                <div key={col.id} className="liji-menu-item">
                  <input type="checkbox" checked={!col.hidden} onChange={() => toggleVisibility(col.id)} />
                  <span>{col.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};