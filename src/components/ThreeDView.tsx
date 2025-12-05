import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { FundusElement, EyeSide, Point } from '../utils/types';
// import './ThreeDView.css'; // Removed for Tailwind migration

import { Sun } from 'lucide-react';

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
    onAddElement?: (point: Point) => void;
}

const EyeModel: React.FC<EyeModelProps> = ({ textureUrl, elements, detachmentHeight, eyeSide, onAddElement }) => {
    const texture = useLoader(THREE.TextureLoader, textureUrl);
    const materialRef = React.useRef<THREE.MeshStandardMaterial>(null);

    // Generate Displacement Map for Detachments
    const displacementMap = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Black background (no displacement)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);

        // Draw Detachment strokes in White
        const detachmentStrokes = elements.filter(s => (s.type === 'stroke' || s.type === 'tear') && (s.pathology === 'detachment' || s.pathology === 'tear'));

        if (detachmentStrokes.length === 0) return null;

        // Scale factor from original 600x600 to 512x512
        const scaleX = 512 / 600;
        const scaleY = 512 / 600;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#FFFFFF';
        // Blur for smooth transition
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFFFFF';

        detachmentStrokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;
            ctx.lineWidth = (stroke.width || 2) * scaleX;
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
            }
            ctx.stroke();
        });

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, [elements]);

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

    // Custom Shader Logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onBeforeCompile = React.useCallback((shader: any) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uDisplacementMap = { value: displacementMap };
        shader.uniforms.uDetachmentHeight = { value: detachmentHeight };

        // Inject uniforms
        shader.vertexShader = `
            uniform float uTime;
            uniform float uDetachmentHeight;
            uniform sampler2D uDisplacementMap;
        ` + shader.vertexShader;

        // Inject vertex displacement and normal recalculation logic
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            
            // Read displacement from map
            float disp = texture2D(uDisplacementMap, uv).r;

            // Add wave effect only where there is displacement
            if (disp > 0.1) {
                // Wave function: sin(x*10 + t*2) * 0.05 + cos(y*10 + t*3) * 0.05
                float waveX = position.x * 10.0 + uTime * 2.0;
                float waveY = position.y * 10.0 + uTime * 3.0;
                
                float wave = sin(waveX) * 0.05 + cos(waveY) * 0.05;
                
                // Derivatives for normal recalculation
                // d(sin(u))/dx = cos(u) * du/dx
                float dWaveDx = cos(waveX) * 10.0 * 0.05; // * 0.5
                float dWaveDy = -sin(waveY) * 10.0 * 0.05; // * -0.5
                
                // Use uDetachmentHeight uniform
                float strength = uDetachmentHeight; 
                float totalDisp = disp * strength + wave * disp;
                
                transformed += normal * totalDisp;

                // Recalculate Normal
                // We approximate the new normal by subtracting the gradient of the wave
                // This is a simplification but works well for visual waves
                vec3 waveGrad = vec3(dWaveDx, dWaveDy, 0.0);
                
                // Rotate gradient to match surface normal? 
                // Since we are on a sphere, this is tricky in object space without tangent basis.
                // However, simply adding the gradient to the normal often gives "good enough" results for noise.
                // A better way for displacement along normal N is:
                // NewNormal = N - Gradient * Scale
                
                // Let's try perturbing the objectNormal directly
                // We need to ensure we modify 'objectNormal' or 'vNormal' correctly.
                // In this chunk, 'objectNormal' is available (from beginnormal_vertex).
                // But 'transformed' is position.
                
                // We can't easily modify objectNormal here because it might have been used already?
                // Actually, <begin_vertex> is after <beginnormal_vertex>.
                // So objectNormal is set.
                
                // Let's perturb it.
                // We assume the wave is primarily in X/Y for the gradient calculation above.
                // But on a sphere, X/Y are changing.
                // Let's just use the computed gradient as a perturbation.
                
                vec3 perturbedNormal = normalize(objectNormal - waveGrad * disp * 0.5);
                vNormal = normalize(normalMatrix * perturbedNormal);
            }
            `
        );

        // Save reference to shader to update uniforms
        if (materialRef.current) {
            materialRef.current.userData.shader = shader;
        }

    }, [displacementMap]);

    React.useEffect(() => {
        if (materialRef.current && materialRef.current.userData.shader) {
            materialRef.current.userData.shader.uniforms.uDisplacementMap.value = displacementMap;
            materialRef.current.userData.shader.uniforms.uDetachmentHeight.value = detachmentHeight;
        }
    }, [displacementMap, detachmentHeight]);

    // Animation Loop
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

    // Custom Geometry to map the flat circular image onto a hemisphere
    const geometry = React.useMemo(() => {
        const geo = new THREE.PlaneGeometry(4, 4, 128, 128);
        const pos = geo.attributes.position;
        const uvs = geo.attributes.uv;
        const temp = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            const u = uvs.getX(i);
            const v = uvs.getY(i);

            // Calculate distance from center (0.5, 0.5)
            const dx = u - 0.5;
            const dy = v - 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // We only care about the circle within the square (radius 0.5)
            // Map dist 0..0.5 to theta 0..PI/2
            // If dist > 0.5, clamp or let it wrap (it will be outside the hemisphere rim)

            const maxR = 0.5;
            const r = Math.min(dist, maxR); // Clamp to circle

            const theta = (r / 0.5) * (Math.PI * (7 / 8)); // 0 at pole, extended to 7/8 sphere
            const phi = Math.atan2(dy, dx); // Angle around pole

            const R = 2; // Sphere radius

            // Polar coordinates to Cartesian
            // We want the pole (center of image) to be at Z-deepest point?
            // User wants "Inside of the sphere".
            // Let's place the pole at (0,0,-R) and rim at Z=0?
            // Or Pole at (0,0,R) and look from (0,0,0)?

            // Standard Sphere:
            // x = R * sin(theta) * cos(phi)
            // y = R * sin(theta) * sin(phi)
            // z = R * cos(theta)

            // At theta=0 (center): x=0, y=0, z=R.
            // At theta=90 (rim): z=0.

            // We want to look at the INSIDE.
            // So we can keep this shape, and put the camera at (0,0,0) looking at (0,0,R)?
            // Or put camera at (0,0,0) and geometry at (0,0,-R)?

            // Let's use the standard shape.
            // x, y are the flat plane coordinates deformed.

            temp.set(
                R * Math.sin(theta) * Math.cos(phi),
                R * Math.sin(theta) * Math.sin(phi),
                -R * Math.cos(theta) // Negative Z to make it a "bowl" facing +Z?
            );

            // If we want the "bowl" to be open towards the camera (which is at +Z),
            // The pole should be at -Z.
            // Rim at Z=0.

            pos.setXYZ(i, temp.x, temp.y, temp.z);
        }

        geo.computeVertexNormals();
        return geo;
    }, []);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        if (!onAddElement) return;
        if (e.uv) {
            const point: Point = {
                x: e.uv.x * 600,
                y: (1 - e.uv.y) * 600
            };
            onAddElement(point);
        }
    };





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

    // Vitreous Elements
    const vitreousElements = React.useMemo(() => {
        return elements.filter(e => e.layer === 'vitreous' && e.visible).map((e) => {
            if (e.type === 'stroke' && e.points && e.points.length > 1) {
                // Create Tube from points
                const points3D = e.points.map(p => map2DTo3D(p, e.zDepth || 0.5));
                const curve = new THREE.CatmullRomCurve3(points3D);
                // Width scaling: 2D width is pixels. 3D width needs to be small.
                // 600px -> 4 units (approx). So 1px ~ 0.006 units.
                const width3D = (e.width || 5) * 0.01;

                return (
                    <mesh key={e.id}>
                        <tubeGeometry args={[curve, 64, width3D, 8, false]} />
                        <meshPhysicalMaterial
                            color="#880000" // Darker blood red
                            transparent
                            opacity={0.9}
                            roughness={1}
                            metalness={0}
                            transmission={0.5} // Glassy/Jelly look
                            thickness={1}
                            clearcoat={1.0}
                        />
                    </mesh>
                );
            } else {
                // Fallback for single points or shapes (spheres)
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
            {/* The Fundus Map */}
            <mesh geometry={geometry} onClick={handleClick}>
                <meshStandardMaterial
                    ref={materialRef}
                    map={texture}
                    roughnessMap={roughnessMap}
                    normalMap={normalMap}
                    side={THREE.FrontSide}
                    roughness={1.0}
                    metalness={0}
                    onBeforeCompile={onBeforeCompile}
                    color="#f88"
                />
            </mesh>

            {/* Vitreous Objects */}
            {vitreousElements}

            {/* Outline / Rim */}
            <mesh rotation={[0, 0, 0]} position={[0, 0, -2 * Math.cos(Math.PI * (7 / 8))]}>
                <torusGeometry args={[2 * Math.sin(Math.PI * (7 / 8)), 0.05, 16, 100]} />
                <meshBasicMaterial color="#333" />
            </mesh>

            {/* Outer Shell (for depth/shadows from outside) */}
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

// import './ThreeDView.css'; // Removed for Tailwind migration

interface ThreeDViewProps {
    textureUrl: string;
    elements: FundusElement[];
    detachmentHeight: number;
    onClose: () => void;
    eyeSide: EyeSide;
    onAddElement?: (point: Point) => void;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ textureUrl, elements, detachmentHeight, onClose, eyeSide, onAddElement }) => {
    const [lightRotation, setLightRotation] = React.useState(45);

    // Calculate light position based on rotation
    const lightX = 7 * Math.cos((lightRotation * Math.PI) / 180);
    const lightY = 7 * Math.sin((lightRotation * Math.PI) / 180);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-gray-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-800">
                <div className="p-4 bg-gray-950 flex justify-between items-center border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">3D Fundus Visualization</h2>
                    <div className="flex items-center gap-4">
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
                    {/* Position camera to look into the hemisphere */}
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
                            <EyeModel key={textureUrl} textureUrl={textureUrl} elements={elements} detachmentHeight={detachmentHeight} eyeSide={eyeSide} onAddElement={onAddElement} />
                        </Suspense>

                        <OrbitControls
                            enablePan={false}
                            minDistance={1}
                            maxDistance={8}
                            // Limit rotation so user doesn't get lost behind the eye
                            minPolarAngle={Math.PI / 3}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};
