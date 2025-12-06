import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { FundusElement, EyeSide, Point } from '../utils/types';
// import './ThreeDView.css'; // Removed for Tailwind migration

import { Sun, Eye, FileText } from 'lucide-react';

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

interface EyeModelProps {
    textureUrl: string;
    elements: FundusElement[];
    detachmentHeight: number;
    eyeSide: EyeSide;
    viewMode: 'chart' | 'retina';
}

const EyeModel: React.FC<EyeModelProps> = ({ textureUrl, elements, detachmentHeight, eyeSide, viewMode }) => {
    const texture = useLoader(THREE.TextureLoader, textureUrl);
    const materialRef = React.useRef<THREE.MeshStandardMaterial>(null);

    // Generate Retina Map (Red background + Original Colors)
    const retinaMap = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 1. Fill Background with Red (Retina Color)
        ctx.fillStyle = '#c04040'; // Deep red/orange
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
                ctx.globalCompositeOperation = 'destination-out';
                // But wait, destination-out makes it transparent!
                // We want it to be the background color (Red).
                // So we should draw with Red color?
                // But if we draw with Red, we might cover things we shouldn't?
                // Actually, standard eraser behavior is "remove ink".
                // If we use destination-out, we get transparency.
                // If we put a red layer *behind* this canvas, transparency shows red.
                // BUT we are making a single texture.
                // So we should probably use 'source-over' with the background color.
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
                if (element.points.length < 2) return;

                if (element.toolType === 'pattern') {
                    ctx.beginPath();
                    ctx.setLineDash([5 * scaleX, 10 * scaleX]);
                    ctx.moveTo(element.points[0].x * scaleX, element.points[0].y * scaleY);
                    for (let i = 1; i < element.points.length; i++) {
                        ctx.lineTo(element.points[i].x * scaleX, element.points[i].y * scaleY);
                    }
                    ctx.stroke();
                    ctx.setLineDash([]);
                } else if (element.toolType === 'fill') {
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(element.points[0].x * scaleX, element.points[0].y * scaleY);
                    for (let i = 1; i < element.points.length; i++) {
                        ctx.lineTo(element.points[i].x * scaleX, element.points[i].y * scaleY);
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
                    ctx.moveTo(element.points[0].x * scaleX, element.points[0].y * scaleY);
                    for (let i = 1; i < element.points.length; i++) {
                        ctx.lineTo(element.points[i].x * scaleX, element.points[i].y * scaleY);
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

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
            }

            if (isEraser) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = (stroke.width || 2) * scaleX * 2;

                if (stroke.toolType === 'fill') {
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.stroke();
                }
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.lineWidth = (stroke.width || 2) * scaleX;

                if (stroke.toolType === 'fill') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.stroke();
                }
            }
        });

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
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

        if (materialRef.current) {
            materialRef.current.userData.shader = shader;
        }
    }, [displacementMap, detachmentHeight]);

    React.useEffect(() => {
        if (materialRef.current && materialRef.current.userData.shader) {
            materialRef.current.userData.shader.uniforms.uDisplacementMap.value = displacementMap;
            materialRef.current.userData.shader.uniforms.uDetachmentHeight.value = detachmentHeight;
        }
    }, [displacementMap, detachmentHeight]);

    React.useEffect(() => {
        let frameId: number;
        const startTime = Date.now();
        const animate = () => {
            const time = (Date.now() - startTime) / 1000;
            if (materialRef.current && materialRef.current.userData.shader) {
                materialRef.current.userData.shader.uniforms.uTime.value = time;
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
        return elements.filter(e => e.layer === 'vitreous' && e.visible).map((e) => {
            if (e.type === 'stroke' && e.points && e.points.length > 1) {
                const points3D = e.points.map(p => map2DTo3D(p, e.zDepth || 0.5));
                const curve = new THREE.CatmullRomCurve3(points3D);
                const width3D = (e.width || 5) * 0.01;
                return (
                    <mesh key={e.id}>
                        <tubeGeometry args={[curve, 64, width3D, 8, false]} />
                        <meshPhysicalMaterial
                            color="#880000"
                            transparent
                            opacity={0.9}
                            roughness={1}
                            metalness={0}
                            transmission={0.5}
                            thickness={1}
                            clearcoat={1.0}
                        />
                    </mesh>
                );
            } else {
                const p = e.position || (e.points && e.points[0]) || { x: 0, y: 0 };
                const pos = map2DTo3D(p, e.zDepth || 0.5);
                return (
                    <mesh key={e.id} position={pos}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshPhysicalMaterial
                            color="#880000"
                            transparent
                            opacity={0.8}
                            roughness={0.2}
                            clearcoat={1.0}
                        />
                    </mesh>
                );
            }
        });
    }, [elements]);

    return (
        <group>
            {/* RPE Layer (Behind Retina) */}
            <mesh geometry={geometry} scale={[1.01, 1.01, 1.01]}>
                <meshStandardMaterial
                    color="#5c2a2a"
                    roughness={0.8}
                    side={THREE.FrontSide}
                />
            </mesh>
            <mesh geometry={geometry}>
                <meshStandardMaterial
                    ref={materialRef}
                    map={viewMode === 'chart' ? texture : retinaMap}
                    roughnessMap={roughnessMap}
                    normalMap={normalMap}
                    side={THREE.FrontSide}
                    roughness={1.0}
                    metalness={0}
                    onBeforeCompile={onBeforeCompile}
                    color="#ffffff" // Always white, let the texture define the color
                />
            </mesh>
            {vitreousElements}
            <mesh rotation={[0, 0, 0]} position={[0, 0, -2 * Math.cos(Math.PI * (7 / 8))]}>
                <torusGeometry args={[2 * Math.sin(Math.PI * (7 / 8)), 0.05, 16, 100]} />
                <meshBasicMaterial color="#333" />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[2.02, 64, 64, 0, Math.PI * 2, 0, Math.PI * (7 / 8)]} />
                <meshStandardMaterial
                    color="#fee"
                    side={THREE.FrontSide}
                    transparent={true}
                    opacity={0.5}
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
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ textureUrl, elements, detachmentHeight, onClose, eyeSide }) => {
    const [lightRotation, setLightRotation] = React.useState(45);
    const [viewMode, setViewMode] = React.useState<'chart' | 'retina'>('chart');

    const lightX = 7 * Math.cos((lightRotation * Math.PI) / 180);
    const lightY = 7 * Math.sin((lightRotation * Math.PI) / 180);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-gray-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-800">
                <div className="p-4 bg-gray-950 flex justify-between items-center border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">3D Fundus Visualization</h2>
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
                            <button
                                onClick={() => setViewMode('chart')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'chart' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FileText size={14} />
                                Chart
                            </button>
                            <button
                                onClick={() => setViewMode('retina')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'retina' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Eye size={14} />
                                Retina
                            </button>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Light Direction</span>
                                <span className="text-gray-500 text-[10px]">Drag to rotate</span>
                            </div>
                            <LightControl rotation={lightRotation} onChange={setLightRotation} />
                        </div>
                        <button
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div className="flex-1 w-full h-full bg-black relative">
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
                        <color attach="background" args={['#050511']} />
                        <ambientLight intensity={0.4} />
                        <directionalLight
                            position={[lightX, lightY, 5]}
                            intensity={1.0}
                            castShadow
                        />
                        <directionalLight
                            position={[-5, 5, 5]}
                            intensity={0.5}
                        />
                        <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffffff" />

                        <Suspense fallback={<Html center><div className="text-white">Loading 3D Model...</div></Html>}>
                            <EyeModel key={textureUrl} textureUrl={textureUrl} elements={elements} detachmentHeight={detachmentHeight} eyeSide={eyeSide} viewMode={viewMode} />
                        </Suspense>

                        <OrbitControls
                            enablePan={false}
                            minDistance={1}
                            maxDistance={8}
                            minPolarAngle={Math.PI / 3}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};
