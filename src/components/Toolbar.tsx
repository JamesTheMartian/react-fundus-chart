import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { ColorCode, ToolType, EyeSide, PathologyType } from '../utils/types';
import { MEDICAL_COLORS, TOOL_DESCRIPTIONS, PATHOLOGY_PRESETS } from '../utils/types';
import { Pen, Brush, Grid, RotateCw, Trash2, Undo, Redo, Eye, Download, Eraser, Box, Sparkles, HelpCircle, PaintBucket, MousePointer } from 'lucide-react';
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
    vesselOpacity: number;
    setVesselOpacity: (opacity: number) => void;
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
    onShowLegend,
    vesselOpacity,
    setVesselOpacity
}) => {
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);

    // Desktop Sidebar Content (Full)
    const SidebarContent = () => (
        <>
            <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Eye Selection</h3>
                <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-xl">
                    <button
                        onClick={() => setEyeSide('OD')}
                        aria-label="Select Right Eye (OD)"
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${eyeSide === 'OD'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                            }`}
                        title="Right Eye (OD)"
                    >
                        <Eye size={18} className={eyeSide === 'OD' ? 'stroke-[2.5px]' : ''} /> OD
                    </button>
                    <button
                        onClick={() => setEyeSide('OS')}
                        aria-label="Select Left Eye (OS)"
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${eyeSide === 'OS'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                            }`}
                        title="Left Eye (OS)"
                    >
                        <Eye size={18} className={eyeSide === 'OS' ? 'stroke-[2.5px]' : ''} /> OS
                    </button>
                </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Drawing Tools</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'select', icon: MousePointer, title: 'Select' },
                        { id: 'pen', icon: Pen, title: 'Pen' },
                        { id: 'brush', icon: Brush, title: 'Brush' },
                        { id: 'pattern', icon: Grid, title: 'Pattern' },
                        { id: 'fill', icon: PaintBucket, title: 'Fill Shape' },
                        { id: 'eraser', icon: Eraser, title: 'Eraser' }
                    ].map((tool) => (
                        <motion.button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as ToolType)}
                            aria-label={`Select ${tool.title} Tool`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative p-3.5 rounded-xl flex items-center justify-center transition-colors duration-200 ${activeTool === tool.id
                                ? 'text-white shadow-md shadow-blue-500/20'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent hover:border-gray-200'
                                }`}
                            title={tool.title}
                        >
                            {activeTool === tool.id && (
                                <motion.div
                                    layoutId="activeToolDesktop"
                                    className="absolute inset-0 bg-blue-600 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">
                                <tool.icon size={20} strokeWidth={activeTool === tool.id ? 2.5 : 2} />
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Stroke Width</h3>
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md min-w-[3rem] text-center">{brushSize}px</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    aria-label="Adjust Brush Size"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                />
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Pathology Type</h3>
                <div className="relative group">
                    <select
                        value={activePathology}
                        onChange={(e) => setActivePathology(e.target.value as PathologyType)}
                        aria-label="Select Pathology Type"
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-gray-100 transition-all appearance-none outline-none"
                    >
                        {(Object.keys(PATHOLOGY_PRESETS) as PathologyType[]).map((type) => (
                            <option key={type} value={type}>
                                {PATHOLOGY_PRESETS[type].label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {activePathology === 'detachment' && (
                <div className="flex flex-col gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Detachment Height</h3>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{detachmentHeight}</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={detachmentHeight}
                        onChange={(e) => setDetachmentHeight(Number(e.target.value))}
                        aria-label="Adjust Detachment Height"
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Vessel Map</h3>
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{Math.round(vesselOpacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vesselOpacity}
                    onChange={(e) => setVesselOpacity(Number(e.target.value))}
                    aria-label="Adjust Vessel Map Opacity"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                />
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Color Palette</h3>
                    <button
                        onClick={onShowLegend}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-50"
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
                                ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-gray-400'
                                : 'hover:scale-110 hover:shadow-sm ring-1 ring-black/5'
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
                <p className="text-xs text-gray-500 min-h-[1.5rem] px-1 font-medium">
                    {TOOL_DESCRIPTIONS[activeColor]}
                </p>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={toggleInverted}
                        aria-label={isInverted ? "Switch to Standard View" : "Switch to Inverted View"}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${isInverted
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        <RotateCw size={18} className={`transition-transform duration-500 ${isInverted ? 'rotate-180' : ''}`} />
                        {isInverted ? 'Inverted' : 'Standard'}
                    </button>
                    <button
                        onClick={on3DView}
                        aria-label="Open 3D View"
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                        <Box size={18} /> 3D View
                    </button>
                </div>
                <button
                    onClick={onAnalyze}
                    aria-label="Analyze Chart with AI"
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                    <Sparkles size={18} /> Analyze Chart
                </button>
            </div>

            <div className="flex gap-2 mt-2">
                <button onClick={onUndo} aria-label="Undo" className="flex-1 p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center justify-center" title="Undo">
                    <Undo size={20} />
                </button>
                <button onClick={onRedo} aria-label="Redo" className="flex-1 p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center justify-center" title="Redo">
                    <Redo size={20} />
                </button>
                <button onClick={onClear} aria-label="Clear All" className="flex-1 p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center" title="Clear All">
                    <Trash2 size={20} />
                </button>
            </div>

            <button onClick={onDownload} aria-label="Download Image" className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all mt-2">
                <Download size={18} /> Download Image
            </button>
            <button
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcqdmvqVsFLrVreXe2fJcR24GcSj954BA8edlgqzUXyFiT1g/viewform?usp=dialog', '_blank')}
                aria-label="Give Feedback"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-transparent text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-all"
            >
                <HelpCircle size={18} /> Give Feedback
            </button>
        </>
    );

    // Mobile Bottom Bar (Tools + Menu Trigger)
    const MobileBottomBar = () => {
        const showBrushSlider = ['pen', 'brush', 'eraser'].includes(activeTool);

        return (
            <div className="flex flex-col items-center gap-3 w-full pointer-events-auto">

                {/* Brush Size Slider (Conditional) */}
                {showBrushSlider && (
                    <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-2 px-4 flex items-center gap-3 w-[80%] max-w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Size</span>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-gray-600 w-6 text-center">{brushSize}</span>
                    </div>
                )}

                {/* Main Toolbar Pill */}
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-200/40 rounded-full p-2 pl-3 pr-2 w-full max-w-sm justify-between">
                    {/* Tools Section (Horizontal Scroll) */}
                    <div className="relative group flex items-center justify-center w-[130px] shrink-0">
                        {/* Scroll hint - Left */}
                        <div className="absolute left-0 w-4 h-full bg-gradient-to-r from-white/90 to-transparent z-10 pointer-events-none" />

                        <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory px-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {[
                                { id: 'select', icon: MousePointer, title: 'Select' },
                                { id: 'pen', icon: Pen, title: 'Pen' },
                                { id: 'brush', icon: Brush, title: 'Brush' },
                                { id: 'pattern', icon: Grid, title: 'Pattern' },
                                { id: 'fill', icon: PaintBucket, title: 'Fill Shape' },
                                { id: 'eraser', icon: Eraser, title: 'Eraser' }
                            ].map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTool(tool.id as ToolType)}
                                    className={`relative p-2.5 rounded-full flex items-center justify-center transition-all active:scale-90 snap-center shrink-0 ${activeTool === tool.id
                                        ? 'text-white shadow-md shadow-blue-500/30'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {activeTool === tool.id && (
                                        <motion.div
                                            layoutId="activeToolMobile"
                                            className="absolute inset-0 bg-blue-600 rounded-full"
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
                        <div className="absolute right-0 w-4 h-full bg-gradient-to-l from-white/90 to-transparent z-10 pointer-events-none" />
                    </div>

                    <div className="w-px h-6 bg-gray-200 shrink-0 mx-1"></div>

                    {/* Active Color (Compact) */}
                    <button
                        onClick={() => setShowMobileMenu(true)}
                        className="w-9 h-9 rounded-full border border-gray-100 shadow-inner shrink-0 relative hover:scale-105 transition-transform"
                        style={{ backgroundColor: MEDICAL_COLORS[activeColor] }}
                    >
                        {/* Color Indicator Ring if white/bright */}
                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5"></div>
                    </button>

                    <div className="w-px h-6 bg-gray-200 shrink-0 mx-1"></div>

                    {/* Undo/Redo (Compact) */}
                    <div className="flex gap-0.5 shrink-0">
                        <button onClick={onUndo} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 active:scale-90 transition-transform">
                            <Undo size={18} />
                        </button>
                        <button onClick={onRedo} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 active:scale-90 transition-transform">
                            <Redo size={18} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200 shrink-0 mx-1"></div>

                    {/* Menu Trigger */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className={`p-2 rounded-full flex items-center justify-center transition-all shrink-0 ${showMobileMenu ? 'bg-gray-900 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <Box size={20} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col gap-5 p-2 w-full transition-all h-full">
                <SidebarContent />
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden w-full h-full flex items-center">
                <MobileBottomBar />
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm pointer-events-auto"
                        onClick={() => setShowMobileMenu(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-4 left-2 right-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-h-[70vh] overflow-y-auto flex flex-col gap-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <h3 className="font-semibold text-gray-900">Settings & Tools</h3>
                                <button onClick={() => setShowMobileMenu(false)} className="p-1 bg-gray-100 rounded-full text-gray-500">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>

                            {/* Re-use components for the menu */}
                            <div className="flex flex-col gap-4">
                                {/* Colors */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Colors</h4>
                                    <div className="grid grid-cols-6 gap-2">
                                        {(Object.keys(MEDICAL_COLORS) as ColorCode[]).map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => { setActiveColor(color); setShowMobileMenu(false); }}
                                                className={`w-8 h-8 rounded-full border-2 ${activeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: MEDICAL_COLORS[color] }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Pathology */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Pathology</h4>
                                    <select
                                        value={activePathology}
                                        onChange={(e) => setActivePathology(e.target.value as PathologyType)}
                                        className="w-full p-3 bg-gray-50 rounded-xl text-sm font-medium"
                                    >
                                        {(Object.keys(PATHOLOGY_PRESETS) as PathologyType[]).map((type) => (
                                            <option key={type} value={type}>{PATHOLOGY_PRESETS[type].label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Brush Size */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase">Brush Size</h4>
                                        <span className="text-xs bg-gray-100 px-2 rounded">{brushSize}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg accent-blue-500"
                                    />
                                </div>

                                {/* Vessel Opacity */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase">Vessel Map</h4>
                                        <span className="text-xs bg-gray-100 px-2 rounded">{Math.round(vesselOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={vesselOpacity}
                                        onChange={(e) => setVesselOpacity(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg accent-blue-500"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={on3DView} className="p-3 bg-gray-50 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                                        <Box size={16} /> 3D View
                                    </button>
                                    <button onClick={onAnalyze} className="p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                                        <Sparkles size={16} /> Analyze
                                    </button>
                                </div>

                                <button onClick={onDownload} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                                    <Download size={16} /> Download Image
                                </button>
                                <button
                                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcqdmvqVsFLrVreXe2fJcR24GcSj954BA8edlgqzUXyFiT1g/viewform?usp=dialog', '_blank')}
                                    className="w-full p-3 text-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <HelpCircle size={16} /> Give Feedback
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
