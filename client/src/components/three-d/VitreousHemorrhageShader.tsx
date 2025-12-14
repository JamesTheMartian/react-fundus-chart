import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import type { Point, GraphicsQuality } from '../../utils/types';

// =============================================================================
// GLSL Noise Functions
// =============================================================================

// Simple noise for LOW quality (less GPU intensive)
const simpleNoise = `
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float simpleNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(
        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
`;

// Full Simplex 3D Noise for MEDIUM/HIGH quality
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

// =============================================================================
// LOW Quality Material - Simple solid look, minimal GPU usage
// =============================================================================
const HemorrhageLowMaterial = shaderMaterial(
    {
        uColor: new THREE.Color('#500000'),
        uEdgeColor: new THREE.Color('#800000'),
        uOpacity: 0.92,
    },
    // Vertex shader - no animation
    `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPos;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
    `,
    // Fragment shader - simple solid blood look
    `
    uniform vec3 uColor;
    uniform vec3 uEdgeColor;
    uniform float uOpacity;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPos;
    
    void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
        
        // Simple distance-based falloff
        float dist = length(vLocalPos);
        float falloff = 1.0 - smoothstep(0.0, 1.0, dist);
        
        // Solid blood color
        vec3 color = mix(uColor, uEdgeColor, fresnel * 0.5);
        color += vec3(0.1, 0.01, 0.005) * fresnel;
        
        float alpha = uOpacity * falloff;
        if (alpha < 0.1) discard;
        
        gl_FragColor = vec4(color, alpha);
    }
    `
);

// =============================================================================
// MEDIUM Quality Material - Balanced quality and performance
// =============================================================================
const HemorrhageMediumMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#480000'),
        uEdgeColor: new THREE.Color('#850000'),
        uOpacity: 0.88,
    },
    // Vertex shader - subtle animation
    `
    ${simpleNoise}
    
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPos;
    
    void main() {
        vec3 pos = position;
        
        // Simple noise displacement
        float noise = simpleNoise(pos * 2.0 + uTime * 0.1) * 0.1;
        pos += normal * noise;
        
        vNormal = normalize(normalMatrix * normal);
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        
        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
    `,
    // Fragment shader - medium complexity
    `
    ${simpleNoise}
    
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uEdgeColor;
    uniform float uOpacity;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPos;
    
    void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
        
        // Single layer noise for density
        float density = simpleNoise(vWorldPosition * 3.0 + uTime * 0.05) * 0.5 + 0.5;
        
        // Distance falloff
        float dist = length(vLocalPos);
        float falloff = 1.0 - smoothstep(0.1, 1.0, dist * 0.95);
        
        // Blood color
        vec3 darkBlood = uColor * (0.7 + density * 0.3);
        vec3 color = mix(darkBlood, uEdgeColor, fresnel * 0.4);
        color += vec3(0.12, 0.02, 0.01) * fresnel * density;
        
        float alpha = uOpacity * density * (1.0 - fresnel * 0.25) * falloff;
        alpha = clamp(alpha, 0.0, 0.95);
        
        if (alpha < 0.05) discard;
        
        gl_FragColor = vec4(color, alpha);
    }
    `
);

// =============================================================================
// HIGH Quality Material - Full shader with all effects
// =============================================================================
const HemorrhageHighMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#4a0000'),
        uEdgeColor: new THREE.Color('#8b0000'),
        uOpacity: 0.85,
    },
    // Vertex shader - full liquid animation
    `
    ${simplexNoise3D}
    
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPos;
    
    void main() {
        vec3 pos = position;
        
        // Slower, more viscous movement for blood-like liquid appearance
        float noise = snoise(pos * 3.0 + uTime * 0.08) * 0.12;
        float noise2 = snoise(pos * 6.0 - uTime * 0.05) * 0.06;
        float turbulence = snoise(pos * 1.5 + uTime * 0.03) * 0.08;
        pos += normal * (noise + noise2 + turbulence);
        
        vNormal = normalize(normalMatrix * normal);
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        
        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
    `,
    // Fragment shader - full blood liquid effect
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
        
        // Reduced fresnel for denser, more opaque appearance
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.5);
        
        // Multi-layered internal density variation for blood-like appearance
        float density1 = fbm(vWorldPosition * 4.0 + uTime * 0.04) * 0.5 + 0.5;
        float density2 = fbm(vWorldPosition * 2.0 - uTime * 0.02) * 0.5 + 0.5;
        float density3 = fbm(vWorldPosition * 8.0 + uTime * 0.06) * 0.3 + 0.7;
        float combinedDensity = (density1 * 0.5 + density2 * 0.3 + density3 * 0.2);
        
        // Less wispy, more solid edges for blood clot appearance
        float edgeNoise = fbm(vWorldPosition * 3.0 - uTime * 0.03);
        float solidEdge = smoothstep(-0.3, 0.5, edgeNoise);
        
        // Distance falloff from center - less aggressive for denser core
        float dist = length(vLocalPos);
        float falloff = 1.0 - smoothstep(0.2, 1.0, dist * 0.9);
        
        // Combine opacity with higher base value for denser appearance
        float alpha = uOpacity * combinedDensity * (1.0 - fresnel * 0.3) * falloff * solidEdge;
        alpha = clamp(alpha, 0.0, 0.95);
        
        // Darker, richer blood color mix with internal density variation
        vec3 darkBlood = uColor * (0.6 + combinedDensity * 0.4);
        vec3 color = mix(darkBlood, uEdgeColor, fresnel * 0.4 + combinedDensity * 0.15);
        
        // Subtle subsurface scattering for blood-like translucency
        color += vec3(0.15, 0.02, 0.01) * fresnel * combinedDensity;
        
        if (alpha < 0.05) discard;
        
        gl_FragColor = vec4(color, alpha);
    }
    `
);

// =============================================================================
// Extend Three.js with all materials
// =============================================================================
extend({ HemorrhageLowMaterial, HemorrhageMediumMaterial, HemorrhageHighMaterial });

// Type declarations
declare module '@react-three/fiber' {
    interface ThreeElements {
        hemorrhageLowMaterial: {
            ref?: React.Ref<THREE.ShaderMaterial>;
            attach?: string;
            transparent?: boolean;
            depthWrite?: boolean;
            side?: THREE.Side;
            uColor?: THREE.Color;
            uEdgeColor?: THREE.Color;
            uOpacity?: number;
        };
        hemorrhageMediumMaterial: {
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
        hemorrhageHighMaterial: {
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

// =============================================================================
// Quality-specific settings
// =============================================================================
interface QualitySettings {
    geometryDetail: number;      // Icosahedron detail level
    blobCount: 'minimal' | 'normal' | 'full';
    enableAnimation: boolean;
    colors: {
        core: string;
        edge: string;
    };
    opacity: number;
}

const QUALITY_SETTINGS: Record<GraphicsQuality, QualitySettings> = {
    low: {
        geometryDetail: 2,
        blobCount: 'minimal',
        enableAnimation: false,
        colors: { core: '#500000', edge: '#800000' },
        opacity: 0.92,
    },
    medium: {
        geometryDetail: 3,
        blobCount: 'normal',
        enableAnimation: true,
        colors: { core: '#480000', edge: '#850000' },
        opacity: 0.88,
    },
    high: {
        geometryDetail: 4,
        blobCount: 'full',
        enableAnimation: true,
        colors: { core: '#3d0000', edge: '#7a0000' },
        opacity: 1.0,
    },
};

// =============================================================================
// CloudBlob Component - Renders individual blood blobs
// =============================================================================
interface CloudBlobProps {
    position: THREE.Vector3;
    radius: number;
    clippingPlanes: THREE.Plane[];
    seed: number;
    quality: GraphicsQuality;
}

const CloudBlob: React.FC<CloudBlobProps> = ({ position, radius, clippingPlanes, seed, quality }) => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const settings = QUALITY_SETTINGS[quality];

    useFrame(({ clock }) => {
        if (matRef.current && settings.enableAnimation && 'uTime' in matRef.current.uniforms) {
            matRef.current.uniforms.uTime.value = clock.getElapsedTime() + seed;
        }
    });

    React.useEffect(() => {
        if (matRef.current) {
            matRef.current.clippingPlanes = clippingPlanes;
        }
    }, [clippingPlanes]);

    const coreColor = new THREE.Color(settings.colors.core);
    const edgeColor = new THREE.Color(settings.colors.edge);

    return (
        <mesh position={position}>
            <icosahedronGeometry args={[radius, settings.geometryDetail]} />
            {quality === 'low' && (
                <hemorrhageLowMaterial
                    ref={matRef}
                    transparent
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    uColor={coreColor}
                    uEdgeColor={edgeColor}
                    uOpacity={settings.opacity}
                />
            )}
            {quality === 'medium' && (
                <hemorrhageMediumMaterial
                    ref={matRef}
                    transparent
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    uTime={0}
                    uColor={coreColor}
                    uEdgeColor={edgeColor}
                    uOpacity={settings.opacity}
                />
            )}
            {quality === 'high' && (
                <hemorrhageHighMaterial
                    ref={matRef}
                    transparent
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    uTime={0}
                    uColor={coreColor}
                    uEdgeColor={edgeColor}
                    uOpacity={settings.opacity}
                />
            )}
        </mesh>
    );
};

// =============================================================================
// VitreousHemorrhageCloud - Main cloud rendering component
// =============================================================================
interface VitreousHemorrhageCloudProps {
    points: Point[];
    width: number;
    zDepth: number;
    map2DTo3D: (p: Point, depth: number) => THREE.Vector3;
    clippingPlanes: THREE.Plane[];
    elementId: string;
    quality?: GraphicsQuality;
}

export const VitreousHemorrhageCloud: React.FC<VitreousHemorrhageCloudProps> = ({
    points,
    width,
    zDepth,
    map2DTo3D,
    clippingPlanes,
    elementId,
    quality = 'high',
}) => {
    const settings = QUALITY_SETTINGS[quality];

    // Generate cloud blobs distributed along the stroke
    const cloudBlobs = useMemo(() => {
        if (points.length === 0) return [];

        const blobs: { pos: THREE.Vector3; radius: number; seed: number }[] = [];
        const baseRadius = Math.max(width * 0.015, 0.06);

        // Adjust sampling based on quality
        let maxBlobs: number;
        switch (settings.blobCount) {
            case 'minimal':
                maxBlobs = 6;
                break;
            case 'normal':
                maxBlobs = 10;
                break;
            case 'full':
            default:
                maxBlobs = 15;
                break;
        }

        const numSamples = Math.min(Math.max(Math.floor(points.length / 3), 2), maxBlobs);
        const step = Math.max(1, Math.floor(points.length / numSamples));

        for (let i = 0; i < points.length; i += step) {
            const pt = points[i];
            const pos3D = map2DTo3D(pt, zDepth);

            // Vary radius for organic look
            const r = baseRadius * (0.7 + Math.random() * 0.6);
            blobs.push({ pos: pos3D.clone(), radius: r, seed: i * 0.3 });

            // Add satellite blobs only for normal and full quality
            if (settings.blobCount !== 'minimal') {
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
        }

        // Add midpoint blobs for continuity (only for full quality)
        if (settings.blobCount === 'full') {
            for (let i = 0; i < points.length - step; i += step * 2) {
                const p1 = points[i];
                const p2 = points[Math.min(i + step, points.length - 1)];
                const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                const midPos = map2DTo3D(mid, zDepth);
                blobs.push({ pos: midPos, radius: baseRadius * 0.6, seed: i + 10 });
            }
        }

        return blobs;
    }, [points, width, zDepth, map2DTo3D, settings.blobCount]);

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
                    quality={quality}
                />
            ))}
        </group>
    );
};

// =============================================================================
// VitreousHemorrhageSpot - Spot hemorrhage rendering
// =============================================================================
interface VitreousHemorrhageSpotProps {
    position: THREE.Vector3;
    radius: number;
    clippingPlanes: THREE.Plane[];
    quality?: GraphicsQuality;
}

export const VitreousHemorrhageSpot: React.FC<VitreousHemorrhageSpotProps> = ({
    position,
    radius,
    clippingPlanes,
    quality = 'high',
}) => {
    const settings = QUALITY_SETTINGS[quality];

    return (
        <group position={position}>
            <CloudBlob position={new THREE.Vector3(0, 0, 0)} radius={radius} clippingPlanes={clippingPlanes} seed={0} quality={quality} />
            {settings.blobCount !== 'minimal' && (
                <>
                    <CloudBlob position={new THREE.Vector3(radius * 0.4, 0, 0)} radius={radius * 0.5} clippingPlanes={clippingPlanes} seed={1} quality={quality} />
                    <CloudBlob position={new THREE.Vector3(-radius * 0.3, radius * 0.3, 0)} radius={radius * 0.4} clippingPlanes={clippingPlanes} seed={2} quality={quality} />
                </>
            )}
        </group>
    );
};

export default VitreousHemorrhageCloud;
