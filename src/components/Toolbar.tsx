import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { ColorCode, ToolType, EyeSide, PathologyType } from '../utils/types';
import { MEDICAL_COLORS, TOOL_DESCRIPTIONS, PATHOLOGY_PRESETS } from '../utils/types';
import { Pen, Brush, Grid, RotateCw, Trash2, Undo, Redo, Eye, Download, Eraser, Box, Sparkles, HelpCircle, PaintBucket, MousePointer } from 'lucide-react';

// =================================================================
// Types
// =================================================================
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
    vesselOpacity: number;
    setVesselOpacity: (opacity: number) => void;
    variant?: 'desktop' | 'mobile';
    isProMode?: boolean;
}

// =================================================================
// Tool Configuration with Keyboard Shortcuts
// =================================================================
const TOOLS = [
    { id: 'select', icon: MousePointer, title: 'Select', shortcut: '1' },
    { id: 'pen', icon: Pen, title: 'Pen', shortcut: '2' },
    { id: 'brush', icon: Brush, title: 'Brush', shortcut: '3' },
    { id: 'pattern', icon: Grid, title: 'Pattern', shortcut: '4' },
    { id: 'fill', icon: PaintBucket, title: 'Fill Shape', shortcut: '5' },
    { id: 'eraser', icon: Eraser, title: 'Eraser', shortcut: '6' }
];

// =================================================================
// Section Header Component
// =================================================================
const SectionHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1 ${className}`}>
        {children}
    </h3>
);

// =================================================================
// Desktop Toolbar
// =================================================================
const DesktopToolbar: React.FC<ToolbarProps> = ({
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
    isProMode = false
}) => {
    return (
        <div className="flex flex-col gap-5 p-4 w-full transition-all h-full">
            {/* Eye Selection */}
            <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3">
                <SectionHeader>Drawing Tools</SectionHeader>
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
            <div className="flex flex-col gap-3">
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
            <div className="flex gap-2 mt-2">
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

            {/* Feedback */}
            <button
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcqdmvqVsFLrVreXe2fJcR24GcSj954BA8edlgqzUXyFiT1g/viewform?usp=dialog', '_blank')}
                aria-label="Give Feedback"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-transparent text-primary-600 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
            >
                <HelpCircle size={18} /> Give Feedback
            </button>
        </div>
    );
};

// =================================================================
// Mobile Toolbar
// =================================================================
const MobileToolbar: React.FC<ToolbarProps> = ({
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
    eyeSide,
    setEyeSide,
    onUndo,
    onRedo,
    onClear,
    onDownload,
    on3DView,
    onAnalyze,
    // onShowLegend - not used in mobile toolbar, available in desktop
    vesselOpacity,
    setVesselOpacity
}) => {
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const showBrushSlider = ['pen', 'brush', 'eraser'].includes(activeTool);

    return (
        <>
            <div className="w-full h-full flex items-center overflow-hidden">
                <div className="flex flex-col items-center gap-3 w-full pointer-events-auto">

                    {/* Brush Size Slider (Conditional) */}
                    {showBrushSlider && (
                        <div className="glass shadow-lg rounded-2xl p-2 px-4 flex items-center gap-3 w-[80%] max-w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-300">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">Size</span>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full"
                            />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-6 text-center">{brushSize}</span>
                        </div>
                    )}

                    {/* Main Toolbar Pill */}
                    <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 glass shadow-xl shadow-gray-200/40 dark:shadow-black/30 rounded-full p-2 pl-3 pr-2 w-full max-w-sm justify-between">
                        {/* Tools Section (Horizontal Scroll) */}
                        <div className="relative group flex items-center justify-center w-[140px] shrink-0">
                            {/* Scroll hint - Left */}
                            <div className="absolute left-0 w-4 h-full bg-gradient-to-r from-white/90 dark:from-gray-900/90 to-transparent z-10 pointer-events-none" />

                            <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory px-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {TOOLS.map((tool) => (
                                    <button
                                        key={tool.id}
                                        onClick={() => setActiveTool(tool.id as ToolType)}
                                        className={`relative p-3 rounded-full flex items-center justify-center transition-all active:scale-90 snap-center shrink-0 ${activeTool === tool.id
                                            ? 'text-white shadow-md shadow-primary-500/30'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                        aria-label={`${tool.title} (${tool.shortcut})`}
                                    >
                                        {activeTool === tool.id && (
                                            <motion.div
                                                layoutId="activeToolMobile"
                                                className="absolute inset-0 bg-primary-600 rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            <tool.icon size={20} className={activeTool === tool.id ? 'stroke-[2.5px]' : ''} />
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Scroll hint - Right */}
                            <div className="absolute right-0 w-4 h-full bg-gradient-to-l from-white/90 dark:from-gray-900/90 to-transparent z-10 pointer-events-none" />
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1"></div>

                        {/* Active Color (Larger touch target) */}
                        <button
                            onClick={() => setShowMobileMenu(true)}
                            className="w-11 h-11 rounded-full border border-gray-100 dark:border-gray-700 shadow-inner shrink-0 relative hover:scale-105 transition-transform"
                            style={{ backgroundColor: MEDICAL_COLORS[activeColor] }}
                            aria-label="Open color picker and settings"
                        >
                            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 dark:ring-white/10"></div>
                        </button>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1"></div>

                        {/* Undo/Redo (Larger touch targets) */}
                        <div className="flex gap-0.5 shrink-0">
                            <button
                                onClick={onUndo}
                                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-90 transition-transform"
                                aria-label="Undo"
                            >
                                <Undo size={20} />
                            </button>
                            <button
                                onClick={onRedo}
                                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-90 transition-transform"
                                aria-label="Redo"
                            >
                                <Redo size={20} />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1"></div>

                        {/* Menu Trigger (Larger) */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className={`p-3 rounded-full flex items-center justify-center transition-all shrink-0 ${showMobileMenu
                                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            aria-label="Open settings menu"
                        >
                            <Box size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay - Bottom Sheet */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm pointer-events-auto"
                        onClick={() => setShowMobileMenu(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-gray-800 max-h-[75vh] flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drag Handle */}
                            <div className="flex justify-center py-3">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 px-5 pb-3 bg-white dark:bg-gray-900 z-10 shrink-0">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-50">Settings & Tools</h3>
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"
                                    aria-label="Close menu"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-5 pt-4 flex flex-col gap-5 relative flex-1">
                                {/* Eye Selection */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Eye Selection</h4>
                                    <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                                        <button
                                            onClick={() => setEyeSide('OD')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-semibold transition-all ${eyeSide === 'OD'
                                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            <Eye size={18} className={eyeSide === 'OD' ? 'stroke-[2.5px]' : ''} /> OD
                                        </button>
                                        <button
                                            onClick={() => setEyeSide('OS')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-semibold transition-all ${eyeSide === 'OS'
                                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            <Eye size={18} className={eyeSide === 'OS' ? 'stroke-[2.5px]' : ''} /> OS
                                        </button>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Colors</h4>
                                    <div className="grid grid-cols-6 gap-3">
                                        {(Object.keys(MEDICAL_COLORS) as ColorCode[]).map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => { setActiveColor(color); setShowMobileMenu(false); }}
                                                className={`w-10 h-10 rounded-full border-2 transition-all ${activeColor === color
                                                    ? 'border-gray-900 dark:border-white scale-110'
                                                    : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: MEDICAL_COLORS[color] }}
                                                aria-label={`Select ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Pathology */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Pathology</h4>
                                    <select
                                        value={activePathology}
                                        onChange={(e) => setActivePathology(e.target.value as PathologyType)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        {(Object.keys(PATHOLOGY_PRESETS) as PathologyType[]).map((type) => (
                                            <option key={type} value={type}>{PATHOLOGY_PRESETS[type].label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Brush Size */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Brush Size</h4>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 rounded">{brushSize}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Detachment height */}
                                {activePathology === 'detachment' && (
                                    <div className="flex flex-col gap-3 bg-primary-50/50 dark:bg-primary-500/10 p-4 rounded-xl border border-primary-100/50 dark:border-primary-500/20">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-500 dark:text-primary-400">Detachment Height</h4>
                                            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/20 px-2 py-1 rounded-md">{detachmentHeight}</span>
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

                                {/* Vessel Opacity */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Vessel Map</h4>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 rounded">{Math.round(vesselOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={vesselOpacity}
                                        onChange={(e) => setVesselOpacity(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={on3DView}
                                        className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                    >
                                        <Box size={18} /> 3D View
                                    </button>
                                    <button
                                        onClick={onAnalyze}
                                        className="p-3.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                    >
                                        <Sparkles size={18} /> Analyze
                                    </button>
                                </div>

                                {/* Clear */}
                                <button
                                    onClick={onClear}
                                    className="w-full p-3.5 border border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} /> Clear Canvas
                                </button>

                                <button
                                    onClick={onDownload}
                                    className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> Download Image
                                </button>

                                <button
                                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcqdmvqVsFLrVreXe2fJcR24GcSj954BA8edlgqzUXyFiT1g/viewform?usp=dialog', '_blank')}
                                    className="w-full p-3.5 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <HelpCircle size={18} /> Give Feedback
                                </button>
                            </div>

                            {/* Scroll Indicator Gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// =================================================================
// Toolbar Export
// =================================================================
export const Toolbar: React.FC<ToolbarProps> = (props) => {
    if (props.variant === 'mobile') {
        return <MobileToolbar {...props} />;
    }
    return <DesktopToolbar {...props} />;
};
