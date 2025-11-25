import React from 'react';

import type { ColorCode, ToolType, EyeSide } from '../utils/types';
import { MEDICAL_COLORS, TOOL_DESCRIPTIONS } from '../utils/types';
import { Pen, Brush, Grid, RotateCw, Trash2, Undo, Eye, Download } from 'lucide-react';
import './Toolbar.css';

interface ToolbarProps {
    activeColor: ColorCode;
    setActiveColor: (c: ColorCode) => void;
    activeTool: ToolType;
    setActiveTool: (t: ToolType) => void;
    isInverted: boolean;
    toggleInverted: () => void;
    eyeSide: EyeSide;
    setEyeSide: (s: EyeSide) => void;
    onUndo: () => void;
    onClear: () => void;
    onDownload: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    activeColor,
    setActiveColor,
    activeTool,
    setActiveTool,
    isInverted,
    toggleInverted,
    eyeSide,
    setEyeSide,
    onUndo,
    onClear,
    onDownload
}) => {
    return (
        <div className="toolbar">
            <div className="toolbar-section">
                <h3 className="toolbar-title">Eye</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEyeSide('OD')}
                        className={`view-btn ${eyeSide === 'OD' ? 'active' : ''}`}
                        title="Right Eye (OD)"
                    >
                        <Eye size={18} /> OD (Right)
                    </button>
                    <button
                        onClick={() => setEyeSide('OS')}
                        className={`view-btn ${eyeSide === 'OS' ? 'active' : ''}`}
                        title="Left Eye (OS)"
                    >
                        <Eye size={18} /> OS (Left)
                    </button>
                </div>
            </div>

            <div className="divider"></div>

            <div className="toolbar-section">
                <h3 className="toolbar-title">Tools</h3>
                <div className="tool-buttons">
                    <button
                        onClick={() => setActiveTool('pen')}
                        className={`tool-btn ${activeTool === 'pen' ? 'active' : ''}`}
                        title="Pen (Lines)"
                    >
                        <Pen size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTool('brush')}
                        className={`tool-btn ${activeTool === 'brush' ? 'active' : ''}`}
                        title="Brush (Fill)"
                    >
                        <Brush size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTool('pattern')}
                        className={`tool-btn ${activeTool === 'pattern' ? 'active' : ''}`}
                        title="Pattern"
                    >
                        <Grid size={20} />
                    </button>
                </div>
            </div>

            <div className="toolbar-section">
                <h3 className="toolbar-title">Colors</h3>
                <div className="color-grid">
                    {(Object.keys(MEDICAL_COLORS) as ColorCode[]).map((color) => (
                        <button
                            key={color}
                            onClick={() => setActiveColor(color)}
                            className={`color-btn ${activeColor === color ? 'active' : ''}`}
                            style={{ backgroundColor: MEDICAL_COLORS[color] }}
                            title={TOOL_DESCRIPTIONS[color]}
                        />
                    ))}
                </div>
                <p className="color-desc">
                    {TOOL_DESCRIPTIONS[activeColor]}
                </p>
            </div>

            <div className="divider"></div>

            <div className="toolbar-section">
                <h3 className="toolbar-title">View</h3>
                <button
                    onClick={toggleInverted}
                    className={`view-btn ${isInverted ? 'active' : ''}`}
                >
                    <RotateCw size={18} className={`rotate-icon ${isInverted ? 'rotated' : ''}`} />
                    {isInverted ? 'Inverted View' : 'Standard View'}
                </button>
            </div>

            <div className="action-buttons">
                <button onClick={onUndo} className="action-btn undo-btn">
                    <Undo size={16} /> Undo
                </button>
                <button onClick={onClear} className="action-btn clear-btn">
                    <Trash2 size={16} /> Clear
                </button>
            </div>

            <button onClick={onDownload} className="view-btn" style={{ marginTop: '0.5rem' }}>
                <Download size={18} /> Download Image
            </button>
        </div>
    );
};
