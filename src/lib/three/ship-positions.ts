import * as THREE from 'three';

// A simple, non-reactive global map to store the real-time 3D positions of ships.
// This is used to communicate between the ShipsInstancedMesh (writer) and the CameraManager (reader)
// without causing React re-renders on every frame.
export const shipPositions = new Map<string, THREE.Vector3>(); 