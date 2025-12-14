import React from 'react';
import type { ToolbarProps } from './ToolbarConstants';
import { DesktopToolbar } from './desktop/DesktopToolbar';
import { MobileToolbar } from './mobile/MobileToolbar';

// Re-export ToolbarProps for potential consumers (though explicit import from constants is preferred)
export type { ToolbarProps } from './ToolbarConstants';

// =================================================================
// Toolbar Export
// =================================================================
export const Toolbar: React.FC<ToolbarProps> = (props) => {
    if (props.variant === 'mobile') {
        return <MobileToolbar {...props} />;
    }
    return <DesktopToolbar {...props} />;
};
