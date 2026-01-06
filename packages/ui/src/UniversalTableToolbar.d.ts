import React from 'react';
interface ToolbarProps {
    table: any;
    title?: string;
    onDensityChange?: (density: 'standard' | 'compact' | 'comfortable') => void;
    density?: 'standard' | 'compact' | 'comfortable';
    onToggleFilter?: () => void;
    showFilter?: boolean;
}
export declare const UniversalTableToolbar: React.FC<ToolbarProps>;
export {};
