'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Environment } from './Environment';
import { CameraManager } from './camera-manager';

export function SpaceScene() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 15], fov: 45 }}
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