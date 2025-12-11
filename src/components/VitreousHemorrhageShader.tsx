import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import type { Point } from '../utils/types';

// GLSL Simplex 3D Noise
const simplexNoise3D = `
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}
`;

// Create shader material using @react-three/drei's shaderMaterial helper
const HemorrhageCloudMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#880000'),
        uEdgeColor: new THREE.Color('#cc3030'),
        uOpacity: 0.6,
    },
    // Vertex shader
    `
  ${simplexNoise3D}
  
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPos;
  
  void main() {
    vec3 pos = position;
    
    // Noise-based vertex displacement for organic shape
    float noise = snoise(pos * 2.0 + uTime * 0.2) * 0.15;
    float noise2 = snoise(pos * 4.0 - uTime * 0.15) * 0.08;
    pos += normal * (noise + noise2);
    
    vNormal = normalize(normalMatrix * normal);
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
  `,
    // Fragment shader
    `
  ${simplexNoise3D}
  
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uEdgeColor;
  uniform float uOpacity;
  
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPos;
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    
    // Fresnel for edge glow
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
    
    // Internal noise for cloudy variation
    float noise = fbm(vWorldPosition * 3.0 + uTime * 0.1) * 0.5 + 0.5;
    
    // Wispy edge effect
    float edgeNoise = fbm(vWorldPosition * 5.0 - uTime * 0.08);
    float wispy = smoothstep(-0.1, 0.7, edgeNoise);
    
    // Distance falloff from center
    float dist = length(vLocalPos);
    float falloff = 1.0 - smoothstep(0.0, 1.0, dist * 1.2);
    
    // Combine opacity
    float alpha = uOpacity * noise * (1.0 - fresnel * 0.5) * falloff * wispy;
    
    // Color mix
    vec3 color = mix(uColor, uEdgeColor, fresnel * 0.6 + noise * 0.2);
    color += vec3(0.3, 0.05, 0.02) * fresnel; // SSS rim
    
    if (alpha < 0.02) discard;
    
    gl_FragColor = vec4(color, alpha);
  }
  `
);

// Extend Three.js
extend({ HemorrhageCloudMaterial });

// Type declaration
declare module '@react-three/fiber' {
    interface ThreeElements {
        hemorrhageCloudMaterial: {
            ref?: React.Ref<THREE.ShaderMaterial>;
            attach?: string;
            transparent?: boolean;
            depthWrite?: boolean;
            side?: THREE.Side;
            uTime?: number;
            uColor?: THREE.Color;
            uEdgeColor?: THREE.Color;
            uOpacity?: number;
        };
    }
}

interface CloudBlobProps {
    position: THREE.Vector3;
    radius: number;
    clippingPlanes: THREE.Plane[];
    seed: number;
}

// Individual animated cloud blob
const CloudBlob: React.FC<CloudBlobProps> = ({ position, radius, clippingPlanes, seed }) => {
    const matRef = useRef<THREE.ShaderMaterial>(null);

    useFrame(({ clock }) => {
        if (matRef.current) {
            matRef.current.uniforms.uTime.value = clock.getElapsedTime() + seed;
        }
    });

    React.useEffect(() => {
        if (matRef.current) {
            matRef.current.clippingPlanes = clippingPlanes;
        }
    }, [clippingPlanes]);

    return (
        <mesh position={position}>
            <icosahedronGeometry args={[radius, 4]} />
            <hemorrhageCloudMaterial
                ref={matRef}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                uTime={0}
                uColor={new THREE.Color('#660000')}
                uEdgeColor={new THREE.Color('#aa2020')}
                uOpacity={0.55}
            />
        </mesh>
    );
};

interface VitreousHemorrhageCloudProps {
    points: Point[];
    width: number;
    zDepth: number;
    map2DTo3D: (p: Point, depth: number) => THREE.Vector3;
    clippingPlanes: THREE.Plane[];
    elementId: string;
}

export const VitreousHemorrhageCloud: React.FC<VitreousHemorrhageCloudProps> = ({
    points,
    width,
    zDepth,
    map2DTo3D,
    clippingPlanes,
    elementId,
}) => {
    // Generate cloud blobs distributed along the stroke
    const cloudBlobs = useMemo(() => {
        if (points.length === 0) return [];

        const blobs: { pos: THREE.Vector3; radius: number; seed: number }[] = [];
        const baseRadius = Math.max(width * 0.015, 0.06);

        // Sample points along stroke
        const numSamples = Math.min(Math.max(Math.floor(points.length / 3), 2), 15);
        const step = Math.max(1, Math.floor(points.length / numSamples));

        for (let i = 0; i < points.length; i += step) {
            const pt = points[i];
            const pos3D = map2DTo3D(pt, zDepth);

            // Vary radius for organic look
            const r = baseRadius * (0.7 + Math.random() * 0.6);
            blobs.push({ pos: pos3D.clone(), radius: r, seed: i * 0.3 });

            // Add satellite blob
            const satelliteOffset = new THREE.Vector3(
                (Math.random() - 0.5) * baseRadius * 1.2,
                (Math.random() - 0.5) * baseRadius * 1.2,
                (Math.random() - 0.5) * baseRadius * 0.6
            );
            blobs.push({
                pos: pos3D.clone().add(satelliteOffset),
                radius: r * 0.5,
                seed: i * 0.3 + 5,
            });
        }

        // Add midpoint blobs for continuity
        for (let i = 0; i < points.length - step; i += step * 2) {
            const p1 = points[i];
            const p2 = points[Math.min(i + step, points.length - 1)];
            const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const midPos = map2DTo3D(mid, zDepth);
            blobs.push({ pos: midPos, radius: baseRadius * 0.6, seed: i + 10 });
        }

        return blobs;
    }, [points, width, zDepth, map2DTo3D]);

    if (cloudBlobs.length === 0) return null;

    return (
        <group>
            {cloudBlobs.map((blob, i) => (
                <CloudBlob
                    key={`${elementId}-${i}`}
                    position={blob.pos}
                    radius={blob.radius}
                    clippingPlanes={clippingPlanes}
                    seed={blob.seed}
                />
            ))}
        </group>
    );
};

interface VitreousHemorrhageSpotProps {
    position: THREE.Vector3;
    radius: number;
    clippingPlanes: THREE.Plane[];
}

export const VitreousHemorrhageSpot: React.FC<VitreousHemorrhageSpotProps> = ({
    position,
    radius,
    clippingPlanes,
}) => {
    return (
        <group position={position}>
            <CloudBlob position={new THREE.Vector3(0, 0, 0)} radius={radius} clippingPlanes={clippingPlanes} seed={0} />
            <CloudBlob position={new THREE.Vector3(radius * 0.4, 0, 0)} radius={radius * 0.5} clippingPlanes={clippingPlanes} seed={1} />
            <CloudBlob position={new THREE.Vector3(-radius * 0.3, radius * 0.3, 0)} radius={radius * 0.4} clippingPlanes={clippingPlanes} seed={2} />
        </group>
    );
};

export default VitreousHemorrhageCloud;
