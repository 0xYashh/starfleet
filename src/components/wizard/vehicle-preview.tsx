'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stage } from '@react-three/drei';
import type { VehicleAsset } from '@/lib/data/spaceships';
import * as THREE from 'three';

function Model({ asset, isMobile = false }: { asset: VehicleAsset; isMobile?: boolean }) {
  const [modelUrl, setModelUrl] = useState(asset.remoteUrl || asset.localPath);
  const [loadError, setLoadError] = useState(false);
  const ref = useRef<THREE.Group>(null);
  
  // Always call useGLTF
  const gltfResult = useGLTF(modelUrl);
  
  // Always call useFrame
  useFrame((_, delta) => {
    if (ref.current && gltfResult?.scene) {
      ref.current.rotation.y += delta * (isMobile ? 0.3 : 0.5);
    }
  });

  // Always call useEffect for scaling
  useEffect(() => {
    if (ref.current && gltfResult?.scene) {
      try {
        const box = new THREE.Box3().setFromObject(gltfResult.scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // Normalize to a consistent size (target size of ~2 units)
        const targetSize = 2;
        const scale = targetSize / maxDimension;
        const finalScale = Math.min(Math.max(scale, 0.8), 1.5); // Clamp between 0.8 and 1.5
        
        ref.current.scale.setScalar(finalScale);
        
        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        ref.current.position.sub(center.multiplyScalar(finalScale));
      } catch (error) {
        console.warn('Error scaling model:', error);
      }
    }
  }, [gltfResult?.scene]);

  // Handle fallback URL switching
  useEffect(() => {
    if (!gltfResult?.scene && !loadError && modelUrl === asset.remoteUrl) {
      setLoadError(true);
      setModelUrl(asset.localPath);
    }
  }, [gltfResult?.scene, loadError, modelUrl, asset.remoteUrl, asset.localPath]);

  // If no scene loaded, show placeholder
  if (!gltfResult?.scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#666" />
      </mesh>
    );
  }

  return <primitive ref={ref} object={gltfResult.scene} rotation={[0.2, 0, 0]} />;
}

function FallbackPreview({ asset }: { asset: VehicleAsset }) {
  return (
    <div className="w-full h-48 rounded-md bg-black/20 cursor-pointer flex items-center justify-center">
      <div className="text-center text-white/60">
        <div className="text-4xl mb-2">🚀</div>
        <div className="text-sm">{asset.label}</div>
        <div className="text-xs text-white/40 mt-1">Preview unavailable</div>
      </div>
    </div>
  );
}

export function VehiclePreview({ asset }: { asset: VehicleAsset }) {
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simple mobile detection
    const userAgent = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  // Show loading state until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="w-full h-48 rounded-md bg-black/20 animate-pulse" />
    );
  }

  // Error fallback
  if (error) {
    return <FallbackPreview asset={asset} />;
  }

  return (
    <div className="w-full h-48 rounded-md bg-black/20 cursor-pointer">
      <Canvas 
        dpr={isMobile ? 1 : [1, 2]} 
        camera={{ fov: 35, position: [0, 0, 4] }}
        onError={() => setError(true)}
        gl={isMobile ? { 
          antialias: false,
          powerPreference: "low-power",
          alpha: false // Disable transparency for better performance
        } : undefined}
        onCreated={({ gl }) => {
          // Proper setup to prevent rendering issues
          gl.domElement.style.display = 'block';
          gl.domElement.style.pointerEvents = 'auto';
        }}
      >
        <Suspense fallback={null}>
          {isMobile ? (
            // Lightweight version for mobile
            <>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={0.5} />
              <Model asset={asset} isMobile={true} />
            </>
          ) : (
            // Full version for desktop
            <Stage environment="city" intensity={0.6} adjustCamera={false}>
              <Model asset={asset} isMobile={false} />
            </Stage>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models for better performance
useGLTF.preload.toString().includes('draco'); 