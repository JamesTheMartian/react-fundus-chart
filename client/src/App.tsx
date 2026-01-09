import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Save, Share2, Users } from 'lucide-react';

import { FundusCanvas } from './components/canvas/FundusCanvas';
import type { FundusCanvasRef } from './components/canvas/FundusCanvas';
import { Toolbar } from './components/toolbar/Toolbar';
import { ThreeDView } from './components/three-d/ThreeDView';
import { AIAnalysisModal } from './components/modals/AIAnalysisModal';
import { ColorLegendModal } from './components/modals/ColorLegendModal';
import { LayerPanel } from './components/LayerPanel';
import { FeedbackPrompt } from './components/ui/FeedbackPrompt';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { DeveloperSettingsModal } from './components/modals/DeveloperSettingsModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// New imports for auth and data management
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginModal } from './components/modals/LoginModal';
import { SaveChartModal } from './components/modals/SaveChartModal';
import { ChartsModal } from './components/modals/ChartsModal';
import { ShareModal } from './components/modals/ShareModal';
import { PatientsListModal } from './components/modals/PatientsListModal';
import { UserMenu } from './components/ui/UserMenu';
import { AutoSaveIndicator } from './components/ui/AutoSaveIndicator';
import { useAutoSave, loadGuestChart, clearGuestChart } from './hooks/useAutoSave';
import { charts as chartsApi } from './api/client';

// Onboarding imports
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { TutorialOverlay } from './components/modals/TutorialOverlay';
import { QuickStartModal } from './components/modals/QuickStartModal';
import { HelpCenterModal } from './components/modals/HelpCenterModal';
import { WhatsNewModal } from './components/modals/WhatsNewModal';

import type { ColorCode, ToolType, EyeSide, PathologyType, FundusElement, GraphicsQuality } from './utils/types';
import { PATHOLOGY_PRESETS } from './utils/types';
import { APP_CONFIG } from './utils/constants';

// Storage key for graphics quality preference
const GRAPHICS_QUALITY_KEY = 'graphics_quality';

// =================================================================
// Main App Content (needs Toast context)
// =================================================================
function AppContent() {
  const [activeColor, setActiveColor] = useState<ColorCode>('red');
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [activePathology, setActivePathology] = useState<PathologyType>('hemorrhage');
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
  const [isProMode, setIsProMode] = useState(false);
  const [showSettingsMobile, setShowSettingsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [graphicsQuality, setGraphicsQualityState] = useState<GraphicsQuality>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GRAPHICS_QUALITY_KEY) as GraphicsQuality | null;
      if (stored && ['low', 'medium', 'high'].includes(stored)) {
        return stored;
      }
    }
    return 'high';
  });

  // New state for auth and data management
  const [showLogin, setShowLogin] = useState(false);
  const [showSaveChart, setShowSaveChart] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [currentChartId, setCurrentChartId] = useState<string | null>(null);
  const [currentChartName, setCurrentChartName] = useState('Untitled Chart');
  const [currentPatientId, setCurrentPatientId] = useState<string | undefined>();

  const setGraphicsQuality = (quality: GraphicsQuality) => {
    setGraphicsQualityState(quality);
    localStorage.setItem(GRAPHICS_QUALITY_KEY, quality);
  };

  const canvasRef = useRef<FundusCanvasRef>(null);
  const sharedChartLoadedRef = useRef(false);
  const { showToast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { isAuthenticated } = useAuth();
  const [isSharedView, setIsSharedView] = useState(false);

  // Auto-save hook
  const { status: autoSaveStatus, lastSaved: autoSaveLastSaved } = useAutoSave({
    elements: currentElements,
    eyeSide,
    chartId: currentChartId,
    chartName: currentChartName,
    patientId: currentPatientId,
    debounceMs: 2000,
    enabled: currentElements.length > 0 && !isSharedView,
  });

  // Load guest chart on mount (if not authenticated)
  // Load guest chart on mount (if not authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      const guestChart = loadGuestChart();
      if (guestChart && guestChart.elements.length > 0) {
        // Load elements into canvas
        setCurrentElements(guestChart.elements);
        setEyeSide(guestChart.eyeSide as EyeSide);
        if (canvasRef.current) {
            canvasRef.current.loadElements(guestChart.elements);
        }
        showToast('Restored your previous drawing', 'info');
      }
    }
  }, [isAuthenticated]);

  // Check URL for share or chart ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    const chartId = params.get('chart');

    if (shareId) {
      if (!sharedChartLoadedRef.current) {
        sharedChartLoadedRef.current = true;
        loadSharedChart(shareId);
      }
    } else if (chartId && isAuthenticated) {
      loadChart(chartId);
    }
  }, [isAuthenticated]);

  const loadSharedChart = async (shareId: string) => {
    try {
      const chart = await chartsApi.getByShareId(shareId);
      if (chart) {
        setCurrentElements(chart.elements);
        setEyeSide(chart.eyeSide);
        setCurrentChartName(chart.name);
        setIsSharedView(true);
        if (canvasRef.current) {
            canvasRef.current.loadElements(chart.elements);
        }
        showToast(`Loaded shared chart: ${chart.name}`, 'success');
        console.log(chart)
      } else {
        showToast('Shared chart not found', 'error');
      }
    } catch (error) {
      console.error('Failed to load shared chart:', error);
      showToast('Failed to load shared chart', 'error');
    }
  };

  const loadChart = async (chartId: string) => {
    try {
      const chart = await chartsApi.get(chartId);
      if (chart) {
        setCurrentElements(chart.elements);
        setEyeSide(chart.eyeSide);
        setCurrentChartId(chart.id);
        setCurrentChartName(chart.name);
        setCurrentPatientId(chart.patientId);
        setIsSharedView(false);
        if (canvasRef.current) {
            canvasRef.current.loadElements(chart.elements);
        }
        showToast(`Loaded chart: ${chart.name}`, 'success');
      }
    } catch (error) {
      console.error('Failed to load chart:', error);
      showToast('Failed to load chart', 'error');
    }
  };

  const handleSaveChart = async (name: string, patientId?: string) => {
    try {
      const chart = await chartsApi.save({
        id: currentChartId || undefined,
        name,
        eyeSide,
        elements: currentElements,
        patientId,
      });
      setCurrentChartId(chart.id);
      setCurrentChartName(chart.name);
      setCurrentPatientId(patientId);
      setIsSharedView(false);

      // Clear guest chart if we just saved as authenticated user
      if (isAuthenticated) {
        clearGuestChart();
      }

      showToast('Chart saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save chart:', error);
      throw error;
    }
  };

  const handleNewChart = () => {
    setCurrentElements([]);
    setCurrentChartId(null);
    setCurrentChartName('Untitled Chart');
    setCurrentPatientId(undefined);
    setIsSharedView(false);
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    showToast('Created new chart', 'info');
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      canvasRef.current.exportImage();
      showToast('Image downloaded successfully!', 'success');

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
    if (show3D) {
      setShow3D(false);
      return;
    }
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
    disabled: show3D || showAI || showLegend || showConfirmClear || showShortcuts || showLogin || showSaveChart || showCharts || showShare || showPatients,
  });

  // Common toolbar props for new features
  const dataManagementProps = {
    onLoginClick: () => setShowLogin(true),
    onSaveChart: () => setShowSaveChart(true),
    onOpenCharts: () => setShowCharts(true),
    onOpenPatients: () => setShowPatients(true),
    onShareChart: () => setShowShare(true),
    autoSaveStatus,
    autoSaveLastSaved,
    currentChartName,
    isDark,
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 flex flex-col lg:flex-row font-sans text-gray-900 dark:text-gray-50 transition-colors duration-200">
      {/* Skip to Content Link */}
      <a href="#main-canvas" className="skip-to-content">
        Skip to canvas
      </a>

      {/* Header for Mobile / Tablet */}
      <header className="lg:hidden h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 shrink-0 z-20 transition-colors">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-50 hidden sm:block">{APP_CONFIG.name}</h1>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-50 sm:hidden">{APP_CONFIG.shortName}</h1>
          <span className="text-[10px] text-gray-400 font-mono">v{APP_CONFIG.version}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Auto-save indicator */}
          <AutoSaveIndicator status={autoSaveStatus} lastSaved={autoSaveLastSaved} isDark={isDark} compact />

          <div data-tutorial="m-save-share" className="flex items-center justify-between gap-1 w-full\">
              <button
                onClick={() => setShowSaveChart(true)}
                className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Save Chart"
              >
                <Save size={18} />
              </button>
              <button
                onClick={() => setShowShare(true)}
                className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>

          {/* User menu */}
          <UserMenu
            onLoginClick={() => setShowLogin(true)}
            onChartsClick={() => setShowCharts(true)}
            onPatientsClick={() => setShowPatients(true)}
            isDark={isDark}
            compact
          />

          {/* 3D View Button */}
          <button
            onClick={handle3DView}
            data-tutorial="m-3d-button"
            className="flex items-center gap-1 px-2 py-1.5 bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-lg text-[10px] font-bold border border-primary-100 dark:border-primary-500/30 active:scale-95 transition-transform uppercase tracking-wider"
          >
            3D
          </button>
        </div>
      </header>

      {/* Left Sidebar - Toolbar */}
      <aside className="hidden lg:flex flex-col w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10 shrink-0 overflow-y-auto shadow-sm transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50 tracking-tight">{APP_CONFIG.name}</h1>
              <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1">
                Studio
                {isProMode && <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-600 text-white shadow-sm">Pro</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">v{APP_CONFIG.version}</p>
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* User & Data Management Row */}
          <div className="flex flex-col gap-3">
            <UserMenu
              onLoginClick={() => setShowLogin(true)}
              onChartsClick={() => setShowCharts(true)}
              onPatientsClick={() => setShowPatients(true)}
              onSettingsClick={() => setShowSettings(true)}
              isDark={isDark}
            />
            <div data-tutorial="save-share" className="flex items-center justify-between gap-1 w-full\">
              <button
                onClick={() => setShowSaveChart(true)}
                className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Save Chart"
              >
                <Save size={18} />
              </button>
              <button
                onClick={() => setShowShare(true)}
                className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Share"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => setShowPatients(true)}
                className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Patients"
              >
                <Users size={18} />
              </button>
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <AutoSaveIndicator status={autoSaveStatus} lastSaved={autoSaveLastSaved} isDark={isDark} />
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
          isProMode={isProMode}
          setShowSettings={setShowSettings}
          setShowSettingsMobile={setShowSettingsMobile}
          {...dataManagementProps}
        />
      </aside>

      {/* Center - Canvas Area */}
      <main
        id="main-canvas"
        className="flex-1 relative bg-gray-100 dark:bg-gray-950 overflow-hidden flex flex-col items-center justify-center lg:justify-center p-2 pb-60 h-[calc(100vh-60px)] lg:pb-0 sm:p-4 lg:p-8 transition-colors"
      >
        {/* Canvas Container */}
        <div data-tutorial="canvas" className="relative shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-full lg:rounded-2xl overflow-hidden bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/5 w-full max-w-[90w] lg:max-w-none aspect-square lg:aspect-auto lg:w-auto lg:h-auto start-canvas-scale\">
          <motion.div
            initial={false}
            animate={{ rotate: isInverted ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="origin-center w-full h-full"
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
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* Floating Action Bar for Canvas */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass shadow-lg rounded-full px-4 py-2 flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 lg:flex hidden">
          <span>{eyeSide}</span>
          <span className="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
          <span>{isInverted ? 'Inverted' : 'Standard'}</span>
          <span className="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
          <span className="truncate max-w-[150px]">{currentChartName}</span>
        </div>
      </main>

      {/* Right Sidebar - Layers (Pro Mode Only) */}
      {isProMode && (
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
      )}

      {/* Mobile Toolbar (Floating) */}
      <div className="lg:hidden absolute bottom-6 left-0 right-0 z-30 pointer-events-none flex flex-col items-center gap-3">
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
          isProMode={isProMode}
          setShowSettingsMobile={setShowSettingsMobile}
          setShowSettings={setShowSettings}
          {...dataManagementProps}
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
          graphicsQuality={graphicsQuality}
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

      <SettingsModal
        isOpen={showSettings || showSettingsMobile}
        onClose={() => {
          setShowSettings(false);
          setShowSettingsMobile(false);
        }}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        isProMode={isProMode}
        setIsProMode={setIsProMode}
        onShowShortcuts={() => {
          setShowSettings(false);
          setShowSettingsMobile(false);
          setShowShortcuts(true);
        }}
        onOpenDevSettings={() => {
          setShowSettings(false);
          setShowSettingsMobile(false);
          setShowDevSettings(true);
        }}
        graphicsQuality={graphicsQuality}
        setGraphicsQuality={setGraphicsQuality}
      />

      <DeveloperSettingsModal 
        isOpen={showDevSettings}
        onClose={() => setShowDevSettings(false)}
        isDark={isDark}
      />

      {/* New Auth & Data Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        isDark={isDark}
      />

      <SaveChartModal
        isOpen={showSaveChart}
        onClose={() => setShowSaveChart(false)}
        onSave={handleSaveChart}
        isDark={isDark}
        initialName={currentChartName}
        initialPatientId={currentPatientId}
      />

      <ChartsModal
        isOpen={showCharts}
        onClose={() => setShowCharts(false)}
        onOpenChart={loadChart}
        onNewChart={handleNewChart}
        isDark={isDark}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        chartId={currentChartId}
        chartName={currentChartName}
        isDark={isDark}
      />

      <PatientsListModal
        isOpen={showPatients}
        onClose={() => setShowPatients(false)}
        onOpenChart={loadChart}
        isDark={isDark}
      />
    </div>
  );
}

// =================================================================
// App Wrapper with Providers
// =================================================================
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <OnboardingProvider>
          <AppContent />
          <OnboardingModals />
        </OnboardingProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

// Separate component for onboarding modals to use hooks
function OnboardingModals() {
  const {
    showQuickStart,
    setShowQuickStart,
    showHelpCenter,
    setShowHelpCenter,
    showWhatsNew,
    setShowWhatsNew,
  } = useOnboarding();

  return (
    <>
      <TutorialOverlay />
      <QuickStartModal isOpen={showQuickStart} onClose={() => setShowQuickStart(false)} />
      <HelpCenterModal isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
      <WhatsNewModal isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
    </>
  );
}

export default App;
