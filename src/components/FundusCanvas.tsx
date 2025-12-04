import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { Stroke, ColorCode, ToolType, Point, EyeSide, PathologyType } from '../utils/types';
import { MEDICAL_COLORS } from '../utils/types';
import './FundusCanvas.css';

export interface FundusCanvasRef {
    exportImage: () => void;
    getDataURL: () => string;
    getStrokes: () => Stroke[];
    undo: () => void;
    redo: () => void;
    clear: () => void;
}

interface FundusCanvasProps {
    width: number;
    height: number;
    activeColor: ColorCode;
    activeTool: ToolType;
    brushSize: number;
    activePathology: PathologyType;
    isInverted: boolean;
    eyeSide: EyeSide;
    onUndo?: () => void;
    onClear?: () => void;
}

const CIRCLES = {
    EQUATOR: 0.6,
    ORA_SERRATA: 0.8,
    PARS_PLANA: 1.0
};

export const FundusCanvas = forwardRef<FundusCanvasRef, FundusCanvasProps>(({
    width,
    height,
    activeColor,
    activeTool,
    brushSize,
    activePathology,
    isInverted,
    eyeSide,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    const drawBackground = (ctx: CanvasRenderingContext2D, center: Point, radius: number, inverted: boolean) => {
        ctx.save();

        // If inverted, we rotate the entire context for the background drawing
        if (inverted) {
            ctx.translate(center.x, center.y);
            ctx.rotate(Math.PI);
            ctx.translate(-center.x, -center.y);
        }

        ctx.strokeStyle = '#e5e7eb'; // Light gray for grid
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ffffff';

        // Clear background
        ctx.fillRect(0, 0, width, height);

        // Draw Concentric Circles
        [CIRCLES.EQUATOR, CIRCLES.ORA_SERRATA, CIRCLES.PARS_PLANA].forEach(ratio => {
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius * ratio, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw Radial Lines (Clock Hours)
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            const startR = radius * 0.4; // Don't start exactly at center to keep fovea clear
            const endR = radius * CIRCLES.PARS_PLANA;

            ctx.beginPath();
            ctx.moveTo(center.x + Math.cos(angle) * startR, center.y + Math.sin(angle) * startR);
            ctx.lineTo(center.x + Math.cos(angle) * endR, center.y + Math.sin(angle) * endR);
            ctx.stroke();

            // Labels
            // 0 is 3 o'clock in canvas arc, but we want standard clock.
            // Actually standard clock: 12 is -90deg.
            // Let's just place numerals.
            // i=0 -> 0 deg -> 3 o'clock (III)
            // i=1 -> 30 deg -> 4 o'clock (IV)
            // ...
            // We need standard clock positions.
            // 12 -> -90 deg
            // 1 -> -60 deg
            // ...
        }

        // Draw Roman Numerals
        const romanNumerals = ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'I', 'II'];
        romanNumerals.forEach((num, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const labelR = radius * 1.05;
            const x = center.x + Math.cos(angle) * labelR;
            const y = center.y + Math.sin(angle) * labelR;

            // Save context to rotate text back so it's upright?
            // Or just draw it. If canvas is rotated, text is rotated too.
            // For inverted view, we usually want the chart rotated, so text being rotated is correct (it's upside down).
            ctx.fillText(num, x, y);
        });


        // Fovea (Center)
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(center.x - 5, center.y);
        ctx.lineTo(center.x + 5, center.y);
        ctx.moveTo(center.x, center.y - 5);
        ctx.lineTo(center.x, center.y + 5);
        ctx.stroke();

        // Optic Disc
        // OD (Right Eye): Nasal is Right (3 o'clock)
        // OS (Left Eye): Nasal is Left (9 o'clock)
        // In standard view:
        // OD -> 3 o'clock -> 0 radians
        // OS -> 9 o'clock -> PI radians

        const discAngle = eyeSide === 'OD' ? 0 : Math.PI;
        const discDist = radius * 0.8;

        const discX = center.x - 20 + Math.cos(discAngle) * discDist;
        const discY = center.y - 20 + Math.sin(discAngle) * discDist;

        ctx.beginPath();
        ctx.ellipse(discX, discY, 30, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffecb3'; // Light yellow
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000'; // Reset

        ctx.restore();
    };

    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke, inverted: boolean) => {
        if (stroke.points.length < 2) return;

        ctx.save();

        // Handle Eraser
        if (stroke.toolType === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = stroke.width * 2; // Eraser is usually thicker
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = MEDICAL_COLORS[stroke.color];
            ctx.lineWidth = stroke.width;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const center = { x: width / 2, y: height / 2 };

        if (inverted) {
            ctx.translate(center.x, center.y);
            ctx.rotate(Math.PI);
            ctx.translate(-center.x, -center.y);
        }

        if (stroke.toolType === 'pen' || stroke.toolType === 'brush' || stroke.toolType === 'eraser') {
            if (stroke.toolType === 'brush') {
                ctx.globalAlpha = 0.5; // Semi-transparent for fills
                ctx.lineWidth = stroke.width * 2;
            } else if (stroke.toolType === 'eraser') {
                ctx.globalAlpha = 1.0;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        } else if (stroke.toolType === 'pattern') {
            ctx.beginPath();
            // Simple pattern: Dotted line for now
            ctx.setLineDash([5, 5]);
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (stroke.toolType === 'fill') {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = MEDICAL_COLORS[stroke.color];
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke(); // Optional: Draw border as well
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();
    };

    useImperativeHandle(ref, () => ({
        exportImage: () => {
            // Create a temporary canvas for the final composition
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;

            const center = { x: width / 2, y: height / 2 };
            const radius = Math.min(width, height) / 2 - 20;

            // 1. Draw Background (White + Grid) on the main context
            // This ensures the base is white, not transparent
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, width, height);
            drawBackground(tempCtx, center, radius, false);

            // 2. Draw Strokes on a separate "layer" canvas
            // This allows 'destination-out' (eraser) to only erase strokes, not the background
            const strokeCanvas = document.createElement('canvas');
            strokeCanvas.width = width;
            strokeCanvas.height = height;
            const strokeCtx = strokeCanvas.getContext('2d');

            if (strokeCtx) {
                strokes.forEach(s => drawStroke(strokeCtx, s, false));

                // 3. Composite the strokes layer onto the main context
                tempCtx.drawImage(strokeCanvas, 0, 0);
            }

            // Create a temporary link to download
            const link = document.createElement('a');
            link.download = `fundus-chart-${eyeSide}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
        },
        getDataURL: () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return '';

            const center = { x: width / 2, y: height / 2 };
            const radius = Math.min(width, height) / 2 - 20;

            // 1. Draw Background
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, width, height);
            drawBackground(tempCtx, center, radius, false);

            // 2. Draw Strokes on separate layer
            const strokeCanvas = document.createElement('canvas');
            strokeCanvas.width = width;
            strokeCanvas.height = height;
            const strokeCtx = strokeCanvas.getContext('2d');

            if (strokeCtx) {
                strokes.forEach(s => drawStroke(strokeCtx, s, false));
                // 3. Composite
                tempCtx.drawImage(strokeCanvas, 0, 0);
            }

            return tempCanvas.toDataURL('image/png');
        },
        getStrokes: () => strokes,
        undo: () => {
            setStrokes(prev => {
                if (prev.length === 0) return prev;
                const newStrokes = [...prev];
                const lastStroke = newStrokes.pop();
                if (lastStroke) {
                    setRedoStack(stack => [...stack, lastStroke]);
                }
                return newStrokes;
            });
        },
        redo: () => {
            setRedoStack(prev => {
                if (prev.length === 0) return prev;
                const newStack = [...prev];
                const strokeToRestore = newStack.pop();
                if (strokeToRestore) {
                    setStrokes(strokes => [...strokes, strokeToRestore]);
                }
                return newStack;
            });
        },
        clear: () => {
            // Optional: Save current state to history before clearing if we want "Undo Clear"
            // For now, simple clear
            setStrokes([]);
            setRedoStack([]);
        }
    }));

    useEffect(() => {
        // Debugging undo/redo stacks
        // console.log('Strokes:', strokes.length, 'RedoStack:', redoStack.length);
    }, [strokes, redoStack]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const center = { x: width / 2, y: height / 2 };
        const radius = Math.min(width, height) / 2 - 20; // Padding

        // Clear and Draw
        ctx.clearRect(0, 0, width, height);

        // Step 1: Draw Background on Main Canvas
        // Background is always source-over
        ctx.globalCompositeOperation = 'source-over';
        drawBackground(ctx, center, radius, isInverted);

        // Step 2: Draw Strokes on Offscreen Canvas
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = width;
        layerCanvas.height = height;
        const layerCtx = layerCanvas.getContext('2d');

        if (layerCtx) {
            strokes.forEach(s => drawStroke(layerCtx, s, isInverted));
            if (currentStroke) {
                drawStroke(layerCtx, currentStroke, isInverted);
            }
            // Step 3: Composite Layer onto Main
            ctx.drawImage(layerCanvas, 0, 0);
        }

    }, [width, height, isInverted, strokes, currentStroke, eyeSide]);

    const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const screenX = (clientX - rect.left) * scaleX;
        const screenY = (clientY - rect.top) * scaleY;

        // Convert Screen Coordinates -> Chart Coordinates
        // If Inverted: Rotate 180 around center.
        const center = { x: width / 2, y: height / 2 };

        if (isInverted) {
            // Rotate (screenX, screenY) 180 deg around (centerX, centerY)
            // x' = cx - (x - cx)
            // y' = cy - (y - cy)
            return {
                x: center.x - (screenX - center.x),
                y: center.y - (screenY - center.y)
            };
        }

        return { x: screenX, y: screenY };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling on touch
        const point = getCanvasPoint(e);

        // Clear redo stack on new action
        setRedoStack([]);

        setCurrentStroke({
            id: Date.now().toString(),
            points: [point],
            color: activeColor,
            width: brushSize,
            toolType: activeTool,
            pathology: activePathology,
            timestamp: Date.now()
        });
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!currentStroke) return;
        e.preventDefault();
        const point = getCanvasPoint(e);
        setCurrentStroke(prev => prev ? {
            ...prev,
            points: [...prev.points, point]
        } : null);
    };

    const handleEnd = () => {
        if (currentStroke) {
            setStrokes(prev => [...prev, currentStroke]);
            setCurrentStroke(null);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="fundus-canvas"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        />
    );
});
