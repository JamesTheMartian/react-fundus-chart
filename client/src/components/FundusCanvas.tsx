import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { FundusElement, ColorCode, ToolType, Point, EyeSide, PathologyType } from '../utils/types';
import { MEDICAL_COLORS, PATHOLOGY_PRESETS } from '../utils/types';
// import './FundusCanvas.css'; // Removed for Tailwind migration

export interface FundusCanvasRef {
    exportImage: () => void;
    getDataURL: () => string;
    getStrokes: () => FundusElement[];
    addElement: (element: FundusElement) => void;
    undo: () => void;
    redo: () => void;
    clear: () => void;
    updateElement: (id: string, updates: Partial<FundusElement>) => void;
    deleteElement: (id: string) => void;
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
    onElementsChange?: (elements: FundusElement[]) => void;
    onSelectionChange?: (id: string | null) => void;
    selectedElementId?: string | null;
    disabled?: boolean;
    disableContextRotation?: boolean;
    vesselOpacity?: number;
    className?: string;
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
    onElementsChange,
    onSelectionChange,
    selectedElementId: propSelectedElementId,
    disabled = false,
    disableContextRotation = false,
    vesselOpacity = 0,
    className = '',
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<FundusElement[]>([]);
    const [redoStack, setRedoStack] = useState<FundusElement[]>([]);
    const [currentElement, setCurrentElement] = useState<FundusElement | null>(null);
    const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
    const vesselMapRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        // Use BASE_URL to handle deployment subpaths
        const baseUrl = import.meta.env.BASE_URL;
        // Remove trailing slash from base if present to avoid double slashes if path starts with /
        // Actually BASE_URL usually ends with / if set.
        // Let's be safe:
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        img.src = `${cleanBase}/textures/vessel_map.png`;

        img.onload = () => {
            vesselMapRef.current = img;
            setVesselMapLoaded(true);
        };
        img.onerror = (e) => {
            console.error('Failed to load vessel map:', img.src, e);
        };
    }, []);
    const [vesselMapLoaded, setVesselMapLoaded] = useState(false);

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

        // Draw Vessel Map Overlay
        if (vesselOpacity > 0 && vesselMapRef.current) {
            ctx.save();
            ctx.globalAlpha = vesselOpacity;
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            ctx.clip();
            // If eyeSide is OS, invert the image
            if (eyeSide === 'OD') {
                ctx.drawImage(vesselMapRef.current, center.x - radius, center.y - radius, radius * 2, radius * 2);
            }
            else {
                // draw image must be flipped
                ctx.save();
                ctx.translate(center.x, center.y);
                ctx.scale(-1, 1);
                ctx.drawImage(vesselMapRef.current, -radius, -radius, radius * 2, radius * 2);
                ctx.restore();
            }
            ctx.restore();
        }

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
        const discDist = radius * 0.3;

        const discX = center.x - (eyeSide === 'OD' ? 15 : -15) + Math.cos(discAngle) * discDist;
        const discY = center.y - 10 + Math.sin(discAngle) * discDist;

        ctx.beginPath();
        ctx.ellipse(discX, discY, 15, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#dd708aff'; // Light yellow
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    // Helper to check if a point is inside the optic disc region
    const isPointInOpticDisc = (point: Point): boolean => {
        const center = { x: width / 2, y: height / 2 };
        const radius = Math.min(width, height) / 2 - 20;

        const discAngle = eyeSide === 'OD' ? 0 : Math.PI;
        const discDist = radius * 0.3;

        const discX = center.x - (eyeSide === 'OD' ? 15 : -15) + Math.cos(discAngle) * discDist;
        const discY = center.y - 10 + Math.sin(discAngle) * discDist;
        const discRadius = 15; // Same as in drawBackground

        const dx = point.x - discX;
        const dy = point.y - discY;
        return (dx * dx + dy * dy) <= (discRadius * discRadius);
    };

    const isPointInElement = (point: Point, element: FundusElement): boolean => {
        if (element.type === 'stroke') {
            if (!element.points) return false;
            // Check distance to any point in the stroke
            // Optimization: Check bounding box first?
            // For now, simple distance check
            const threshold = (element.width || 2) + 5; // Hit radius
            return element.points.some(p => {
                if (!p) return false;
                const dx = p.x - point.x;
                const dy = p.y - point.y;
                return Math.sqrt(dx * dx + dy * dy) < threshold;
            });
        } else if (element.type === 'hemorrhage' || element.type === 'spot') {
            if (!element.position) return false;
            const dx = element.position.x - point.x;
            const dy = element.position.y - point.y;
            const rx = (element.width || 10) / 2;
            const ry = (element.height || 10) / 2;
            // Ellipse equation: (x^2/a^2) + (y^2/b^2) <= 1
            // Ignoring rotation for hit detection simplicity for now
            return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
        }
        return false;
    };

    const drawElement = (ctx: CanvasRenderingContext2D, element: FundusElement, inverted: boolean) => {
        if (element.type === 'stroke' && (!element.points || element.points.length < 2)) return;

        ctx.save();

        const width = element.width || 2;
        const color = MEDICAL_COLORS[element.color];

        // Handle Eraser
        if (element.toolType === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = width * 2;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = width;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const center = { x: 600 / 2, y: 600 / 2 }; // Assuming 600x600 for now, or use props

        if (inverted) {
            ctx.translate(center.x, center.y);
            ctx.rotate(Math.PI);
            ctx.translate(-center.x, -center.y);
        }

        // Vitreous Layer Handling
        if (element.layer === 'vitreous') {
            ctx.globalAlpha = 0.4;
            ctx.filter = 'blur(4px)';
        } else {
            ctx.globalAlpha = 1.0;
            ctx.filter = 'none';
        }

        if (element.type === 'stroke') {
            // Brush strokes handled with buffer approach to prevent self-overlap darkening
            // The caller (render loop) handles this by drawing brush strokes on a separate buffer
            const isBrush = element.toolType === 'brush';
            if (isBrush) {
                // For brush: draw at full opacity here, alpha is applied when compositing the buffer
                ctx.globalAlpha = 1.0;
                ctx.lineWidth = (width || 2) * 2;
            }

            if (element.points) {
                if (element.toolType === 'pattern') {
                    ctx.beginPath();
                    // Simple pattern: Dotted line for now
                    ctx.setLineDash([5, 10]);

                    let isFirst = true;
                    for (const p of element.points) {
                        if (!p) {
                            ctx.stroke();
                            ctx.beginPath();
                            isFirst = true;
                            continue;
                        }
                        if (isFirst) {
                            ctx.moveTo(p.x, p.y);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x, p.y);
                        }
                    }
                    ctx.stroke();
                }
                else if (element.toolType === 'fill') {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = MEDICAL_COLORS[element.color];

                    let currentPath: Point[] = [];
                    const drawFill = (pts: Point[]) => {
                        if (pts.length < 2) return;
                        ctx.beginPath();
                        ctx.moveTo(pts[0].x, pts[0].y);
                        for (let i = 1; i < pts.length; i++) {
                            ctx.lineTo(pts[i].x, pts[i].y);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    };

                    for (const p of element.points) {
                        if (!p) {
                            drawFill(currentPath);
                            currentPath = [];
                        } else {
                            currentPath.push(p);
                        }
                    }
                    drawFill(currentPath);
                    ctx.globalAlpha = 1.0;
                }
                else {
                    ctx.beginPath();
                    let isFirst = true;
                    for (const p of element.points) {
                        if (!p) {
                            ctx.stroke();
                            ctx.beginPath();
                            isFirst = true;
                            continue;
                        }
                        if (isFirst) {
                            ctx.moveTo(p.x, p.y);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x, p.y);
                        }
                    }
                    ctx.stroke();
                }
            }

        } else if (element.type === 'hemorrhage' || element.type === 'spot') {
            if (element.position) {
                ctx.beginPath();
                ctx.ellipse(element.position.x, element.position.y, (element.width || 10) / 2, (element.height || 10) / 2, element.rotation || 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Selection/Hover Outline
        if (element.id === selectedElementId || element.id === hoveredElementId) {
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            ctx.lineWidth = (width || 2) + 4;
            ctx.strokeStyle = element.id === selectedElementId ? '#2563eb' : '#0ea5e9'; // Blue for select, Sky for hover
            ctx.setLineDash([5, 5]);

            if (element.type === 'stroke' && element.points) {
                ctx.beginPath();
                let isFirst = true;
                for (const p of element.points) {
                    if (!p) {
                        ctx.stroke();
                        ctx.beginPath();
                        isFirst = true;
                        continue;
                    }
                    if (isFirst) {
                        ctx.moveTo(p.x, p.y);
                        isFirst = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke();
            } else if ((element.type === 'hemorrhage' || element.type === 'spot') && element.position) {
                ctx.beginPath();
                ctx.ellipse(element.position.x, element.position.y, (element.width || 10) / 2 + 2, (element.height || 10) / 2 + 2, element.rotation || 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.setLineDash([]);
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
                elements.forEach(s => drawElement(strokeCtx, s, false));

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
                elements.forEach(s => drawElement(strokeCtx, s, false));
                // 3. Composite
                tempCtx.drawImage(strokeCanvas, 0, 0);
            }

            return tempCanvas.toDataURL('image/png');
        },
        getStrokes: () => elements,
        addElement: (element: FundusElement) => {
            setElements(prev => [...prev, element]);
        },
        undo: () => {
            setElements(prev => {
                if (prev.length === 0) return prev;
                const newElements = [...prev];
                const lastElement = newElements.pop();
                if (lastElement) {
                    setRedoStack(stack => [...stack, lastElement]);
                }
                return newElements;
            });
        },
        redo: () => {
            setRedoStack(prev => {
                if (prev.length === 0) return prev;
                const newStack = [...prev];
                const elementToRestore = newStack.pop();
                if (elementToRestore) {
                    setElements(elements => [...elements, elementToRestore]);
                }
                return newStack;
            });
        },
        clear: () => {
            // Optional: Save current state to history before clearing if we want "Undo Clear"
            // For now, simple clear
            setElements([]);
            setRedoStack([]);
        },
        updateElement: (id: string, updates: Partial<FundusElement>) => {
            setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
        },
        deleteElement: (id: string) => {
            setElements(prev => prev.filter(el => el.id !== id));
            if (selectedElementId === id) setSelectedElementId(null);
        }
    }));

    useEffect(() => {
        // Debugging undo/redo stacks
        // console.log('Strokes:', strokes.length, 'RedoStack:', redoStack.length);
        if (onElementsChange) {
            onElementsChange(elements);
        }
    }, [elements, redoStack, onElementsChange]);

    useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(selectedElementId);
        }
    }, [selectedElementId, onSelectionChange]);

    useEffect(() => {
        if (propSelectedElementId !== undefined) {
            setSelectedElementId(propSelectedElementId);
        }
    }, [propSelectedElementId]);

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
        const shouldRotateContext = isInverted && !disableContextRotation;
        drawBackground(ctx, center, radius, shouldRotateContext);

        // Step 2: Draw Strokes on Offscreen Canvas
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = width;
        layerCanvas.height = height;
        const layerCtx = layerCanvas.getContext('2d');

        if (layerCtx) {
            // Separate brush strokes from other elements for buffer-based rendering
            const brushElements = elements.filter(s => s.toolType === 'brush');
            const otherElements = elements.filter(s => s.toolType !== 'brush');

            // Draw non-brush elements directly
            otherElements.forEach(s => {
                drawElement(layerCtx, s, shouldRotateContext);
            });

            // Draw brush elements on a separate buffer, then composite with alpha
            if (brushElements.length > 0) {
                const brushBuffer = document.createElement('canvas');
                brushBuffer.width = width;
                brushBuffer.height = height;
                const brushCtx = brushBuffer.getContext('2d');
                if (brushCtx) {
                    brushElements.forEach(s => {
                        drawElement(brushCtx, s, shouldRotateContext);
                    });
                    // Composite brush buffer with 0.5 opacity (or vitreous 0.3)
                    layerCtx.globalAlpha = 0.5;
                    layerCtx.drawImage(brushBuffer, 0, 0);
                    layerCtx.globalAlpha = 1.0;
                }
            }

            // Draw current element
            if (currentElement) {
                if (currentElement.toolType === 'brush') {
                    // Draw current brush stroke on its own buffer
                    const currentBrushBuffer = document.createElement('canvas');
                    currentBrushBuffer.width = width;
                    currentBrushBuffer.height = height;
                    const currentBrushCtx = currentBrushBuffer.getContext('2d');
                    if (currentBrushCtx) {
                        drawElement(currentBrushCtx, currentElement, shouldRotateContext);
                        layerCtx.globalAlpha = currentElement.layer === 'vitreous' ? 0.3 : 0.5;
                        layerCtx.drawImage(currentBrushBuffer, 0, 0);
                        layerCtx.globalAlpha = 1.0;
                    }
                } else {
                    drawElement(layerCtx, currentElement, shouldRotateContext);
                }
            }
            // Step 3: Composite Layer onto Main
            ctx.drawImage(layerCanvas, 0, 0);
        }

    }, [width, height, isInverted, elements, currentElement, eyeSide, hoveredElementId, selectedElementId, disableContextRotation, vesselOpacity, vesselMapLoaded]);

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
        if (disabled) return;
        e.preventDefault();
        const point = getCanvasPoint(e);

        if (activeTool === 'select') {
            // Find clicked element (reverse order for top-most)
            const clickedElement = [...elements].reverse().find(el => isPointInElement(point, el));
            if (clickedElement) {
                if (clickedElement.id === selectedElementId) {
                    // Start dragging the already-selected element
                    setIsDragging(true);
                    setDragStartPoint(point);
                } else {
                    // Select new element
                    setSelectedElementId(clickedElement.id);
                }
            } else {
                setSelectedElementId(null);
            }
            return;
        }

        // Clear redo stack on new action
        setRedoStack([]);

        // Check for grouping
        const lastElement = elements[elements.length - 1];
        const now = Date.now();
        const GROUP_THRESHOLD = 2000; // 2 seconds

        let shouldGroup = false;
        if (lastElement && lastElement.type === 'stroke') {
            const isSameTool = lastElement.toolType === activeTool;
            const isRecent = (now - lastElement.timestamp) < GROUP_THRESHOLD;

            if (activeTool === 'eraser' && isSameTool && isRecent) {
                // Always group eraser strokes regardless of other properties
                shouldGroup = true;
            } else {
                const isSameColor = lastElement.color === activeColor;
                const isSamePathology = lastElement.pathology === activePathology;

                // Group if same tool/properties and recent
                if (isSameTool && isSameColor && isSamePathology && isRecent) {
                    shouldGroup = true;
                }
            }
        }

        if (shouldGroup && lastElement && lastElement.points) {
            // Remove last element from state and make it current
            setElements(prev => prev.slice(0, -1));
            setCurrentElement({
                ...lastElement,
                points: [...lastElement.points, null, point], // Add break then new point
                timestamp: now // Update timestamp to keep the chain alive
            });
        } else {
            let name = 'Element';
            if (activeTool === 'eraser') {
                const count = elements.filter(e => e.toolType === 'eraser').length + 1;
                name = `Eraser ${count}`;
            } else {
                const pathologyName = PATHOLOGY_PRESETS[activePathology]?.label || 'Element';
                const count = elements.filter(e => e.pathology === activePathology && e.toolType !== 'eraser').length + 1;
                name = `${pathologyName} ${count}`;
            }

            setCurrentElement({
                id: Date.now().toString(),
                type: 'stroke',
                points: [point],
                color: activeColor,
                width: brushSize,
                toolType: activeTool,
                pathology: activePathology,
                timestamp: Date.now(),
                visible: true,
                layer: activePathology === 'vitreous_hemorrhage' ? 'vitreous' : 'retina',
                zDepth: activePathology === 'vitreous_hemorrhage' ? 0.5 : 0,
                name: name
            });
        }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        e.preventDefault();
        const point = getCanvasPoint(e);

        if (activeTool === 'select') {
            // Handle dragging selected element
            if (isDragging && selectedElementId && dragStartPoint) {
                const dx = point.x - dragStartPoint.x;
                const dy = point.y - dragStartPoint.y;

                setElements(prev => prev.map(el => {
                    if (el.id !== selectedElementId) return el;

                    if (el.type === 'stroke' && el.points) {
                        // Translate all points in the stroke
                        return {
                            ...el,
                            points: el.points.map(p => p ? { x: p.x + dx, y: p.y + dy } : null)
                        };
                    } else if ((el.type === 'hemorrhage' || el.type === 'spot') && el.position) {
                        // Move shape position
                        return {
                            ...el,
                            position: { x: el.position.x + dx, y: el.position.y + dy }
                        };
                    }
                    return el;
                }));
                setDragStartPoint(point);
            } else {
                const hovered = [...elements].reverse().find(el => isPointInElement(point, el));
                setHoveredElementId(hovered ? hovered.id : null);
            }
            return;
        }

        if (!currentElement) return;

        // Prevent drawing inside optic disc
        if (isPointInOpticDisc(point)) return;

        setCurrentElement(prev => prev && prev.points ? {
            ...prev,
            points: [...prev.points, point]
        } : null);
    };

    const handleEnd = () => {
        if (disabled) return;

        // Reset dragging state
        if (isDragging) {
            setIsDragging(false);
            setDragStartPoint(null);
        }

        if (currentElement) {
            setElements(prev => [...prev, currentElement]);
            setCurrentElement(null);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`border border-gray-200 rounded-2xl bg-white touch-none shadow-sm max-w-full h-auto ${disabled ? 'cursor-default' : 'cursor-crosshair'} ${className}`}
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
