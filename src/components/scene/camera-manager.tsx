'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Adjusts the initial camera position for mobile devices to provide a wider,
 * "zoomed-out" view of the scene on smaller screens.
 */
export function CameraManager() {
  const { camera } = useThree();

  useEffect(() => {
    // Check for mobile device based on screen width
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Set a further Z position for the camera on mobile
      camera.position.z = 22;
    }
    // On desktop, the default camera position from the Canvas component is used.

    // This effect should only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
} 