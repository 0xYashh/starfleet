import * as THREE from 'three';
import { InstancedEntry } from './load-vehicle';

// A simple, non-reactive global map to store the instanced mesh entries.
// This allows the main scene to access the meshes for raycasting.
export const vehicleMap = new Map<string, InstancedEntry>(); 