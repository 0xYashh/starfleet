'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Starfield – neutral white stars that very slowly drift to give the illusion of depth.
 * Sets a deep-space background colour on the canvas.
 */
export function Starfield() {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.01;
      starsRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <>
      {/* Lighter space backdrop */}
      <color attach="background" args={['#101838']} />

      {/* Single star layer for a calmer, less twinkling effect */}
      <Stars
        ref={starsRef}
        radius={200}
        depth={60}
        count={7000}
        factor={4}
        saturation={0}
        fade
        speed={0.1}
      />
    </>
  );
} 