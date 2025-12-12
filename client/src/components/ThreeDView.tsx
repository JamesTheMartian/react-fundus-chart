import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { FundusElement, EyeSide, Point, GraphicsQuality } from '../utils/types';
// import './ThreeDView.css'; // Removed for Tailwind migration

import { Sun, Eye, FileText, Flashlight, Cloud, ScanLine, X, Tag } from 'lucide-react';
import { useFrame } from '@react-three/fiber';

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { VitreousHemorrhageCloud, VitreousHemorrhageSpot } from './VitreousHemorrhageShader';



interface LightControlProps {
    rotation: number;
    onChange: (rotation: number) => void;
}

const LightControl: React.FC<LightControlProps> = ({ rotation, onChange }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isDraggingRef = React.useRef(false);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMove = React.useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        onChange(angle);
    }, [onChange]);

    const onStart = (clientX: number, clientY: number) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        handleMove(clientX, clientY);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
    };

    React.useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current) {
                handleMove(e.clientX, e.clientY);
            }
        };
        const onTouchMove = (e: TouchEvent) => {
            if (isDraggingRef.current) {
                e.preventDefault();
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        };
        const onEnd = () => {
            isDraggingRef.current = false;
            setIsDragging(false);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onEnd);
        };
    }, [handleMove]);

    // Calculate handle position
    const radius = 24; // px
    const rad = rotation * (Math.PI / 180);
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    return (
        <div
            ref={containerRef}
            className="relative w-16 h-16 flex items-center justify-center cursor-pointer touch-none"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {/* Ring */}
            <div className={`absolute inset-0 rounded-full border-2 transition-colors ${isDragging ? 'border-blue-500/50' : 'border-gray-700'}`} />

            {/* Center Dot */}
            <div className="w-2 h-2 bg-gray-600 rounded-full" />

            {/* Handle */}
            <div
                className={`absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${isDragging ? 'scale-125 shadow-blue-500/50 ring-2 ring-blue-400/30' : ''}`}
                style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                }}
            >
                <Sun size={14} className="text-white" />
            </div>
        </div>
    );
};

interface VitreousHazeProps {
    clippingPlanes: THREE.Plane[];
}

const VitreousHaze: React.FC<VitreousHazeProps> = ({ clippingPlanes }) => {
    const count = 500;
    const mesh = React.useRef<THREE.Points>(null);

    const particles = React.useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = Math.random() * 1.8; // Radius < 2
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Keep within hemisphere roughly
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            // Shift to center roughly
            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z - 1;
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.1;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                    args={[particles, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#aaaaaa"
                transparent
                opacity={0.4}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                clippingPlanes={clippingPlanes}
            />
        </points>
    );
};

interface EyeModelProps {
    textureUrl: string;
    elements: FundusElement[];
    detachmentHeight: number;
    eyeSide: EyeSide;
    viewMode: 'chart' | 'retina';
    clippingPlanes: THREE.Plane[];
    graphicsQuality: GraphicsQuality;
}

const EyeModel: React.FC<EyeModelProps> = ({ textureUrl, elements, detachmentHeight, eyeSide, viewMode, clippingPlanes, graphicsQuality }) => {
    const texture = useLoader(THREE.TextureLoader, textureUrl);
    const materialRef = React.useRef<THREE.MeshStandardMaterial>(null);
    const depthMaterialRef = React.useRef<THREE.MeshDepthMaterial>(null);

    // Generate Retina Map (Red background + Original Colors)
    const retinaMap = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 1. Fill Background with Red (Retina Color)
        ctx.fillStyle = '#f4acacff'; // Light red/pink
        ctx.fillRect(0, 0, 1024, 1024);

        // 2. Draw Elements
        // Scale factor from original 600x600 to 1024x1024
        const scaleX = 1024 / 600;
        const scaleY = 1024 / 600;

        elements.forEach(element => {
            if (!element.visible) return;

            // Skip eraser for color map (it just reveals background, which is already red here)
            // Actually, if we erase on the chart, we see white. Here we see red.
            // If we have "eraser" strokes, they should probably "erase" to the background color.
            // Since we started with background color, we can just skip drawing them?
            // Or if they are erasing *other* strokes, we need to use destination-out?
            // But canvas doesn't support layers easily.
            // If we draw in order, eraser should erase previous strokes.

            if (element.toolType === 'eraser') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = '#c04040';
                ctx.fillStyle = '#c04040';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                // Get color from element
                // We need to map 'red', 'blue' etc to hex
                // We can't import MEDICAL_COLORS easily if not exported or we can just redefine/import
                // It is imported from types.
                const color = element.color === 'red' ? '#FF0000' :
                    element.color === 'blue' ? '#0000FF' :
                        element.color === 'green' ? '#008000' :
                            element.color === 'brown' ? '#8B4513' :
                                element.color === 'yellow' ? '#FFFF00' :
                                    '#000000';

                ctx.strokeStyle = color;
                ctx.fillStyle = color;
            }

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const width = (element.width || 2) * scaleX;
            ctx.lineWidth = width;

            if (element.type === 'stroke' && element.points) {
                if (element.points.length < 2 && !element.points[0]) return;

                if (element.toolType === 'pattern') {
                    ctx.beginPath();
                    ctx.setLineDash([5 * scaleX, 10 * scaleX]);

                    let isFirst = true;
                    for (const p of element.points) {
                        if (!p) {
                            ctx.stroke();
                            ctx.beginPath();
                            isFirst = true;
                            continue;
                        }
                        if (isFirst) {
                            ctx.moveTo(p.x * scaleX, p.y * scaleY);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x * scaleX, p.y * scaleY);
                        }
                    }
                    ctx.stroke();
                    ctx.setLineDash([]);
                } else if (element.toolType === 'fill') {
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();

                    let isFirst = true;
                    for (const p of element.points) {
                        if (!p) {
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            isFirst = true;
                            continue;
                        }
                        if (isFirst) {
                            ctx.moveTo(p.x * scaleX, p.y * scaleY);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x * scaleX, p.y * scaleY);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                } else {
                    // Brush/Pen
                    if (element.toolType === 'brush') {
                        ctx.globalAlpha = element.layer === 'vitreous' ? 0.3 : 0.5;
                    }
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
                            ctx.moveTo(p.x * scaleX, p.y * scaleY);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x * scaleX, p.y * scaleY);
                        }
                    }
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }
            } else if ((element.type === 'hemorrhage' || element.type === 'spot') && element.position) {
                ctx.beginPath();
                ctx.ellipse(
                    element.position.x * scaleX,
                    element.position.y * scaleY,
                    (element.width || 10) * scaleX / 2,
                    (element.height || 10) * scaleY / 2,
                    element.rotation || 0,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        });

        return new THREE.CanvasTexture(canvas);
    }, [elements]);

    // ... (Displacement Map logic remains same)
    const displacementMap = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);

        // Scale factor from original 600x600 to 512x512
        const scaleX = 512 / 600;
        const scaleY = 512 / 600;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFFFFF';

        // Draw Detachment strokes in White, and Eraser strokes in Black
        elements.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;

            const isDetachment = (stroke.type === 'stroke' || stroke.type === 'tear') && (stroke.pathology === 'detachment' || stroke.pathology === 'tear');
            const isEraser = stroke.toolType === 'eraser';

            if (!isDetachment && !isEraser) return;

            if (isEraser) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = (stroke.width || 2) * scaleX * 2;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.lineWidth = (stroke.width || 2) * scaleX;
            }

            ctx.beginPath();
            let isFirst = true;
            for (const p of stroke.points) {
                if (!p) {
                    if (stroke.toolType === 'fill') {
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                    ctx.beginPath();
                    isFirst = true;
                    continue;
                }
                if (isFirst) {
                    ctx.moveTo(p.x * scaleX, p.y * scaleY);
                    isFirst = false;
                } else {
                    ctx.lineTo(p.x * scaleX, p.y * scaleY);
                }
            }

            if (stroke.toolType === 'fill') {
                if (!isEraser) ctx.fillStyle = '#FFFFFF';
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
        });

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, [elements]);

    // Generate Shadow Mask (For Vessel Shadows)
    const shadowMask = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Transparent background
        ctx.clearRect(0, 0, 1024, 1024);

        const scaleX = 1024 / 600;
        const scaleY = 1024 / 600;

        elements.forEach(element => {
            if (!element.visible) return;
            // Skip eraser
            if (element.toolType === 'eraser') return;

            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#FFFFFF';
            ctx.fillStyle = '#FFFFFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const width = (element.width || 2) * scaleX;
            ctx.lineWidth = width;

            if (element.type === 'stroke' && element.points) {
                if (element.points.length < 2 && !element.points[0]) return;

                if (element.toolType === 'pattern') {
                    // Patterns might be tricky, treat as solid for shadow for now
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
                            ctx.moveTo(p.x * scaleX, p.y * scaleY);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x * scaleX, p.y * scaleY);
                        }
                    }
                    ctx.stroke();
                } else if (element.toolType === 'fill') {
                    ctx.beginPath();
                    let isFirst = true;
                    for (const p of element.points) {
                        if (!p) {
                            ctx.closePath();
                            ctx.fill();
                            ctx.beginPath();
                            isFirst = true;
                            continue;
                        }
                        if (isFirst) {
                            ctx.moveTo(p.x * scaleX, p.y * scaleY);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x * scaleX, p.y * scaleY);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                } else {
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
                            ctx.moveTo(p.x * scaleX, p.y * scaleY);
                            isFirst = false;
                        } else {
                            ctx.lineTo(p.x * scaleX, p.y * scaleY);
                        }
                    }
                    ctx.stroke();
                }
            } else if ((element.type === 'hemorrhage' || element.type === 'spot') && element.position) {
                ctx.beginPath();
                ctx.ellipse(
                    element.position.x * scaleX,
                    element.position.y * scaleY,
                    (element.width || 10) * scaleX / 2,
                    (element.height || 10) * scaleY / 2,
                    element.rotation || 0,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        });

        return new THREE.CanvasTexture(canvas);
    }, [elements]);

    // ... (Roughness/Normal map loader remains same)
    const [roughnessMap, normalMap] = useLoader(THREE.TextureLoader, [
        `${import.meta.env.BASE_URL}textures/roughness_map.jpg`,
        `${import.meta.env.BASE_URL}textures/normal_map.jpg`
    ]);

    React.useEffect(() => {
        if (eyeSide === 'OS') {
            roughnessMap.wrapS = THREE.RepeatWrapping;
            roughnessMap.repeat.x = -1;
            roughnessMap.offset.x = 1;
            normalMap.wrapS = THREE.RepeatWrapping;
            normalMap.repeat.x = -1;
            normalMap.offset.x = 1;
        } else {
            roughnessMap.repeat.x = 1;
            roughnessMap.offset.x = 0;
            normalMap.repeat.x = 1;
            normalMap.offset.x = 0;
        }
        roughnessMap.needsUpdate = true;
        normalMap.needsUpdate = true;
    }, [eyeSide, roughnessMap, normalMap]);

    // ... (Shader logic remains same)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onBeforeCompile = React.useCallback((shader: any) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uDisplacementMap = { value: displacementMap };
        shader.uniforms.uDetachmentHeight = { value: detachmentHeight };

        shader.vertexShader = `
            uniform float uTime;
            uniform float uDetachmentHeight;
            uniform sampler2D uDisplacementMap;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            float disp = texture2D(uDisplacementMap, uv).r;
            if (disp > 0.1) {
                // Wave 1: Large, slow, organic (The "Flobby" base)
                float w1_x = position.x * 3.0 + uTime * 1.5;
                float w1_y = position.y * 2.5 + uTime * 1.2;
                float wave1 = sin(w1_x) + cos(w1_y);
                
                // Wave 2: Medium, counter-movement (Adds complexity)
                float w2_x = position.x * 5.0 - uTime * 3.0;
                float w2_y = position.y * 4.0 + uTime * 4.0;
                float wave2 = sin(w2_y) + cos(w2_x);

                // Wave 3: Small, fast, irregular (Simulates randomness/jitter)
                float w3_x = (position.x + position.y) * 8.0 + uTime * 2.2;
                float wave3 = sin(w3_x);

                // Combine waves with weights
                float combinedWave = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.1) * 0.1;

                // Calculate Derivatives for Normal Perturbation (Chain Rule)
                float dw1_dx = 3.0 * cos(w1_x);
                float dw1_dy = -2.5 * sin(w1_y);
                
                float dw2_dx = -5.0 * sin(w2_x);
                float dw2_dy = 4.0 * cos(w2_y);

                float dw3_dx = 8.0 * cos(w3_x);
                float dw3_dy = 8.0 * cos(w3_x);

                float dWaveDx = (dw1_dx * 0.5 + dw2_dx * 0.3 + dw3_dx * 0.1) * 0.1;
                float dWaveDy = (dw1_dy * 0.5 + dw2_dy * 0.3 + dw3_dy * 0.1) * 0.1;

                float strength = uDetachmentHeight; 
                float totalDisp = disp * strength + combinedWave * disp;
                
                transformed += normal * totalDisp;
                
                vec3 waveGrad = vec3(dWaveDx, dWaveDy, 0.0);
                vec3 perturbedNormal = normalize(objectNormal - waveGrad * disp * 0.8);
                vNormal = normalize(normalMatrix * perturbedNormal);
            }
            `
        );
    }, [displacementMap, detachmentHeight]);

    // We need to capture the shader instance for both materials
    const onBeforeCompileMain = React.useCallback((shader: any) => {
        onBeforeCompile(shader);
        if (materialRef.current) materialRef.current.userData.shader = shader;
    }, [onBeforeCompile]);

    const onBeforeCompileDepth = React.useCallback((shader: any) => {
        onBeforeCompile(shader);
        if (depthMaterialRef.current) depthMaterialRef.current.userData.shader = shader;
    }, [onBeforeCompile]);

    React.useEffect(() => {
        if (materialRef.current && materialRef.current.userData.shader) {
            materialRef.current.userData.shader.uniforms.uDisplacementMap.value = displacementMap;
            materialRef.current.userData.shader.uniforms.uDetachmentHeight.value = detachmentHeight;
        }
        if (depthMaterialRef.current && depthMaterialRef.current.userData.shader) {
            depthMaterialRef.current.userData.shader.uniforms.uDisplacementMap.value = displacementMap;
            depthMaterialRef.current.userData.shader.uniforms.uDetachmentHeight.value = detachmentHeight;
        }
    }, [displacementMap, detachmentHeight]);

    // Update clipping planes for custom materials if needed, 
    // but standard materials handle it automatically via renderer.
    // However, we need to ensure the material *knows* about them if we modify it?
    // Actually, <meshStandardMaterial> has a clippingPlanes prop.

    React.useEffect(() => {
        let frameId: number;
        const startTime = Date.now();
        const animate = () => {
            const time = (Date.now() - startTime) / 1000;
            if (materialRef.current && materialRef.current.userData.shader) {
                materialRef.current.userData.shader.uniforms.uTime.value = time;
            }
            if (depthMaterialRef.current && depthMaterialRef.current.userData.shader) {
                depthMaterialRef.current.userData.shader.uniforms.uTime.value = time;
            }
            frameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(frameId);
    }, []);

    // ... (Geometry remains same)
    const geometry = React.useMemo(() => {
        const geo = new THREE.PlaneGeometry(4, 4, 128, 128);
        const pos = geo.attributes.position;
        const uvs = geo.attributes.uv;
        const temp = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            const u = uvs.getX(i);
            const v = uvs.getY(i);
            const dx = u - 0.5;
            const dy = v - 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxR = 0.5;
            const r = Math.min(dist, maxR);
            const theta = (r / 0.5) * (Math.PI * (7 / 8));
            const phi = Math.atan2(dy, dx);
            const R = 2;
            temp.set(
                R * Math.sin(theta) * Math.cos(phi),
                R * Math.sin(theta) * Math.sin(phi),
                -R * Math.cos(theta)
            );
            pos.setXYZ(i, temp.x, temp.y, temp.z);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);



    // ... (map2DTo3D and vitreousElements remain same)
    const map2DTo3D = (p: Point, depth: number = 0.5): THREE.Vector3 => {
        const u = p.x / 600;
        const v = 1 - (p.y / 600);
        const dx = u - 0.5;
        const dy = v - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = 0.5;
        const r = Math.min(dist, maxR);
        const theta = (r / maxR) * (Math.PI * (7 / 8));
        const phi = Math.atan2(dy, dx);
        const R = 2;
        const R_vitreous = R - depth;
        const x = R_vitreous * Math.sin(theta) * Math.cos(phi);
        const y = R_vitreous * Math.sin(theta) * Math.sin(phi);
        const z = -R_vitreous * Math.cos(theta);
        return new THREE.Vector3(x, y, z);
    };

    const vitreousElements = React.useMemo(() => {
        return elements.filter(e => e.layer === 'vitreous' && e.visible).flatMap((e) => {
            // Split points into segments
            const segments: Point[][] = [];
            let currentSegment: Point[] = [];
            e.points?.forEach(p => {
                if (p) currentSegment.push(p);
                else if (currentSegment.length > 0) {
                    segments.push(currentSegment);
                    currentSegment = [];
                }
            });
            if (currentSegment.length > 0) segments.push(currentSegment);

            return segments.map((segment, index) => {
                if (e.type === 'stroke' && segment.length > 1) {
                    // Use new volumetric cloud shader component
                    return (
                        <VitreousHemorrhageCloud
                            key={`${e.id}-${index}`}
                            points={segment}
                            width={e.width || 15}
                            zDepth={e.zDepth || 0.5}
                            map2DTo3D={map2DTo3D}
                            clippingPlanes={clippingPlanes}
                            elementId={`${e.id}-${index}`}
                            quality={graphicsQuality}
                        />
                    );
                } else {
                    // Use shader-based spot for individual hemorrhage spots
                    const p = e.position || (segment.length > 0 && segment[0]) || { x: 0, y: 0 };
                    const pos = map2DTo3D(p, e.zDepth || 0.5);
                    return (
                        <VitreousHemorrhageSpot
                            key={`${e.id}-${index}`}
                            position={pos}
                            radius={0.15}
                            clippingPlanes={clippingPlanes}
                            quality={graphicsQuality}
                        />
                    );
                }
            });
        });
    }, [elements, clippingPlanes, map2DTo3D]);

    return (
        <group>
            {/* RPE Layer (Behind Retina) */}
            <mesh geometry={geometry} scale={[1.01, 1.01, 1.01]} receiveShadow>
                <meshStandardMaterial
                    color="#5c2a2a"
                    roughness={0.8}
                    side={THREE.FrontSide}
                    clippingPlanes={clippingPlanes}
                    clipShadows
                />
            </mesh>
            <mesh geometry={geometry} castShadow receiveShadow>
                <meshStandardMaterial
                    ref={materialRef}
                    map={viewMode === 'chart' ? texture : retinaMap}
                    roughnessMap={roughnessMap}
                    normalMap={normalMap}
                    side={THREE.FrontSide}
                    roughness={1.0}
                    metalness={0}
                    onBeforeCompile={onBeforeCompileMain}
                    color="#ffffff" // Always white, let the texture define the color
                    clippingPlanes={clippingPlanes}
                    clipShadows
                />
                <meshDepthMaterial
                    ref={depthMaterialRef}
                    attach="customDepthMaterial"
                    depthPacking={THREE.RGBADepthPacking}
                    map={shadowMask}
                    alphaTest={0.5}
                    onBeforeCompile={onBeforeCompileDepth}
                    clippingPlanes={clippingPlanes}
                />
            </mesh>
            {vitreousElements}
            <mesh rotation={[0, 0, 0]} position={[0, 0, -2 * Math.cos(Math.PI * (7 / 8))]}>
                <torusGeometry args={[2 * Math.sin(Math.PI * (7 / 8)), 0.05, 16, 100]} />
                <meshBasicMaterial color="#333" clippingPlanes={clippingPlanes} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[2.02, 64, 64, 0, Math.PI * 2, 0, Math.PI * (7 / 8)]} />
                <meshStandardMaterial
                    color="#fee"
                    side={THREE.FrontSide}
                    transparent={true}
                    opacity={0.5}
                    clippingPlanes={clippingPlanes}
                    clipShadows
                />
            </mesh>
        </group>
    );
};

// ... (ThreeDViewProps remains same)
interface ThreeDViewProps {
    textureUrl: string;
    elements: FundusElement[];
    detachmentHeight: number;
    onClose: () => void;
    eyeSide: EyeSide;
    graphicsQuality?: GraphicsQuality;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ textureUrl, elements, detachmentHeight, onClose, eyeSide, graphicsQuality = 'high' }) => {
    useKeyboardShortcuts({
        on3DView: onClose,
    });

    const [lightRotation, setLightRotation] = React.useState(45);
    const [viewMode, setViewMode] = React.useState<'chart' | 'retina'>('chart');
    const [isOphthalmoscopeMode, setIsOphthalmoscopeMode] = React.useState(false);
    const [showHaze, setShowHaze] = React.useState(false);
    const [showOCT, setShowOCT] = React.useState(false);
    const [showAnnotations, setShowAnnotations] = React.useState(false);
    const [sliceMin, setSliceMin] = React.useState(-2);
    const [sliceMax, setSliceMax] = React.useState(2);

    const [showLightControl, setShowLightControl] = React.useState(false);

    // Two clipping planes for bidirectional slicing
    const clippingPlanes = React.useMemo(() => {
        if (!showOCT) {
            return [];
        }
        const planeLeft = new THREE.Plane(new THREE.Vector3(1, 0, 0), -sliceMin);
        const planeRight = new THREE.Plane(new THREE.Vector3(-1, 0, 0), sliceMax);
        return [planeLeft, planeRight];
    }, [showOCT, sliceMin, sliceMax]);

    const lightX = 7 * Math.cos((lightRotation * Math.PI) / 180);
    const lightY = 7 * Math.sin((lightRotation * Math.PI) / 180);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm sm:p-4">
            <div className="w-full h-full sm:max-w-6xl sm:h-[85vh] bg-black sm:bg-gray-900 sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-gray-800 relative">

                {/* Header (Minimal) */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
                    <h2 className="text-lg font-semibold text-white/90 drop-shadow-md pointer-events-auto">3D Visualization</h2>
                    <button
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all pointer-events-auto active:scale-90"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* View Mode Toggle (Top Center) */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                    <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all active:scale-95 ${viewMode === 'chart' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FileText size={14} />
                            Chart
                        </button>
                        <button
                            onClick={() => setViewMode('retina')}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all active:scale-95 ${viewMode === 'retina' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Eye size={14} />
                            Retina
                        </button>
                    </div>
                </div>

                {/* 3D Canvas */}
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows gl={{ localClippingEnabled: true }}>
                        <color attach="background" args={['#050511']} />

                        {/* Lighting */}
                        {!isOphthalmoscopeMode ? (
                            <>
                                <ambientLight intensity={0.4} />
                                <directionalLight
                                    position={[lightX, lightY, 5]}
                                    intensity={1.0}
                                    castShadow
                                    shadow-mapSize={[1024, 1024]}
                                />
                                <directionalLight
                                    position={[-5, 5, 5]}
                                    intensity={0.5}
                                />
                                <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffffff" />
                            </>
                        ) : (
                            <>
                                <ambientLight intensity={0.1} />
                                <spotLight
                                    position={[lightX, lightY, 6]}
                                    angle={0.25}
                                    penumbra={0.5}
                                    intensity={20.0}
                                    castShadow
                                    shadow-mapSize={[1024, 1024]}
                                    distance={20}
                                    decay={1}
                                />
                                {/* Volumetric Beam Simulation (Cone) */}
                                <mesh position={[lightX, lightY, 6]} rotation={[0, 0, (lightRotation + 90) * Math.PI / 180]}>
                                    <coneGeometry args={[1, 10, 32, 1, true]} />
                                    <meshBasicMaterial color="white" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
                                </mesh>
                            </>
                        )}

                        <Suspense fallback={<Html center><div className="text-white">Loading 3D Model...</div></Html>}>
                            <EyeModel key={textureUrl} textureUrl={textureUrl} elements={elements} detachmentHeight={detachmentHeight} eyeSide={eyeSide} viewMode={viewMode} clippingPlanes={clippingPlanes} graphicsQuality={graphicsQuality} />
                            {showHaze && <VitreousHaze clippingPlanes={clippingPlanes} />}
                        </Suspense>

                        {showOCT && (
                            <>
                                <mesh position={[sliceMin, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                                    <planeGeometry args={[4, 4]} />
                                    <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
                                </mesh>
                                <mesh position={[sliceMax, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                                    <planeGeometry args={[4, 4]} />
                                    <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
                                </mesh>
                            </>
                        )}

                        {/* 3D Annotations */}
                        {showAnnotations && elements.filter(e => e.visible && e.toolType !== 'eraser').map(element => {
                            let avgX = 300, avgY = 300;
                            if (element.type === 'stroke' && element.points && element.points.length > 0) {
                                const validPoints = element.points.filter(p => p !== null) as { x: number; y: number }[];
                                if (validPoints.length > 0) {
                                    avgX = validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length;
                                    avgY = validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length;
                                }
                            } else if (element.position) {
                                avgX = element.position.x;
                                avgY = element.position.y;
                            }

                            // Use same spherical mapping as EyeModel
                            const u = avgX / 600;
                            const v = 1 - (avgY / 600);
                            const dx = u - 0.5;
                            const dy = v - 0.5;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const maxR = 0.5;
                            const r = Math.min(dist, maxR);
                            const theta = (r / maxR) * (Math.PI * (7 / 8));
                            const phi = Math.atan2(dy, dx);
                            const R = 2;

                            const surfaceX = R * Math.sin(theta) * Math.cos(phi);
                            const surfaceY = R * Math.sin(theta) * Math.sin(phi);
                            const surfaceZ = -R * Math.cos(theta);

                            // Label offset outward
                            const norm = Math.sqrt(surfaceX * surfaceX + surfaceY * surfaceY + surfaceZ * surfaceZ) || 1;
                            const labelX = surfaceX + (surfaceX / norm) * 0.4;
                            const labelY = surfaceY + (surfaceY / norm) * 0.4 + 0.15;
                            const labelZ = surfaceZ + (surfaceZ / norm) * 0.4;

                            const surfacePos: [number, number, number] = [surfaceX, surfaceY, surfaceZ];
                            const labelPos: [number, number, number] = [labelX, labelY, labelZ];
                            const label = element.name || element.pathology || 'Element';

                            return (
                                <group key={element.id}>
                                    <Line points={[surfacePos, labelPos]} color="#ffffff" lineWidth={1} dashed dashSize={0.05} gapSize={0.03} />
                                    <Html position={labelPos} center distanceFactor={5}>
                                        <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/30 whitespace-nowrap pointer-events-none shadow-lg">
                                            {label}
                                        </div>
                                    </Html>
                                </group>
                            );
                        })}

                        <OrbitControls
                            enablePan={false}
                            minDistance={1}
                            maxDistance={8}
                            minPolarAngle={Math.PI / 3}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Canvas>
                </div>

                {/* Controls Layer (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center gap-4 pointer-events-none">

                    {/* Popovers Container */}
                    <div className="flex flex-col items-center gap-4 w-full max-w-md pointer-events-auto transition-all duration-300">

                        {/* Slice View Sliders Popover */}
                        {showOCT && (
                            <div className="w-full bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-4 fade-in">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-white text-xs font-bold flex items-center gap-2">
                                        <ScanLine size={12} className="text-green-400" /> Slice View
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] text-white/60 mb-1">
                                            <span>Left Slice</span>
                                            <span>{sliceMin.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-2"
                                            max="2"
                                            step="0.05"
                                            value={sliceMin}
                                            onChange={(e) => setSliceMin(Math.min(parseFloat(e.target.value), sliceMax - 0.1))}
                                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-white/60 mb-1">
                                            <span>Right Slice</span>
                                            <span>{sliceMax.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-2"
                                            max="2"
                                            step="0.05"
                                            value={sliceMax}
                                            onChange={(e) => setSliceMax(Math.max(parseFloat(e.target.value), sliceMin + 0.1))}
                                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Light Control Popover */}
                        {showLightControl && (
                            <div className="bg-black/60 backdrop-blur-md p-4 rounded-full border border-white/10 animate-in slide-in-from-bottom-4 fade-in">
                                <LightControl rotation={lightRotation} onChange={setLightRotation} />
                            </div>
                        )}
                    </div>

                    {/* Bottom Dock */}
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl pointer-events-auto">

                        <button
                            onClick={() => setShowLightControl(!showLightControl)}
                            className={`p-3 rounded-full transition-all ${showLightControl ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            title="Light Direction"
                        >
                            <Sun size={20} />
                        </button>

                        <button
                            onClick={() => setIsOphthalmoscopeMode(!isOphthalmoscopeMode)}
                            className={`p-3 rounded-full transition-all ${isOphthalmoscopeMode ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            title="Ophthalmoscope Mode"
                        >
                            <Flashlight size={20} />
                        </button>

                        <button
                            onClick={() => setShowHaze(!showHaze)}
                            className={`p-3 rounded-full transition-all ${showHaze ? 'bg-gray-500 text-white shadow-[0_0_15px_rgba(107,114,128,0.4)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            title="Vitreous Haze"
                        >
                            <Cloud size={20} />
                        </button>

                        <button
                            onClick={() => setShowOCT(!showOCT)}
                            className={`p-3 rounded-full transition-all ${showOCT ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            title="Slice View"
                        >
                            <ScanLine size={20} />
                        </button>

                        <button
                            onClick={() => setShowAnnotations(!showAnnotations)}
                            className={`p-3 rounded-full transition-all ${showAnnotations ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            title="Show Annotations"
                        >
                            <Tag size={20} />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};
