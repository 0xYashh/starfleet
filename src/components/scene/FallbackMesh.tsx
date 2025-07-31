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
    const theta = ship.phase + ship.angular_speed * elapsedTime;
    const x = ship.orbit_radius * Math.cos(theta);
    const y = ship.orbit_radius * Math.sin(theta);
    const z = y * Math.sin(ship.inclination);
    const posY = y * Math.cos(ship.inclination);
    ref.current.position.set(x, posY, z);
    ref.current.scale.set(scale, scale, scale);
    // Debug log for position and scale
    if (Math.abs(theta % (2 * Math.PI)) < 0.01) {
      console.log('[FallbackMesh] Position for', ship.spaceship_id, ':', x, posY, z, 'Scale:', scale);
    }
  });

  return <primitive ref={ref} object={scene} />;
} 