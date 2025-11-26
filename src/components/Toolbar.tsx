import React from 'react';

import type { ColorCode, ToolType, EyeSide } from '../utils/types';
import { MEDICAL_COLORS, TOOL_DESCRIPTIONS } from '../utils/types';
import { Pen, Brush, Grid, RotateCw, Trash2, Undo, Redo, Eye, Download, Eraser, Box, Sparkles, HelpCircle } from 'lucide-react';
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
    onRedo: () => void;
    onClear: () => void;
    onDownload: () => void;
    on3DView: () => void;
    onAnalyze: () => void;
    onShowLegend: () => void;
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
    onRedo,
    onClear,
    onDownload,
    on3DView,
    onAnalyze,
    onShowLegend
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
                    <button
                        onClick={() => setActiveTool('eraser')}
                        className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
                        title="Eraser"
                    >
                        <Eraser size={20} />
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
                <div className="flex justify-between items-center mt-2">
                    <p className="color-desc" style={{ marginBottom: 0 }}>
                        {TOOL_DESCRIPTIONS[activeColor]}
                    </p>
                    <button
                        onClick={onShowLegend}
                        className="help-btn"
                        title="Color Legend & Tips"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                    >
                        <HelpCircle size={18} />
                    </button>
                </div>
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
                <button
                    onClick={on3DView}
                    className="view-btn"
                    style={{ marginTop: '0.5rem' }}
                >
                    <Box size={18} /> 3D View
                </button>
            </div>

            <div className="toolbar-section">
                <h3 className="toolbar-title">AI</h3>
                <button
                    onClick={onAnalyze}
                    className="view-btn ai-btn"
                    style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', border: 'none' }}
                >
                    <Sparkles size={18} /> Analyze Chart
                </button>
            </div>

            <div className="action-buttons">
                <button onClick={onUndo} className="action-btn undo-btn" title="Undo">
                    <Undo size={16} />
                </button>
                <button onClick={onRedo} className="action-btn undo-btn" title="Redo">
                    <Redo size={16} />
                </button>
                <button onClick={onClear} className="action-btn clear-btn" title="Clear All">
                    <Trash2 size={16} />
                </button>
            </div>

            <button onClick={onDownload} className="view-btn" style={{ marginTop: '0.5rem' }}>
                <Download size={18} /> Download Image
            </button>
        </div>
    );
};
