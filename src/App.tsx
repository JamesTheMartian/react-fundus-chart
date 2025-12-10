import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, Keyboard } from 'lucide-react';

import { FundusCanvas } from './components/FundusCanvas';
import type { FundusCanvasRef } from './components/FundusCanvas';
import { Toolbar } from './components/Toolbar';
import { ThreeDView } from './components/ThreeDView';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ColorLegendModal } from './components/ColorLegendModal';
import { LayerPanel } from './components/LayerPanel';
import { FeedbackPrompt } from './components/FeedbackPrompt';
import { ToastProvider, useToast } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import type { ColorCode, ToolType, EyeSide, PathologyType, FundusElement } from './utils/types';
import { PATHOLOGY_PRESETS } from './utils/types';

// =================================================================
// Main App Content (needs Toast context)
// =================================================================
function AppContent() {
  const [activeColor, setActiveColor] = useState<ColorCode>('red');
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [brushSize, setBrushSize] = useState<number>(2);
  const [activePathology, setActivePathology] = useState<PathologyType>('normal');
  const [detachmentHeight, setDetachmentHeight] = useState<number>(0.3);
  const [vesselOpacity, setVesselOpacity] = useState<number>(0);
  const [isInverted, setIsInverted] = useState(false);
  const [eyeSide, setEyeSide] = useState<EyeSide>('OD');
  const [show3D, setShow3D] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [textureUrl, setTextureUrl] = useState('');
  const [currentElements, setCurrentElements] = useState<FundusElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const canvasRef = useRef<FundusCanvasRef>(null);
  const { showToast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();

  const handleDownload = () => {
    if (canvasRef.current) {
      canvasRef.current.exportImage();
      showToast('Image downloaded successfully!', 'success');

      // Check if user has opted out of feedback
      const hasOptedOut = localStorage.getItem('feedback_opt_out');
      if (!hasOptedOut) {
        setTimeout(() => {
          setShowFeedbackPrompt(true);
        }, 1500);
      }
    }
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
    }
  };

  const handleClear = () => {
    setShowConfirmClear(true);
  };

  const confirmClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      showToast('Canvas cleared', 'info');
    }
    setShowConfirmClear(false);
  };

  const handle3DView = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.getDataURL();
      if (url) {
        setTextureUrl(url);
        setCurrentElements(canvasRef.current.getStrokes());
        setShow3D(true);
      }
    }
  };

  const handleAnalyze = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.getDataURL();
      if (url) {
        setTextureUrl(url);
        setShowAI(true);
      }
    }
  };

  const handlePathologyChange = (pathology: PathologyType) => {
    setActivePathology(pathology);
    const preset = PATHOLOGY_PRESETS[pathology];
    if (preset) {
      setActiveColor(preset.color);
      setActiveTool(preset.tool);
      setBrushSize(preset.width);
    }
  };

  const handleElementUpdate = (id: string, updates: Partial<FundusElement>) => {
    if (canvasRef.current) {
      canvasRef.current.updateElement(id, updates);
    }
  };

  const handleElementDelete = (id: string) => {
    if (canvasRef.current) {
      canvasRef.current.deleteElement(id);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      handleElementDelete(selectedElementId);
      setSelectedElementId(null);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onClear: handleClear,
    onDownload: handleDownload,
    on3DView: handle3DView,
    onDelete: handleDeleteSelected,
    onDeselect: () => setSelectedElementId(null),
    onShowShortcuts: () => setShowShortcuts(true),
    onToggleDarkMode: toggleDarkMode,
    setActiveTool,
    disabled: show3D || showAI || showLegend || showConfirmClear || showShortcuts,
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 flex flex-col lg:flex-row font-sans text-gray-900 dark:text-gray-50 transition-colors duration-200">
      {/* Skip to Content Link */}
      <a href="#main-canvas" className="skip-to-content">
        Skip to canvas
      </a>

      {/* Header for Mobile / Tablet */}
      <header className="lg:hidden h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-20 transition-colors">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Retinal Fundus Charting</h1>
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handle3DView}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-semibold border border-primary-100 dark:border-primary-500/30 active:scale-95 transition-transform"
          >
            3D View
          </button>
          <button
            onClick={() => setIsInverted(!isInverted)}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/20 px-2 py-1 rounded active:scale-95 transition-transform"
          >
            {isInverted ? 'Inverted' : 'Standard'}
          </button>
        </div>
      </header>

      {/* Left Sidebar - Toolbar */}
      <aside className="hidden lg:flex flex-col w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10 shrink-0 overflow-y-auto shadow-sm transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50 tracking-tight">Retinal Charting</h1>
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-widest">Pro Studio</p>
          </div>
          <div className="flex items-center gap-1">
            {/* Keyboard Shortcuts Button */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard size={18} />
            </button>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode (D)' : 'Dark mode (D)'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <Toolbar
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          activePathology={activePathology}
          setActivePathology={handlePathologyChange}
          detachmentHeight={detachmentHeight}
          setDetachmentHeight={setDetachmentHeight}
          isInverted={isInverted}
          toggleInverted={() => setIsInverted(!isInverted)}
          eyeSide={eyeSide}
          setEyeSide={setEyeSide}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onDownload={handleDownload}
          on3DView={handle3DView}
          onAnalyze={handleAnalyze}
          onShowLegend={() => setShowLegend(true)}
          vesselOpacity={vesselOpacity}
          setVesselOpacity={setVesselOpacity}
          variant="desktop"
        />
      </aside>

      {/* Center - Canvas Area */}
      <main
        id="main-canvas"
        className="flex-1 relative bg-gray-100 dark:bg-gray-950 overflow-hidden flex items-center justify-center p-4 lg:p-8 transition-colors"
      >
        {/* Canvas Container */}
        <div className="relative shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-full lg:rounded-2xl overflow-hidden bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/5">
          <motion.div
            initial={false}
            animate={{ rotate: isInverted ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="origin-center"
          >
            <FundusCanvas
              ref={canvasRef}
              width={600}
              height={600}
              activeColor={activeColor}
              activeTool={activeTool}
              brushSize={brushSize}
              activePathology={activePathology}
              isInverted={isInverted}
              disableContextRotation={true}
              eyeSide={eyeSide}
              vesselOpacity={vesselOpacity}
              onUndo={handleUndo}
              onClear={handleClear}
              onElementsChange={setCurrentElements}
              onSelectionChange={setSelectedElementId}
              selectedElementId={selectedElementId}
              disabled={show3D}
            />
          </motion.div>
        </div>

        {/* Floating Action Bar for Canvas */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass shadow-lg rounded-full px-4 py-2 flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 lg:flex hidden">
          <span>{eyeSide}</span>
          <span className="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
          <span>{isInverted ? 'Inverted' : 'Standard'}</span>
        </div>
      </main>

      {/* Right Sidebar - Layers */}
      <aside className="hidden lg:flex flex-col w-72 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-10 shrink-0 shadow-sm transition-colors">
        <LayerPanel
          elements={currentElements}
          selectedElementId={selectedElementId}
          onSelect={(id) => {
            setSelectedElementId(id);
          }}
          onUpdate={handleElementUpdate}
          onDelete={handleElementDelete}
        />
      </aside>

      {/* Mobile Toolbar (Floating) */}
      <div className="lg:hidden absolute bottom-6 left-4 right-4 z-30 pointer-events-none flex flex-col items-center gap-3">
        <Toolbar
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          activePathology={activePathology}
          setActivePathology={handlePathologyChange}
          detachmentHeight={detachmentHeight}
          setDetachmentHeight={setDetachmentHeight}
          isInverted={isInverted}
          toggleInverted={() => setIsInverted(!isInverted)}
          eyeSide={eyeSide}
          setEyeSide={setEyeSide}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onDownload={handleDownload}
          on3DView={handle3DView}
          onAnalyze={handleAnalyze}
          onShowLegend={() => setShowLegend(true)}
          vesselOpacity={vesselOpacity}
          setVesselOpacity={setVesselOpacity}
          variant="mobile"
        />
      </div>

      {/* Modals */}
      {show3D && (
        <ThreeDView
          textureUrl={textureUrl}
          elements={currentElements}
          detachmentHeight={detachmentHeight}
          onClose={() => setShow3D(false)}
          eyeSide={eyeSide}
        />
      )}

      <AnimatePresence>
        {showAI && <AIAnalysisModal imageData={textureUrl} onClose={() => setShowAI(false)} />}
      </AnimatePresence>

      <ColorLegendModal isOpen={showLegend} onClose={() => setShowLegend(false)} />

      <FeedbackPrompt
        isOpen={showFeedbackPrompt}
        onClose={() => setShowFeedbackPrompt(false)}
        onFeedback={() => {
          window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcqdmvqVsFLrVreXe2fJcR24GcSj954BA8edlgqzUXyFiT1g/viewform?usp=dialog', '_blank');
          setShowFeedbackPrompt(false);
        }}
        onDontShowAgain={() => {
          localStorage.setItem('feedback_opt_out', 'true');
          setShowFeedbackPrompt(false);
        }}
      />

      {/* Confirm Clear Dialog */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={confirmClear}
        title="Clear Canvas"
        message="Are you sure you want to clear all drawings? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

// =================================================================
// App Wrapper with Toast Provider
// =================================================================
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
