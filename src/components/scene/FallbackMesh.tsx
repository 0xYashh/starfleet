import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Ship } from '@/lib/types/ship';

interface FallbackMeshProps {
  scene: THREE.Group;
  ship: Ship;
  scale: number;
}

export function FallbackMesh({ scene, ship, scale }: FallbackMeshProps) {
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    console.log('[FallbackMesh] Rendering fallback for', ship.spaceship_id, 'scene:', scene);
    if (scene) {
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          console.log('[FallbackMesh] Mesh found:', obj.name, obj);
        }
      });
    }
  }, [scene, ship.spaceship_id]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const elapsedTime = clock.getElapsedTime();

    // Defensive defaults: fall back to 0 if any orbital param is null/undefined
    const phase = ship.phase ?? 0;
    const angularSpeed = ship.angular_speed ?? 0;
    const orbitRadius = ship.orbit_radius ?? 0;
    const inclination = ship.inclination ?? 0;

    const theta = phase + angularSpeed * elapsedTime;
    const x = orbitRadius * Math.cos(theta);
    const y = orbitRadius * Math.sin(theta);
    const z = y * Math.sin(inclination);
    const posY = y * Math.cos(inclination);
    ref.current.position.set(x, posY, z);
    ref.current.scale.set(scale, scale, scale);
    // Debug log for position and scale
    if (Math.abs(theta % (2 * Math.PI)) < 0.01) {
      console.log('[FallbackMesh] Position for', ship.spaceship_id, ':', x, posY, z, 'Scale:', scale);
    }
  });

  return <primitive ref={ref} object={scene} />;
} 