import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import type { VehicleAsset } from '@/lib/data/spaceships';

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

/**
 * Load multiple vehicles for instancing
 * @param assets Array of vehicle assets to preload
 * @returns Promise resolving to map of preloaded vehicles
 */
export async function preloadVehicles(assets: VehicleAsset[]) {
  const preloaded = new Map<string, Awaited<ReturnType<typeof preloadVehicleForInstancing>>>();
  
  await Promise.all(
    assets.map(async (asset) => {
      try {
        const preloadedAsset = await preloadVehicleForInstancing(asset);
        preloaded.set(asset.id, preloadedAsset);
      } catch (error) {
        console.error(`Failed to preload vehicle ${asset.id}:`, error);
      }
    })
  );
  
  return preloaded;
} 