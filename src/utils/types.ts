export type ToolType = 'pen' | 'brush' | 'pattern' | 'eraser' | 'fill' | 'select';
export type EyeSide = 'OD' | 'OS'; // OD = Right Eye, OS = Left Eye
export type GraphicsQuality = 'low' | 'medium' | 'high'; // For 3D shader performance settings

export type ColorCode =
  | 'red'    // Arterioles, Attached Retina, Hemorrhages, Neovascularization
  | 'blue'   // Detached Retina, Veins, Lattice Degeneration
  | 'green'  // Vitreous Opacities, Hemorrhage, Foreign Bodies
  | 'brown'  // Choroidal/Uveal tissue, Pigment
  | 'yellow' // Exudates, Edema, Drusen
  | 'black'  // Sclerosed vessels, Scars
  | 'pink';  // Normal/General annotations

export interface Point {
  x: number;
  y: number;
}

export type ElementType = 'stroke' | 'hemorrhage' | 'tear' | 'spot' | 'circle';

export interface FundusElement {
  id: string;
  type: ElementType;
  points?: (Point | null)[]; // For strokes, null indicates a break (new stroke in same layer)
  position?: Point; // For shapes (center)
  radius?: number; // For circles
  width?: number; // For ellipses/strokes
  height?: number; // For ellipses
  rotation?: number;
  color: ColorCode;
  toolType?: ToolType; // Keep for backward compatibility/stroke rendering
  visible: boolean;
  layer: string; // 'retina', 'vitreous', etc.
  zDepth?: number; // For 3D positioning (0 = retina, >0 = vitreous)
  pathology?: PathologyType;
  timestamp: number;
  name?: string;
  description?: string;
  locked?: boolean;
}

export interface Stroke extends FundusElement {
  type: 'stroke';
  points: (Point | null)[];
}

export interface CanvasState {
  strokes: Stroke[];
  viewMode: 'standard' | 'inverted';
}

export const MEDICAL_COLORS: Record<ColorCode, string> = {
  red: '#FF0000',
  blue: '#468ff5ff',
  green: '#008000',
  brown: '#8B4513',
  yellow: '#FFFF00',
  black: '#000000',
  pink: '#dea6bdff',
};

export const TOOL_DESCRIPTIONS: Record<ColorCode, string> = {
  red: 'Arterioles, Attached Retina, Hemorrhages',
  blue: 'Detached Retina, Veins, Lattice',
  green: 'Vitreous Opacities, Hemorrhage',
  brown: 'Choroidal/Uveal tissue, Pigment',
  yellow: 'Exudates, Edema, Drusen',
  black: 'Sclerosed vessels, Scars',
  pink: 'Normal/General annotations',
};

export type PathologyType = 'normal' | 'hemorrhage' | 'vitreous_hemorrhage' | 'tear' | 'detachment' | 'hole' | 'drusen' | 'cotton_wool' | 'hard_exudate' | 'edema' | 'lattice';

export interface PathologyPreset {
  label: string;
  color: ColorCode;
  tool: ToolType;
  width: number;
}

export const PATHOLOGY_PRESETS: Record<PathologyType, PathologyPreset> = {
  hemorrhage: { label: 'Hemorrhage', color: 'red', tool: 'pen', width: 5 },
  vitreous_hemorrhage: { label: 'Vitreous Hemorrhage', color: 'green', tool: 'brush', width: 30 },
  tear: { label: 'Retinal Tear', color: 'red', tool: 'pen', width: 5 },
  detachment: { label: 'Retinal Detachment', color: 'blue', tool: 'brush', width: 20 },
  hole: { label: 'Retinal Hole', color: 'red', tool: 'pen', width: 10 },
  drusen: { label: 'Drusen', color: 'yellow', tool: 'pen', width: 2 }, // Often dots
  cotton_wool: { label: 'Cotton Wool Spot', color: 'yellow', tool: 'brush', width: 5 },
  hard_exudate: { label: 'Hard Exudate', color: 'yellow', tool: 'pen', width: 3 },
  edema: { label: 'Edema', color: 'yellow', tool: 'brush', width: 15 },
  lattice: { label: 'Lattice Degeneration', color: 'blue', tool: 'pattern', width: 4 },
  normal: { label: 'Normal', color: 'pink', tool: 'pen', width: 2 },
};
