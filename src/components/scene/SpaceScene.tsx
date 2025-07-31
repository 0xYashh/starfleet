'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Environment } from './Environment';
import { CameraManager } from './camera-manager';
import * as THREE from 'three';
import { vehicleMap } from '@/lib/three/vehicle-map';
import { useShipsStore } from '@/lib/three/useShipsStore';

function InteractionManager() {
  const { camera } = useThree();
  const setSelectedShip = useShipsStore((state) => state.setSelectedShip);
  const ships = useShipsStore((state) => state.ships);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      const meshes = Array.from(vehicleMap.values()).map(e => e.mesh);
      const intersects = raycaster.current.intersectObjects(meshes, false);

      document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    };

    const handleClick = () => {
      raycaster.current.setFromCamera(mouse.current, camera);
      const meshes = Array.from(vehicleMap.values()).map(e => e.mesh);
      const intersects = raycaster.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const { instanceId, object } = intersects[0];
        const mesh = object as THREE.InstancedMesh;
        const entry = Array.from(vehicleMap.values()).find(e => e.mesh === mesh);

        if (entry && instanceId !== undefined) {
          const shipId = entry.shipIds[instanceId];
          const selected = ships.find(s => s.id === shipId);
          if (selected) setSelectedShip(selected);
        }
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('click', handleClick);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [camera, ships, setSelectedShip]);

  return null;
}

export function SpaceScene() {
  const [cursor, setCursor] = useState('auto');

  useEffect(() => {
    const handleMouseDown = () => setCursor('grabbing');
    const handleMouseUp = () => setCursor('grab');
    
    // We target the canvas container for these events
    const canvasContainer = document.querySelector('.fixed.inset-0');
    if (canvasContainer) {
      canvasContainer.addEventListener('mousedown', handleMouseDown);
      canvasContainer.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (canvasContainer) {
        canvasContainer.removeEventListener('mousedown', handleMouseDown);
        canvasContainer.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ cursor: cursor }}
      onMouseEnter={() => setCursor('grab')}
      onMouseLeave={() => setCursor('auto')}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 15], fov: 45 }}
        className="pointer-events-auto"
      >
        <Suspense fallback={null}>
          <Environment />
          <CameraManager />
          <InteractionManager />
        </Suspense>
        <OrbitControls
          // --- Interaction Enhancements ---
          
          // Allow closer inspection of the planet
          minDistance={6}
          maxDistance={30}

          // Make controls feel more responsive
          rotateSpeed={0.5}
          zoomSpeed={1}
          
          // Add damping for a smoother, more premium feel
          enableDamping
          dampingFactor={0.05}

          // --- Existing Settings ---
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />
      </Canvas>
    </div>
  );
} 