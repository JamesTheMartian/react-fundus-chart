/**
 * Shared Canvas Rendering Utilities
 * 
 * Provides consistent element rendering for both:
 * - FundusCanvas (2D interactive canvas)
 * - ThreeDView (3D texture generation)
 */

import type { FundusElement, Point } from './types';
import { MEDICAL_COLORS } from './types';

// ============================================================================
// Types
// ============================================================================

export interface RenderOptions {
  /** Background color (e.g., '#ffffff' for chart, '#f4acacff' for retina) */
  backgroundColor: string;
  /** Canvas size in pixels */
  canvasSize: number;
  /** Scale factor from source coordinates (default: canvasSize / 600) */
  scale?: number;
}

// ============================================================================
// Element Rendering
// ============================================================================

/**
 * Render a single FundusElement to a canvas context.
 * 
 * @param ctx - Canvas 2D rendering context
 * @param element - The element to render
 * @param options - Rendering options
 */
export function renderElement(
  ctx: CanvasRenderingContext2D,
  element: FundusElement,
  options: RenderOptions
): void {
  if (!element.visible) return;
  if (element.type === 'stroke' && (!element.points || element.points.length < 2)) return;

  const scale = options.scale ?? options.canvasSize / 600;
  const width = (element.width || 2) * scale;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;

  const color = MEDICAL_COLORS[element.color];

  // Handle Eraser - draws with background color
  if (element.toolType === 'eraser') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = options.backgroundColor;
    ctx.fillStyle = options.backgroundColor;
    ctx.lineWidth = width * 2;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
  }

  if (element.type === 'stroke' && element.points) {
    renderStroke(ctx, element, scale);
  } else if ((element.type === 'hemorrhage' || element.type === 'spot') && element.position) {
    renderShape(ctx, element, scale);
  }

  ctx.restore();
}

/**
 * Render a stroke element (pen, brush, pattern, fill)
 */
function renderStroke(
  ctx: CanvasRenderingContext2D,
  element: FundusElement,
  scale: number
): void {
  if (!element.points) return;

  if (element.toolType === 'pattern') {
    ctx.setLineDash([5 * scale, 10 * scale]);
    drawPath(ctx, element.points, scale, 'stroke');
    ctx.setLineDash([]);
  } else if (element.toolType === 'fill') {
    ctx.globalAlpha = 0.5;
    drawPath(ctx, element.points, scale, 'fill');
    ctx.globalAlpha = 1.0;
  } else if (element.toolType === 'brush') {
    // Brush: thicker stroke with transparency
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = ((element.width || 2) * scale) * 2;
    drawPath(ctx, element.points, scale, 'stroke');
  } else {
    // Pen / default
    drawPath(ctx, element.points, scale, 'stroke');
  }
}

/**
 * Draw a path from points, handling null breaks
 */
function drawPath(
  ctx: CanvasRenderingContext2D,
  points: (Point | null)[],
  scale: number,
  mode: 'stroke' | 'fill'
): void {
  ctx.beginPath();
  let isFirst = true;

  for (const p of points) {
    if (!p) {
      // Null indicates a break - finish current path and start new
      if (mode === 'fill') {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.stroke();
      }
      ctx.beginPath();
      isFirst = true;
      continue;
    }

    const x = p.x * scale;
    const y = p.y * scale;

    if (isFirst) {
      ctx.moveTo(x, y);
      isFirst = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

  // Finish the final path segment
  if (mode === 'fill') {
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.stroke();
  }
}

/**
 * Render a shape element (hemorrhage, spot)
 */
function renderShape(
  ctx: CanvasRenderingContext2D,
  element: FundusElement,
  scale: number
): void {
  if (!element.position) return;

  ctx.beginPath();
  ctx.ellipse(
    element.position.x * scale,
    element.position.y * scale,
    ((element.width || 10) / 2) * scale,
    ((element.height || 10) / 2) * scale,
    element.rotation || 0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ============================================================================
// Canvas Generation
// ============================================================================

/**
 * Render all elements to a new canvas.
 * Used by ThreeDView to generate textures.
 * 
 * @param elements - Array of FundusElements to render
 * @param options - Rendering options
 * @returns Canvas with rendered elements
 */
export function renderElementsToCanvas(
  elements: FundusElement[],
  options: RenderOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = options.canvasSize;
  canvas.height = options.canvasSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to get 2D context for rendering');
    return canvas;
  }

  // Fill background
  ctx.fillStyle = options.backgroundColor;
  ctx.fillRect(0, 0, options.canvasSize, options.canvasSize);

  // Render all elements in order
  elements.forEach(element => {
    renderElement(ctx, element, options);
  });

  return canvas;
}
