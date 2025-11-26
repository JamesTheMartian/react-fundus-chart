import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import './ThreeDView.css';

interface EyeModelProps {
    textureUrl: string;
}

const EyeModel: React.FC<EyeModelProps> = ({ textureUrl }) => {
    const texture = useLoader(THREE.TextureLoader, textureUrl);

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
                    map={texture}
                    side={THREE.FrontSide} // We deformed it such that normals point in? Or we just look at it.
                    roughness={0.4}
                    metalness={0.1}
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
    onClose: () => void;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ textureUrl, onClose }) => {
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
                            <EyeModel key={textureUrl} textureUrl={textureUrl} />
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
