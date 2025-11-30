import { useState, useRef } from 'react';
import { FundusCanvas } from './components/FundusCanvas';
import type { FundusCanvasRef } from './components/FundusCanvas';
import { Toolbar } from './components/Toolbar';
import { ThreeDView } from './components/ThreeDView';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ColorLegendModal } from './components/ColorLegendModal';
import type { ColorCode, ToolType, EyeSide, PathologyType } from './utils/types';
import { PATHOLOGY_PRESETS } from './utils/types';
import './App.css';

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
  const [currentStrokes, setCurrentStrokes] = useState<any[]>([]);

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
        setCurrentStrokes(canvasRef.current.getStrokes());
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Retinal Fundus Charting</h1>
        <p>Amsler-Dubois Standard</p>
      </header>

      <main className="main-content">
        <div className="canvas-wrapper">
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
          />
        </div>

        <aside className="sidebar">
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
      </main>
      {show3D && <ThreeDView textureUrl={textureUrl} strokes={currentStrokes} detachmentHeight={detachmentHeight} onClose={() => setShow3D(false)} />}
      {showAI && <AIAnalysisModal imageData={textureUrl} onClose={() => setShowAI(false)} />}
      <ColorLegendModal isOpen={showLegend} onClose={() => setShowLegend(false)} />
    </div>
  );
}

export default App;
