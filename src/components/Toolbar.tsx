import React from 'react';

import type { ColorCode, ToolType, EyeSide, PathologyType } from '../utils/types';
import { MEDICAL_COLORS, TOOL_DESCRIPTIONS, PATHOLOGY_PRESETS } from '../utils/types';
import { Pen, Brush, Grid, RotateCw, Trash2, Undo, Redo, Eye, Download, Eraser, Box, Sparkles, HelpCircle, PaintBucket } from 'lucide-react';
// import './Toolbar.css'; // Removed for Tailwind migration

interface ToolbarProps {
    activeColor: ColorCode;
    setActiveColor: (c: ColorCode) => void;
    activeTool: ToolType;
    setActiveTool: (t: ToolType) => void;
    brushSize: number;
    setBrushSize: (s: number) => void;
    activePathology: PathologyType;
    setActivePathology: (p: PathologyType) => void;
    detachmentHeight: number;
    setDetachmentHeight: (h: number) => void;
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
    brushSize,
    setBrushSize,
    activePathology,
    setActivePathology,
    detachmentHeight,
    setDetachmentHeight,
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
        <div className="flex flex-col gap-5 p-5 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full lg:w-80 transition-all">
            <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Eye</h3>
                <div className="flex gap-2 bg-gray-100/50 p-1 rounded-xl">
                    <button
                        onClick={() => setEyeSide('OD')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${eyeSide === 'OD'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                        title="Right Eye (OD)"
                    >
                        <Eye size={16} /> OD
                    </button>
                    <button
                        onClick={() => setEyeSide('OS')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${eyeSide === 'OS'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                        title="Left Eye (OS)"
                    >
                        <Eye size={16} /> OS
                    </button>
                </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Tools</h3>
                <div className="flex gap-2">
                    {[
                        { id: 'pen', icon: Pen, title: 'Pen' },
                        { id: 'brush', icon: Brush, title: 'Brush' },
                        { id: 'pattern', icon: Grid, title: 'Pattern' },
                        { id: 'fill', icon: PaintBucket, title: 'Fill Shape' },
                        { id: 'eraser', icon: Eraser, title: 'Eraser' }
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as ToolType)}
                            className={`flex-1 p-3 rounded-xl flex items-center justify-center transition-all active:scale-95 ${activeTool === tool.id
                                ? 'bg-blue-50 text-blue-600 shadow-inner ring-1 ring-blue-100'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            title={tool.title}
                        >
                            <tool.icon size={20} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Brush Size</h3>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{brushSize}px</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Pathology</h3>
                <div className="relative">
                    <select
                        value={activePathology}
                        onChange={(e) => setActivePathology(e.target.value as PathologyType)}
                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors appearance-none"
                    >
                        {(Object.keys(PATHOLOGY_PRESETS) as PathologyType[]).map((type) => (
                            <option key={type} value={type}>
                                {PATHOLOGY_PRESETS[type].label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {activePathology === 'detachment' && (
                <div className="flex flex-col gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Height</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">{detachmentHeight}</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={detachmentHeight}
                        onChange={(e) => setDetachmentHeight(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            )}

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Colors</h3>
                    <button
                        onClick={onShowLegend}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50"
                        title="Color Legend & Tips"
                    >
                        <HelpCircle size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {(Object.keys(MEDICAL_COLORS) as ColorCode[]).map((color) => (
                        <button
                            key={color}
                            onClick={() => setActiveColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${activeColor === color
                                ? 'border-gray-900 scale-110 shadow-md'
                                : 'border-transparent hover:border-gray-200'
                                }`}
                            style={{ backgroundColor: MEDICAL_COLORS[color] }}
                            title={TOOL_DESCRIPTIONS[color]}
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-500 min-h-[1.5rem] px-1 font-medium">
                    {TOOL_DESCRIPTIONS[activeColor]}
                </p>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={toggleInverted}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all ${isInverted
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <RotateCw size={16} className={`transition-transform duration-500 ${isInverted ? 'rotate-180' : ''}`} />
                        {isInverted ? 'Inverted' : 'Standard'}
                    </button>
                    <button
                        onClick={on3DView}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                    >
                        <Box size={16} /> 3D View
                    </button>
                </div>
                <button
                    onClick={onAnalyze}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Sparkles size={16} /> Analyze Chart
                </button>
            </div>

            <div className="flex gap-2 mt-2">
                <button onClick={onUndo} className="flex-1 p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center" title="Undo">
                    <Undo size={18} />
                </button>
                <button onClick={onRedo} className="flex-1 p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center" title="Redo">
                    <Redo size={18} />
                </button>
                <button onClick={onClear} className="flex-1 p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center" title="Clear All">
                    <Trash2 size={18} />
                </button>
            </div>

            <button onClick={onDownload} className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all mt-2">
                <Download size={16} /> Download Image
            </button>
        </div>
    );
};
