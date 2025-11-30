export type ToolType = 'pen' | 'brush' | 'pattern' | 'eraser';
export type EyeSide = 'OD' | 'OS'; // OD = Right Eye, OS = Left Eye

export type ColorCode =
  | 'red'    // Arterioles, Attached Retina, Hemorrhages, Neovascularization
  | 'blue'   // Detached Retina, Veins, Lattice Degeneration
  | 'green'  // Vitreous Opacities, Hemorrhage, Foreign Bodies
  | 'brown'  // Choroidal/Uveal tissue, Pigment
  | 'yellow' // Exudates, Edema, Drusen
  | 'black'; // Sclerosed vessels, Scars

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: ColorCode;
  width: number;
  toolType: ToolType;
  timestamp: number;
  pathology?: PathologyType;
}

export interface CanvasState {
  strokes: Stroke[];
  viewMode: 'standard' | 'inverted';
}

export const MEDICAL_COLORS: Record<ColorCode, string> = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#008000',
  brown: '#8B4513',
  yellow: '#FFFF00',
  black: '#000000',
};

export const TOOL_DESCRIPTIONS: Record<ColorCode, string> = {
  red: 'Arterioles, Attached Retina, Hemorrhages',
  blue: 'Detached Retina, Veins, Lattice',
  green: 'Vitreous Opacities, Hemorrhage',
  brown: 'Choroidal/Uveal tissue, Pigment',
  yellow: 'Exudates, Edema, Drusen',
  black: 'Sclerosed vessels, Scars',
};

export type PathologyType = 'normal' | 'hemorrhage' | 'tear' | 'detachment' | 'hole' | 'drusen' | 'cotton_wool' | 'hard_exudate' | 'edema' | 'lattice';

export interface PathologyPreset {
  label: string;
  color: ColorCode;
  tool: ToolType;
  width: number;
}

export const PATHOLOGY_PRESETS: Record<PathologyType, PathologyPreset> = {
  normal: { label: 'Normal Drawing', color: 'black', tool: 'pen', width: 2 },
  hemorrhage: { label: 'Hemorrhage', color: 'red', tool: 'brush', width: 15 },
  tear: { label: 'Retinal Tear', color: 'red', tool: 'pen', width: 3 },
  detachment: { label: 'Retinal Detachment', color: 'blue', tool: 'brush', width: 20 },
  hole: { label: 'Retinal Hole', color: 'red', tool: 'pen', width: 2 },
  drusen: { label: 'Drusen', color: 'yellow', tool: 'pen', width: 2 }, // Often dots
  cotton_wool: { label: 'Cotton Wool Spot', color: 'yellow', tool: 'brush', width: 10 },
  hard_exudate: { label: 'Hard Exudate', color: 'yellow', tool: 'pen', width: 3 },
  edema: { label: 'Edema', color: 'yellow', tool: 'brush', width: 15 },
  lattice: { label: 'Lattice Degeneration', color: 'blue', tool: 'pattern', width: 4 },
};
