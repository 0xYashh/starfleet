'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useShipsStore } from '@/lib/three/useShipsStore';
import { shipPositions } from '@/lib/three/ship-positions';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

const LERP_FACTOR = 0.04;
const ZOOM_DISTANCE = 5;

export function CameraManager() {
  const { camera, controls } = useThree();
  const selectedShip = useShipsStore((state) => state.selectedShip);
  
  const initialCameraPosition = useRef(new THREE.Vector3(0, 0, 15));
  const initialTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!controls) return;
    const orbitControls = controls as unknown as OrbitControls;

    let targetPosition: THREE.Vector3;
    let targetLookAt: THREE.Vector3;

    if (selectedShip && shipPositions.has(selectedShip.id)) {
      const shipPosition = shipPositions.get(selectedShip.id)!;
      targetLookAt = shipPosition;
      
      // Calculate a nice camera position behind the ship
      const direction = shipPosition.clone().normalize();
      targetPosition = shipPosition.clone().add(direction.multiplyScalar(ZOOM_DISTANCE));

    } else {
      targetPosition = initialCameraPosition.current;
      targetLookAt = initialTarget.current;
    }

    // Smoothly interpolate camera position and controls target
    camera.position.lerp(targetPosition, LERP_FACTOR);
    orbitControls.target.lerp(targetLookAt, LERP_FACTOR);
    
    // It's important to call update after manually changing the target
    orbitControls.update();
  });

  return null;
} 