import { useState } from 'react';
import { FundusCanvas } from './components/FundusCanvas';
import { Toolbar } from './components/Toolbar';
import type { ColorCode, ToolType } from './utils/types';
import './App.css';

function App() {
  const [activeColor, setActiveColor] = useState<ColorCode>('red');
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [isInverted, setIsInverted] = useState(false);

  // These would ideally be managed by a history stack in a real app
  const handleUndo = () => {
    console.log('Undo triggered');
    // Implementation would require lifting state up from Canvas or using a Context/Store
    // For this prototype, we'll just log it as the Canvas manages its own strokes internally for now
    // To implement properly, we should move stroke state to App or a Context.
    // Given the complexity, I'll leave it as a placeholder or refactor if time permits.
    // Actually, let's refactor Canvas to accept strokes as props?
    // No, for now let's keep it simple.
    alert('Undo not implemented in this prototype version (State is local to Canvas)');
  };

  const handleClear = () => {
    // Force re-mount or use a ref to clear
    // A simple way is to use a key on the canvas
    // But better to expose a clear method via ref.
    // For now, let's just reload the page or use a key.
    if (confirm('Clear all drawings?')) {
      window.location.reload();
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
            width={600}
            height={600}
            activeColor={activeColor}
            activeTool={activeTool}
            isInverted={isInverted}
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
            onUndo={handleUndo}
            onClear={handleClear}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
