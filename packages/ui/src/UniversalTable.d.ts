import React from 'react';
import './styles.css';
interface UniversalTableProps {
    data?: any[];
    columns?: any[];
    tableInstance?: any;
    height?: string | number;
    enableStriped?: boolean;
    density?: 'standard' | 'compact' | 'comfortable';
    showFilters?: boolean;
    showCheckboxes?: boolean;
}
export declare const UniversalTable: React.FC<UniversalTableProps>;
export {};
