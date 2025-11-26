import { useState, useRef } from 'react';
import { FundusCanvas } from './components/FundusCanvas';
import type { FundusCanvasRef } from './components/FundusCanvas';
import { Toolbar } from './components/Toolbar';
import type { ColorCode, ToolType, EyeSide } from './utils/types';
import './App.css';

function App() {
  const [activeColor, setActiveColor] = useState<ColorCode>('red');
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [isInverted, setIsInverted] = useState(false);
  const [eyeSide, setEyeSide] = useState<EyeSide>('OD');

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
            isInverted={isInverted}
            toggleInverted={() => setIsInverted(!isInverted)}
            eyeSide={eyeSide}
            setEyeSide={setEyeSide}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onDownload={handleDownload}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
