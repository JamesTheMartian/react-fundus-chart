import { Pen, Brush, Grid, Eraser, PaintBucket, MousePointer } from 'lucide-react';
import type { ColorCode, ToolType, EyeSide, PathologyType } from '../../utils/types';
import type { AutoSaveState } from '../../api/types';

export interface ToolbarProps {
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
    setShowSettingsMobile: (show: boolean) => void;
    setShowSettings: (show: boolean) => void;
    // New: Auth & Data Management
    onLoginClick: () => void;
    onSaveChart: () => void;
    onOpenCharts: () => void;
    onOpenPatients: () => void;
    onShareChart: () => void;
    autoSaveStatus: AutoSaveState['status'];
    autoSaveLastSaved: string | null;
    currentChartName: string;
    isDark: boolean;
}

export const TOOLS = [
    { id: 'select', icon: MousePointer, title: 'Select', shortcut: '1' },
    { id: 'pen', icon: Pen, title: 'Pen', shortcut: '2' },
    { id: 'brush', icon: Brush, title: 'Brush', shortcut: '3' },
    { id: 'pattern', icon: Grid, title: 'Pattern', shortcut: '4' },
    { id: 'fill', icon: PaintBucket, title: 'Fill Shape', shortcut: '5' },
    { id: 'eraser', icon: Eraser, title: 'Eraser', shortcut: '6' }
];
