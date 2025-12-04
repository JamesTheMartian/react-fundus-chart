import { useState, useRef } from 'react';
import { FundusCanvas } from './components/FundusCanvas';
import type { FundusCanvasRef } from './components/FundusCanvas';
import { Toolbar } from './components/Toolbar';
import { ThreeDView } from './components/ThreeDView';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ColorLegendModal } from './components/ColorLegendModal';
import { LayerPanel } from './components/LayerPanel';
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

  const canvasRef = useRef<FundusCanvasRef>(null);

  const handleDownload = () => {
    if (canvasRef.current) {
      canvasRef.current.exportImage();
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Retinal Fundus Charting</h1>
            <p className="text-sm text-gray-500 font-medium">Amsler-Dubois Standard</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-center">
        <div className="flex-1 w-full flex justify-center items-start">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-1 sm:p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-full">
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
        </div>

        <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
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

        <aside className="layer-sidebar">
          <LayerPanel
            elements={currentElements}
            selectedElementId={selectedElementId}
            onSelect={(id) => {
              setSelectedElementId(id);
              // Also need to tell canvas to select it?
              // Canvas is controlled by its own internal state for selection?
              // No, we added onSelectionChange but didn't add a prop to SET selection from outside.
              // We should probably add a method to canvasRef or a prop.
              // For now, let's assume clicking in LayerPanel just sets App state, 
              // but Canvas needs to know to highlight it.
              // We need to pass selectedElementId back to Canvas?
              // Or use a method.
              // Let's use a method if possible, or better, make Canvas controlled.
              // But Canvas has internal state.
              // Let's add `selectElement` to ref.
              if (canvasRef.current && id) {
                // We need to implement selectElement in FundusCanvas
                // For now let's just update the local state and hope we can sync it.
                // Actually, we need to update FundusCanvas to accept selectedElementId prop or method.
              }
            }}
            onUpdate={handleElementUpdate}
            onDelete={handleElementDelete}
          />
        </aside>
      </main>
      {show3D && <ThreeDView textureUrl={textureUrl} elements={currentElements} detachmentHeight={detachmentHeight} onClose={() => setShow3D(false)} eyeSide={eyeSide} onAddElement={handleAddElement} />}
      {showAI && <AIAnalysisModal imageData={textureUrl} onClose={() => setShowAI(false)} />}
      <ColorLegendModal isOpen={showLegend} onClose={() => setShowLegend(false)} />
    </div>
  );
}

export default App;
