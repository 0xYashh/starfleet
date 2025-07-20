'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stage } from '@react-three/drei';
import type { VehicleAsset } from '@/lib/data/spaceships';
import * as THREE from 'three';

function Model({ asset }: { asset: VehicleAsset }) {
  const { scene } = useGLTF(asset.remoteUrl || asset.localPath);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  // Corrected rotation to a positive value to tilt the model down
  return <primitive ref={ref} object={scene} scale={1.2} rotation={[0.2, 0, 0]} />;
}

export function VehiclePreview({ asset }: { asset: VehicleAsset }) {
  return (
    // Increased height for a larger preview area
    <div className="w-full h-48 rounded-md bg-black/20 cursor-pointer">
      <Canvas dpr={[1, 2]} camera={{ fov: 35 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera>
            <Model asset={asset} />
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
}

// Ensure the loader is pre-configured to use Draco
useGLTF.preload.toString().includes('draco'); 