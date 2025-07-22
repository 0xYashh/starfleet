'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Environment } from './Environment';
import { CameraManager } from './camera-manager';

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