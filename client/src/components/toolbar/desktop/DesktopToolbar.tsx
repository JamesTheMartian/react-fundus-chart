import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Undo, Redo, Trash2, HelpCircle, RotateCw, Box, Sparkles } from 'lucide-react';
import { MEDICAL_COLORS, TOOL_DESCRIPTIONS, PATHOLOGY_PRESETS, type PathologyType, type ColorCode, type ToolType } from '../../../utils/types';
import { type ToolbarProps, TOOLS } from '../ToolbarConstants';

// =================================================================
// Section Header Component
// =================================================================
const SectionHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1 ${className}`}>
        {children}
    </h3>
);

export const DesktopToolbar: React.FC<ToolbarProps> = ({
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
    onShowLegend,
    vesselOpacity,
    setVesselOpacity,
    isProMode = false,
}) => {
    return (
        <div className="flex flex-col gap-5 p-4 w-full transition-all h-full">
            {/* Eye Selection */}
            <div className="flex flex-col gap-3" data-tutorial="eye-selector">
                <SectionHeader>Eye Selection</SectionHeader>
                <div className="flex gap-2 bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-xl">
                    <button
                        onClick={() => setEyeSide('OD')}
                        aria-label="Select Right Eye (OD)"
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${eyeSide === 'OD'
                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60'
                            }`}
                        title="Right Eye (OD)"
                    >
                        <Eye size={18} className={eyeSide === 'OD' ? 'stroke-[2.5px]' : ''} /> OD
                    </button>
                    <button
                        onClick={() => setEyeSide('OS')}
                        aria-label="Select Left Eye (OS)"
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${eyeSide === 'OS'
                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60'
                            }`}
                        title="Left Eye (OS)"
                    >
                        <Eye size={18} className={eyeSide === 'OS' ? 'stroke-[2.5px]' : ''} /> OS
                    </button>
                </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            {/* Drawing Tools */}
            <div className="flex flex-col gap-3" data-tutorial="tool-selector">
                <div className="flex items-center justify-between">
                    <SectionHeader>Drawing Tools</SectionHeader>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {TOOLS.map((tool) => (
                        <motion.button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as ToolType)}
                            aria-label={`Select ${tool.title} Tool (${tool.shortcut})`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative p-3.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${activeTool === tool.id
                                ? 'text-white shadow-md shadow-primary-500/20'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                                }`}
                            title={`${tool.title} (${tool.shortcut})`}
                        >
                            {activeTool === tool.id && (
                                <motion.div
                                    layoutId="activeToolDesktop"
                                    className="absolute inset-0 bg-primary-600 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">
                                <tool.icon size={20} strokeWidth={activeTool === tool.id ? 2.5 : 2} />
                            </span>
                            {/* Keyboard Shortcut Hint */}
                            <span className={`relative z-10 text-[10px] font-medium ${activeTool === tool.id ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                                {tool.shortcut}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Stroke Width */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <SectionHeader>Stroke Width</SectionHeader>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md min-w-[3rem] text-center">{brushSize}px</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    aria-label="Adjust Brush Size"
                    className="w-full"
                />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            {/* Pathology Type */}
            <div className="flex flex-col gap-3">
                <SectionHeader>Pathology Type</SectionHeader>
                <div className="relative group">
                    <select
                        value={activePathology}
                        onChange={(e) => setActivePathology(e.target.value as PathologyType)}
                        aria-label="Select Pathology Type"
                        className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all appearance-none outline-none"
                    >
                        {(Object.keys(PATHOLOGY_PRESETS) as PathologyType[]).map((type) => (
                            <option key={type} value={type}>
                                {PATHOLOGY_PRESETS[type].label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Detachment Height (Pro Mode Only) */}
            {isProMode && activePathology === 'detachment' && (
                <div className="flex flex-col gap-3 bg-primary-50/50 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-100/50 dark:border-primary-500/20">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary-500 dark:text-primary-400">Detachment Height</h3>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/20 px-2 py-1 rounded-md">{detachmentHeight}</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={detachmentHeight}
                        onChange={(e) => setDetachmentHeight(Number(e.target.value))}
                        aria-label="Adjust Detachment Height"
                        className="w-full"
                    />
                </div>
            )}

            {/* Vessel Map (Pro Mode Only) */}
            {isProMode && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <SectionHeader>Vessel Map</SectionHeader>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{Math.round(vesselOpacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={vesselOpacity}
                        onChange={(e) => setVesselOpacity(Number(e.target.value))}
                        aria-label="Adjust Vessel Map Opacity"
                        className="w-full"
                    />
                </div>
            )}

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            {/* Color Palette */}
            <div className="flex flex-col gap-3" data-tutorial="color-selector">
                <div className="flex justify-between items-center">
                    <SectionHeader>Color Palette</SectionHeader>
                    <button
                        onClick={onShowLegend}
                        className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-500/10"
                        title="Color Legend & Tips"
                        aria-label="Show Color Legend"
                    >
                        <HelpCircle size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-6 gap-2.5">
                    {(Object.keys(MEDICAL_COLORS) as ColorCode[]).map((color) => (
                        <button
                            key={color}
                            onClick={() => setActiveColor(color)}
                            aria-label={`Select Color ${color}`}
                            className={`w-8 h-8 rounded-full transition-all duration-200 relative ${activeColor === color
                                ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-900'
                                : 'hover:scale-110 hover:shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                }`}
                            style={{ backgroundColor: MEDICAL_COLORS[color] }}
                            title={TOOL_DESCRIPTIONS[color]}
                        >
                            {activeColor === color && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[1.5rem] px-1 font-medium">
                    {TOOL_DESCRIPTIONS[activeColor]}
                </p>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
                <SectionHeader>Quick Actions</SectionHeader>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={toggleInverted}
                        aria-label={isInverted ? "Switch to Standard View" : "Switch to Inverted View"}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${isInverted
                            ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-400 shadow-sm'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <RotateCw size={18} className={`transition-transform duration-500 ${isInverted ? 'rotate-180' : ''}`} />
                        {isInverted ? 'Inverted' : 'Standard'}
                    </button>
                    <button
                        onClick={on3DView}
                        data-tutorial="3d-button"
                        aria-label="Open 3D View (Shift+3)"
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                        title="3D View (Shift+3)"
                    >
                        <Box size={18} /> 3D View
                    </button>
                </div>
                {isProMode && (
                    <button
                        onClick={onAnalyze}
                        aria-label="Analyze Chart with AI"
                        className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <Sparkles size={18} /> Analyze Chart
                    </button>
                )}
            </div>

            {/* Undo/Redo/Clear */}
            <div className="flex gap-2 mt-2" data-tutorial="action-buttons">
                <button
                    onClick={onUndo}
                    aria-label="Undo (⌘Z)"
                    className="flex-1 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
                    title="Undo (⌘Z)"
                >
                    <Undo size={20} />
                </button>
                <button
                    onClick={onRedo}
                    aria-label="Redo (⌘⇧Z)"
                    className="flex-1 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
                    title="Redo (⌘⇧Z)"
                >
                    <Redo size={20} />
                </button>
                <button
                    onClick={onClear}
                    aria-label="Clear All"
                    className="flex-1 p-2.5 rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 hover:bg-danger-100 dark:hover:bg-danger-500/20 hover:text-danger-700 dark:hover:text-danger-300 transition-colors flex items-center justify-center"
                    title="Clear All"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Download */}
            <button
                onClick={onDownload}
                aria-label="Download Image (⌘S)"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all mt-2"
                title="Download Image (⌘S)"
            >
                <Download size={18} /> Download Image
            </button>
        </div>
    );
};
