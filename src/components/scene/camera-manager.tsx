'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { useShipsStore } from '@/lib/three/useShipsStore';
import { shipPositions } from '@/lib/three/ship-positions';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

const LERP_FACTOR = 0.04;
const ZOOM_DISTANCE = 2.5;

export function CameraManager() {
  const { camera, controls } = useThree();
  const selectedShip = useShipsStore((state) => state.selectedShip);
  const orbitControls = controls as unknown as OrbitControls;
  
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (!orbitControls) return;

    const onStart = () => setIsInteracting(true);
    const onEnd = () => setIsInteracting(false);

    orbitControls.addEventListener('start', onStart);
    orbitControls.addEventListener('end', onEnd);
    
    return () => {
      orbitControls.removeEventListener('start', onStart);
      orbitControls.removeEventListener('end', onEnd);
    };
  }, [orbitControls]);

  useFrame(() => {
    if (!orbitControls || isInteracting) return;

    let targetPosition: THREE.Vector3;
    let targetLookAt: THREE.Vector3;

    if (selectedShip && shipPositions.has(selectedShip.id)) {
      const shipPosition = shipPositions.get(selectedShip.id)!;
      targetLookAt = shipPosition;
      const direction = shipPosition.clone().normalize();
      targetPosition = shipPosition.clone().add(direction.multiplyScalar(ZOOM_DISTANCE));
    } else {
      targetPosition = new THREE.Vector3(0, 0, 15);
      targetLookAt = new THREE.Vector3(0, 0, 0);
    }

    // Only animate if not already close to the target, to prevent fighting OrbitControls
    if (camera.position.distanceTo(targetPosition) > 0.01 || orbitControls.target.distanceTo(targetLookAt) > 0.01) {
      camera.position.lerp(targetPosition, LERP_FACTOR);
      orbitControls.target.lerp(targetLookAt, LERP_FACTOR);
      orbitControls.update();
    }
  });

  return null;
} 