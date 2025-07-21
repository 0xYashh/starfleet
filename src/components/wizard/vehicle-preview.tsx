'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
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

  return <primitive ref={ref} object={scene} scale={1.2} rotation={[0.2, 0, 0]} />;
}

function LightweightModel({ asset }: { asset: VehicleAsset }) {
  const { scene } = useGLTF(asset.remoteUrl || asset.localPath);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3; // Slower rotation for mobile
    }
  });

  return <primitive ref={ref} object={scene} scale={1.0} rotation={[0.2, 0, 0]} />;
}

export function VehiclePreview({ asset }: { asset: VehicleAsset }) {
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simple mobile detection
    const userAgent = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  // Error fallback - show a simple placeholder
  if (error) {
    return (
      <div className="w-full h-48 rounded-md bg-black/20 cursor-pointer flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="text-4xl mb-2">🚀</div>
          <div className="text-sm">{asset.label}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-md bg-black/20 cursor-pointer">
      <Canvas 
        dpr={isMobile ? 1 : [1, 2]} 
        camera={{ fov: 35 }}
        onError={() => setError(true)}
        gl={isMobile ? { 
          antialias: false,
          powerPreference: "low-power"
        } : undefined}
      >
        <Suspense fallback={null}>
          {isMobile ? (
            // Lightweight version for mobile
            <>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={0.5} />
              <LightweightModel asset={asset} />
            </>
          ) : (
            // Full version for desktop
            <Stage environment="city" intensity={0.6} adjustCamera>
              <Model asset={asset} />
            </Stage>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Ensure the loader is pre-configured to use Draco
useGLTF.preload.toString().includes('draco'); 