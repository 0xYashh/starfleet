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
  
  const gltfResult = useGLTF(modelUrl);
  
  useFrame((_, delta) => {
    if (ref.current && gltfResult?.scene) {
      ref.current.rotation.y += delta * (isMobile ? 0.3 : 0.5);
    }
  });

  useEffect(() => {
    if (!ref.current || !gltfResult?.scene) return;
    try {
      const scene = gltfResult.scene;
      const box = new THREE.Box3().setFromObject(scene);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const radius = sphere.radius;

      const cameraDistance = 4;
      const fov = THREE.MathUtils.degToRad(35);
      const viewportHeightAtDist = 2 * cameraDistance * Math.tan(fov / 2);

      const targetSize = (viewportHeightAtDist * 0.8) / 2;
      let scale = targetSize / radius;
      scale = THREE.MathUtils.clamp(scale, 0.2, 2.5);
      ref.current.scale.setScalar(scale);

      const center = sphere.center;
      ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    } catch (err) {
      console.warn('VehiclePreview auto-fit failed:', err);
    }
  }, [gltfResult?.scene]);

  useEffect(() => {
    if (!gltfResult?.scene && !loadError && modelUrl === asset.remoteUrl) {
      setLoadError(true);
      setModelUrl(asset.localPath);
    }
  }, [gltfResult?.scene, loadError, modelUrl, asset.remoteUrl, asset.localPath]);

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
    <div className="w-full h-56 rounded-md bg-black/20 cursor-pointer flex items-center justify-center">
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
    const userAgent = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  if (!mounted) {
    return <div className="w-full h-56 rounded-md bg-black/20 animate-pulse" />;
  }
  
  // On mobile, render a lightweight static image to prevent crashes.
  if (isMobile) {
    return (
      <div className="w-full h-56 rounded-md bg-black/20 cursor-pointer">
        <img 
          src={asset.previewPng || '/icon/starfleet.svg'} 
          alt={asset.label} 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // On desktop, render the full 3D interactive preview.
  if (error) {
    return <FallbackPreview asset={asset} />;
  }

  return (
    <div className="w-full h-56 rounded-md bg-black/20 cursor-pointer">
      <Canvas 
        dpr={[1, 2]} 
        camera={{ fov: 35, position: [0, 0, 4] }}
        onError={() => setError(true)}
        onCreated={({ gl }) => {
          gl.domElement.style.display = 'block';
          gl.domElement.style.pointerEvents = 'auto';
        }}
      >
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera>
            <Model asset={asset} isMobile={false} />
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload.toString().includes('draco'); 