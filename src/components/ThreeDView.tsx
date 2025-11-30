import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Stroke } from '../utils/types';
import './ThreeDView.css';

interface EyeModelProps {
    textureUrl: string;
    strokes: Stroke[];
}

const EyeModel: React.FC<EyeModelProps> = ({ textureUrl, strokes }) => {
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
        const detachmentStrokes = strokes.filter(s => s.pathology === 'detachment' || s.pathology === 'tear');

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
            if (stroke.points.length < 2) return;
            ctx.lineWidth = stroke.width * scaleX;
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
            }
            ctx.stroke();
        });

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, [strokes]);

    // Custom Shader Logic
    const onBeforeCompile = React.useCallback((shader: any) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uDisplacementMap = { value: displacementMap };

        // Inject uniforms
        shader.vertexShader = `
            uniform float uTime;
            uniform sampler2D uDisplacementMap;
        ` + shader.vertexShader;

        // Inject vertex displacement logic
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            
            // Read displacement from map
            float disp = texture2D(uDisplacementMap, uv).r;

            // Add wave effect only where there is displacement
            if (disp > 0.1) {
                float wave = sin(position.x * 10.0 + uTime * 2.0) * 0.05 + 
                             cos(position.y * 10.0 + uTime * 3.0) * 0.05;
                
                // Displace inwards (towards center of sphere) or outwards?
                // Normal points inwards in our geometry setup?
                // Let's displace along normal.
                
                float strength = 0.3; // Max displacement amount
                transformed += normal * (disp * strength + wave * disp);
            }
            `
        );

        // Save reference to shader to update uniforms
        (materialRef.current as any).userData.shader = shader;

    }, [displacementMap]);

    // Update Uniforms when displacement map changes
    React.useEffect(() => {
        if (materialRef.current && (materialRef.current as any).userData.shader) {
            (materialRef.current as any).userData.shader.uniforms.uDisplacementMap.value = displacementMap;
        }
    }, [displacementMap]);

    // Animation Loop
    React.useEffect(() => {
        let frameId: number;
        const startTime = Date.now();

        const animate = () => {
            const time = (Date.now() - startTime) / 1000;
            if (materialRef.current && (materialRef.current as any).userData.shader) {
                (materialRef.current as any).userData.shader.uniforms.uTime.value = time;
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

            const theta = (r / maxR) * (Math.PI / 2); // 0 at pole, 90 at rim
            const phi = Math.atan2(dy, dx); // Angle around pole

            const R = 2; // Sphere radius

            // Polar coordinates to Cartesian
            // We want the pole (center of image) to be at Z-deepest point?
            // User wants "Inside of the sphere".
            // Let's place the pole at (0, 0, -R) and rim at Z=0?
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

    return (
        <group>
            {/* The Fundus Map */}
            <mesh geometry={geometry}>
                <meshStandardMaterial
                    ref={materialRef}
                    map={texture}
                    side={THREE.FrontSide} // We deformed it such that normals point in? Or we just look at it.
                    roughness={1.0} // Matte surface to avoid glare/white spots
                    metalness={0.0}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* Outline / Rim */}
            <mesh rotation={[0, 0, 0]}>
                <torusGeometry args={[2, 0.05, 16, 100]} />
                <meshBasicMaterial color="#333" />
            </mesh>

            {/* Outer Shell (for depth/shadows from outside) */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[2.02, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#e5e7eb"
                    side={THREE.BackSide} // Render inside of this shell? No, this is the back of the eye.
                // Actually, if we look into the bowl, we see the fundus.
                // The "back" of the eye is behind the fundus.
                />
            </mesh>
        </group>
    );
};

interface ThreeDViewProps {
    textureUrl: string;
    strokes: Stroke[];
    onClose: () => void;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ textureUrl, strokes, onClose }) => {
    return (
        <div className="three-d-modal-overlay">
            <div className="three-d-modal-content">
                <div className="three-d-header">
                    <h2>3D Fundus Visualization</h2>
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
                <div className="three-d-canvas-container">
                    {/* Position camera to look into the hemisphere */}
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
                        <color attach="background" args={['#111827']} />
                        <ambientLight intensity={0.5} />
                        <spotLight
                            position={[5, 5, 5]}
                            angle={0.3}
                            penumbra={1}
                            intensity={1}
                            castShadow
                        />
                        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4f46e5" />

                        <Suspense fallback={<Html center>Loading 3D Model...</Html>}>
                            <EyeModel key={textureUrl} textureUrl={textureUrl} strokes={strokes} />
                        </Suspense>

                        <OrbitControls
                            enablePan={false}
                            minDistance={1}
                            maxDistance={8}
                            // Limit rotation so user doesn't get lost behind the eye
                            minPolarAngle={0}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};
