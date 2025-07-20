'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// removed Dodecahedron import as clouds are removed

/**
 * Planet – stylised alien globe with atmosphere glow.
 */
export function Planet({ radius = 3 }: { radius?: number }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  // Ref for soft outer haze
  const outerHazeRef = useRef<THREE.Mesh>(null);
  // clouds removed

  // Procedural gradient texture created on the client so we avoid additional assets.
  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    // Reverted resolution from 32x16 back to 64x32
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 600);
    // Reverted to the previous softer blue gradient
    gradient.addColorStop(0, '#c0e8ff');
    gradient.addColorStop(1, '#5aa0ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }, []);

  // cloud clusters removed

  // Atmosphere shader – simple additive blend.
  const atmosphereMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.7, 0.4, 1.0, 1.0) * intensity; // light purple glow
      }
    `;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
  }, []);

  useFrame((_, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.05;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.05;
    // clouds removed
  });

  return (
    <group>
      {/* Globe */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        {/* Reverted to LambertMaterial for a matte look */}
        <meshLambertMaterial
          map={planetTexture}
          emissive={new THREE.Color('#0c1740')}
        />
      </mesh>

      {/* Atmosphere shell */}
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[radius, 64, 64]} />
        {/* @ts-ignore – custom ShaderMaterial type */}
        <primitive object={atmosphereMaterial} />
      </mesh>

      {/* Foggy atmosphere layers */}
      <mesh ref={outerHazeRef} scale={1.1}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#c5b3ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.15}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#a48dff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* clouds removed */}

      {/* Removed ring for simpler look */}

      {/* Key light */}
      <directionalLight position={[5, 3, 2]} intensity={1} castShadow />
      <ambientLight intensity={0.35} />
    </group>
  );
} 