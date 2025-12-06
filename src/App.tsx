import { useState, useRef } from 'react';
import { FundusCanvas } from './components/FundusCanvas';
import type { FundusCanvasRef } from './components/FundusCanvas';
import { Toolbar } from './components/Toolbar';
import { ThreeDView } from './components/ThreeDView';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ColorLegendModal } from './components/ColorLegendModal';
import { LayerPanel } from './components/LayerPanel';
import { FeedbackPrompt } from './components/FeedbackPrompt';
import type { ColorCode, ToolType, EyeSide, PathologyType, FundusElement, Point } from './utils/types';
import { PATHOLOGY_PRESETS } from './utils/types';
// import './App.css'; // Removed for Tailwind migration

function App() {
  const [activeColor, setActiveColor] = useState<ColorCode>('red');
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [brushSize, setBrushSize] = useState<number>(2);
  const [activePathology, setActivePathology] = useState<PathologyType>('normal');
  const [detachmentHeight, setDetachmentHeight] = useState<number>(0.3);
  const [isInverted, setIsInverted] = useState(false);
  const [eyeSide, setEyeSide] = useState<EyeSide>('OD');
  const [show3D, setShow3D] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [textureUrl, setTextureUrl] = useState('');
  const [currentElements, setCurrentElements] = useState<FundusElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  const canvasRef = useRef<FundusCanvasRef>(null);

  const handleDownload = () => {
    if (canvasRef.current) {
      canvasRef.current.exportImage();

      // Check if user has opted out of feedback
      const hasOptedOut = localStorage.getItem('feedback_opt_out');
      if (!hasOptedOut) {
        // Show feedback prompt after a short delay to allow download to start
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
    if (confirm('Clear all drawings?')) {
      if (canvasRef.current) {
        canvasRef.current.clear();
      }
    }
  };

  const handle3DView = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.getDataURL();
      if (url) {
        setTextureUrl(url);
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

  const handleAddElement = (point: Point) => {
    if (canvasRef.current) {
      const newElement: FundusElement = {
        id: Date.now().toString(),
        type: activePathology === 'hemorrhage' || activePathology === 'vitreous_hemorrhage' ? 'hemorrhage' : 'stroke',
        position: point, // For shapes
        points: [point], // For strokes (start point)
        color: activeColor,
        width: brushSize * 5, // Make 3D added elements visible
        height: brushSize * 5,
        toolType: activeTool,
        pathology: activePathology,
        timestamp: Date.now(),
        visible: true,
        layer: activePathology === 'vitreous_hemorrhage' ? 'vitreous' : 'retina',
        zDepth: activePathology === 'vitreous_hemorrhage' ? 0.5 : 0
      };

      canvasRef.current.addElement(newElement);
      // Update local state to reflect in 3D view immediately
      setCurrentElements(prev => [...prev, newElement]);

      // Also update texture if needed? 
      // The 3D view uses the texture for the surface. 
      // If we add an element, we might want to regenerate the texture.
      // But for "Vitreous" elements, they are separate meshes, so no texture update needed.
      // For "Retina" elements (hemorrhage), they should be on the texture.
      // We can trigger a texture update by re-calling getDataURL, but that's expensive.
      // For now, let's assume 3D view handles "Vitreous" as separate meshes.
      // Retinal elements might need a texture refresh or be rendered as decals (future work).
      // Let's just update the elements list for now.
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex flex-col lg:flex-row font-sans text-gray-900">
      {/* Header for Mobile / Tablet - Minimal */}
      <header className="lg:hidden h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20">
        <h1 className="text-sm font-semibold text-gray-900">Retinal Fundus Charting</h1>
        <button onClick={() => setIsInverted(!isInverted)} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {isInverted ? 'Inverted' : 'Standard'}
        </button>
      </header>

      {/* Left Sidebar - Toolbar */}
      <aside className="hidden lg:flex flex-col w-80 h-full bg-white border-r border-gray-200 z-10 shrink-0 overflow-y-auto shadow-sm">
        <div className="p-5 border-b border-gray-100 flex flex-col gap-0.5">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Retinal Charting</h1>
          <p className="text-xs font-medium text-blue-600 uppercase tracking-widest">Pro Studio</p>
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
        />
      </aside>

      {/* Center - Canvas Area */}
      <main className="flex-1 relative bg-gray-100 overflow-hidden flex items-center justify-center p-4 lg:p-8">
        {/* Canvas Container */}
        <div className="relative shadow-2xl shadow-black/10 rounded-full lg:rounded-2xl overflow-hidden bg-white ring-1 ring-black/5">
          <FundusCanvas
            ref={canvasRef}
            width={600}
            height={600}
            activeColor={activeColor}
            activeTool={activeTool}
            brushSize={brushSize}
            activePathology={activePathology}
            isInverted={isInverted}
            eyeSide={eyeSide}
            onUndo={handleUndo}
            onClear={handleClear}
            onElementsChange={setCurrentElements}
            onSelectionChange={setSelectedElementId}
            selectedElementId={selectedElementId}
          />
        </div>

        {/* Floating Action Bar for Canvas (Zoom/Pan controls could go here) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-lg border border-gray-200 rounded-full px-4 py-2 flex gap-4 text-xs font-medium text-gray-600 lg:flex hidden">
          <span>{eyeSide}</span>
          <span className="w-px h-4 bg-gray-300"></span>
          <span>{isInverted ? 'Inverted' : 'Standard'}</span>
        </div>
      </main>

      {/* Right Sidebar - Layers */}
      <aside className="hidden lg:flex flex-col w-72 h-full bg-white border-l border-gray-200 z-10 shrink-0 shadow-sm">
        <LayerPanel
          elements={currentElements}
          selectedElementId={selectedElementId}
          onSelect={(id) => {
            setSelectedElementId(id);
            if (canvasRef.current && id) {
              // Selection logic handled via state
            }
          }}
          onUpdate={handleElementUpdate}
          onDelete={handleElementDelete}
        />
      </aside>

      {/* Mobile Toolbar (Bottom Sheet style) */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-2 shrink-0 z-20 overflow-x-auto">
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
        />
      </div>

      {show3D && <ThreeDView textureUrl={textureUrl} elements={currentElements} detachmentHeight={detachmentHeight} onClose={() => setShow3D(false)} eyeSide={eyeSide} onAddElement={handleAddElement} />}
      {showAI && <AIAnalysisModal imageData={textureUrl} onClose={() => setShowAI(false)} />}
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
    </div>
  );
}

export default App;
