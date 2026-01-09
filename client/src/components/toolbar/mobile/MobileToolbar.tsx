import React from 'react';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';
import { Undo, Redo, Eye, Download, Trash2, Settings, Sparkles, Palette, FlipVertical2 } from 'lucide-react';
import { MEDICAL_COLORS, PATHOLOGY_PRESETS, type PathologyType, type ColorCode, type ToolType } from '../../../utils/types';
import { type ToolbarProps, TOOLS } from '../ToolbarConstants';
import { HorizontalScrollWithArrows } from './HorizontalScrollWithArrows';

export const MobileToolbar: React.FC<ToolbarProps> = ({
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
    onAnalyze,
    vesselOpacity,
    setVesselOpacity,
    setShowSettingsMobile,
    toggleInverted,
    isProMode = false
}) => {
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const showBrushSlider = ['pen', 'brush', 'eraser'].includes(activeTool);
    const dragControls = useDragControls();

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
            setShowMobileMenu(false);
        }
    };

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
                    {/* Tools Section (Horizontal Scroll with Arrows) */}
                    <HorizontalScrollWithArrows
                        containerClassName="glass rounded-full p-2 pl-0 pr-0 group flex items-center justify-center shrink-0 no-scrollbar flex items-center shadow-xl shadow-gray-200/40 dark:shadow-black/30 w-full"
                        scrollAreaClassName="flex gap-1 rounded-full overflow-x-auto snap-x snap-mandatory px-2 no-scrollbar"
                        scrollAmount={100}
                        arrowSize={14}
                    >
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
                        <div className="relative group min-w-[120px]">
                            <select
                                value={activePathology}
                                onChange={(e) => setActivePathology(e.target.value as PathologyType)}
                                aria-label="Select Pathology Type"
                                className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all appearance-none outline-none"
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
                    </HorizontalScrollWithArrows>

                    <HorizontalScrollWithArrows
                        containerClassName="no-scrollbar flex items-center shadow-xl shadow-gray-200/40 dark:shadow-black/30 w-full justify-between"
                        scrollAreaClassName="flex pl-8 pr-8 items-center gap-1.5 overflow-x-auto no-scrollbar"
                        scrollAmount={100}
                        arrowSize={14}
                        leftArrowButtonClassName="absolute z-20 left-0 p-4 h-full flex items-center bg-gradient-to-r from-gray-100/90 dark:from-gray-950/90 to-transparent border-none transition-all active:scale-95 pointer-events-auto"
                        rightArrowButtonClassName="absolute z-20 right-0 p-4 h-full flex items-center bg-gradient-to-l from-gray-100/90 dark:from-gray-950/90 to-transparent border-none transition-all active:scale-95 pointer-events-auto"
                        arrowIconClassName="text-gray-700 dark:text-gray-300 drop-shadow-sm"
                    >

                        {/* Rest of Toolbar (Horizontal Scroll with Arrows) */}

                        {/* Change Eye Side */}
                        <div className='flex items-center gap-1 shrink-0'>
                            <button
                                onClick={() => eyeSide === 'OD' ? setEyeSide('OS') : setEyeSide('OD')}
                                className="p-3 shrink-0 w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-transform"
                                aria-label="Switch eye side"
                            >
                                {eyeSide}
                            </button>
                        </div>
                        {/* Flip */}
                        <div className='flex items-center gap-1 shrink-0'>
                            <button
                                onClick={() => toggleInverted()}
                                className="px-2 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-bold border border-gray-200 dark:border-gray-700 active:scale-95 transition-transform uppercase tracking-wider"
                            >
                                {/*isInverted ? 'Inv' : 'Std'*/}
                                <FlipVertical2 size={20} />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1"></div>

                        {/* Active Color (Larger touch target) */}
                        <div className="flex items-center gap-3 shrink-0">
                            {(() => {
                                const availableColors = Object.keys(MEDICAL_COLORS) as ColorCode[];
                                const colorsToDisplay: ColorCode[] = [];

                                // Add active color first
                                if (activeColor && availableColors.includes(activeColor)) {
                                    colorsToDisplay.push(activeColor);
                                }

                                // Add up to two more unique colors
                                let addedCount = 0;
                                for (const color of availableColors) {
                                    if (color !== activeColor && !colorsToDisplay.includes(color)) {
                                        colorsToDisplay.push(color);
                                        addedCount++;
                                        if (addedCount >= 2) break;
                                    }
                                }

                                return (
                                    <>
                                        {colorsToDisplay.map((color) => (
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
                                        <button
                                            onClick={() => setShowMobileMenu(true)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-90"
                                            aria-label="More colors"
                                        >
                                            <Palette size={20} />
                                        </button>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1"></div>

                        {/* Undo/Redo (Larger touch targets) */}
                        <div className="flex glass rounded-full gap-0.5 shrink-0">
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
                            <button
                                onClick={() => setShowSettingsMobile(true)}
                                className="p-3 bg-indigo-800 dark:bg-indigo-900 rounded-full flex items-center justify-center transition-all shrink-0 hover:bg-gray-700 text-gray-300"
                                aria-label="Open settings"
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                    </HorizontalScrollWithArrows>

                </div>
            </div >

            {/* Mobile Menu Overlay - Bottom Sheet (Tools mainly) */}
            <AnimatePresence>
                {
                    showMobileMenu && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm pointer-events-auto"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <motion.div
                                drag="y"
                                dragControls={dragControls}
                                dragListener={false}
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={{ top: 0, bottom: 0.5 }}
                                onDragEnd={handleDragEnd}
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-gray-800 max-h-[75vh] flex flex-col overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Drag Handle */}
                                <div className="flex justify-center py-3 touch-none" onPointerDown={(e) => dragControls.start(e)}>
                                    <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                                </div>

                                {/* Header */}
                                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 px-5 pb-3 bg-white dark:bg-gray-900 z-10 shrink-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">Tools</h3>
                                    <div className="flex items-center gap-2">
                                        {/* Settings Trigger */}
                                        <button
                                            onClick={() => setShowSettingsMobile(true)}
                                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-all shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            aria-label="Open settings"
                                        >
                                            <Settings size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowMobileMenu(false)}
                                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"
                                            aria-label="Close menu"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
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
                                    {isProMode && (<div className="grid grid-cols-1 gap-3">
                                        <button
                                            onClick={onAnalyze}
                                            className="p-3.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                        >
                                            <Sparkles size={18} /> Analyze
                                        </button>
                                    </div>)}

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
                                </div>

                                {/* Scroll Indicator Gradient */}
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
};
