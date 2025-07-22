import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import type { VehicleAsset } from '@/lib/data/spaceships';
import type { GLTF } from 'three-stdlib';

// Initialize GLTF loader with Draco compression support
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Draco decoder files in public/draco/ (optional)
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Universal vehicle loader that tries UploadThing CDN first, falls back to local file
 * @param asset Vehicle asset configuration
 * @returns Promise resolving to loaded GLTF
 */
export async function loadVehicle(asset: VehicleAsset): Promise<THREE.Group> {
  try {
    // Primary: Try UploadThing CDN
    console.log(`Loading vehicle from CDN: ${asset.remoteUrl}`);
    const gltf = await gltfLoader.loadAsync(asset.remoteUrl);
    return gltf.scene;
  } catch (error) {
    // Fallback: Use local bundled file
    console.warn(`CDN failed for ${asset.id}, falling back to local:`, error);
    try {
      const gltf = await gltfLoader.loadAsync(asset.localPath);
      return gltf.scene;
    } catch (fallbackError) {
      console.error(`Failed to load vehicle ${asset.id} from both CDN and local:`, fallbackError);
      throw new Error(`Unable to load vehicle model: ${asset.id}`);
    }
  }
}

/**
 * Preload a vehicle model and cache it for instancing
 * @param asset Vehicle asset configuration
 * @returns Promise resolving to the loaded geometry and material
 */
export async function preloadVehicleForInstancing(asset: VehicleAsset) {
  const scene = await loadVehicle(asset);
  
  // Extract geometry and material from the first mesh
  const mesh = scene.children.find(child => child.type === 'Mesh') as THREE.Mesh;
  if (!mesh) {
    throw new Error(`No mesh found in vehicle model: ${asset.id}`);
  }

  return {
    geometry: mesh.geometry,
    material: mesh.material,
    scene: scene.clone() // Clone for individual instances
  };
}

export interface InstancedEntry {
  mesh: THREE.InstancedMesh;
  shipIds: string[];
}

export async function preloadVehicles(assets: VehicleAsset[]): Promise<Map<string, { geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[] }>> {
  const loader = new GLTFLoader();
  const preloaded = new Map();

  for (const asset of assets) {
    try {
      const gltf = (await loader.loadAsync(asset.localPath)) as GLTF;
      gltf.scene.traverse(obj => {
        if ((obj as THREE.Mesh).isMesh) {
          preloaded.set(asset.id, {
            geometry: (obj as THREE.Mesh).geometry,
            material: (obj as THREE.Mesh).material
          });
        }
      });
    } catch (e) {
      console.error(`Failed to preload vehicle ${asset.id}:`, e);
    }
  }
  return preloaded;
} 