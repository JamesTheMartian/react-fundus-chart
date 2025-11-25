export type ToolType = 'pen' | 'brush' | 'pattern';

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
