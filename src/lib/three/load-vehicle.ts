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
  // For paid spaceships, try local files first to avoid remote loading issues
  if (asset.price > 0) {
    console.log(`[VehicleLoader] Paid spaceship ${asset.id}: trying localPath first: ${asset.localPath}`);
    try {
      const gltf = await gltfLoader.loadAsync(asset.localPath);
      console.log(`[VehicleLoader] Successfully loaded ${asset.id} from local file`);
      return gltf.scene;
    } catch (localError) {
      console.warn(`[VehicleLoader] LocalPath failed for paid spaceship ${asset.id}, falling back to remoteUrl`, localError);
      try {
        const gltf = await gltfLoader.loadAsync(asset.remoteUrl);
        return gltf.scene;
      } catch (remoteError) {
        console.error(`[VehicleLoader] Both local and remote failed for ${asset.id}`, { localError, remoteError });
        throw new Error(`Unable to load paid spaceship model: ${asset.id}`);
      }
    }
  }
  
  // For free ships, keep the original logic (remote first)
  try {
    console.log(`[VehicleLoader] Free ship ${asset.id}: trying remoteUrl: ${asset.remoteUrl}`);
    const gltf = await gltfLoader.loadAsync(asset.remoteUrl);
    return gltf.scene;
  } catch (error) {
    console.warn(`[VehicleLoader] RemoteUrl failed for ${asset.id}, falling back to localPath: ${asset.localPath}`, error);
    try {
      const gltf = await gltfLoader.loadAsync(asset.localPath);
      return gltf.scene;
    } catch (fallbackError) {
      console.error(`[VehicleLoader] Failed to load vehicle ${asset.id} from both remoteUrl and localPath`, fallbackError);
      throw new Error(`Unable to load vehicle model: ${asset.id}`);
    }
  }
}

function findFirstMesh(obj: any): any {
  console.log(`[findFirstMesh] Analyzing object:`, obj.type, obj.name || 'unnamed');
  
  if (obj.type === 'Mesh') {
    console.log(`[findFirstMesh] Found mesh:`, obj.name || 'unnamed', 'geometry:', obj.geometry?.type, 'material:', obj.material?.type);
    return obj;
  }
  
  // Count all meshes in the scene for debugging
  let meshCount = 0;
  obj.traverse((child: any) => {
    if (child.type === 'Mesh') {
      meshCount++;
      console.log(`[findFirstMesh] Mesh ${meshCount}:`, child.name || `unnamed-${meshCount}`, 'geometry:', child.geometry?.type, 'material:', child.material?.type);
    }
  });
  
  console.log(`[findFirstMesh] Total meshes found: ${meshCount}`);
  
  for (const child of obj.children || []) {
    const mesh = findFirstMesh(child);
    if (mesh) return mesh;
  }
  return null;
}

/**
 * Preload a vehicle model and cache it for instancing
 * @param asset Vehicle asset configuration
 * @returns Promise resolving to the loaded geometry and material
 */
export async function preloadVehicleForInstancing(asset: VehicleAsset) {
  const scene = await loadVehicle(asset);
  const mesh = findFirstMesh(scene);
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
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);
  const preloaded = new Map();

  console.log('[PreloadVehicles] Starting preload for', assets.length, 'assets:', assets.map(a => a.id));

  for (const asset of assets) {
    try {
      let gltf;
      
      // For paid spaceships, try local files first to avoid remote loading issues
      if (asset.price > 0) {
        console.log(`[PreloadVehicles] Paid spaceship ${asset.id}: trying localPath first: ${asset.localPath}`);
        try {
          gltf = (await loader.loadAsync(asset.localPath)) as any;
          console.log(`[PreloadVehicles] ✅ Successfully loaded ${asset.id} from localPath`);
        } catch (localError) {
          console.warn(`[PreloadVehicles] LocalPath failed for paid spaceship ${asset.id}, falling back to remoteUrl`, localError);
          console.log(`[PreloadVehicles] Attempting remoteUrl for ${asset.id}: ${asset.remoteUrl}`);
          gltf = (await loader.loadAsync(asset.remoteUrl)) as any;
          console.log(`[PreloadVehicles] ✅ Successfully loaded ${asset.id} from remoteUrl`);
        }
      } else {
        // For free ships, keep the original logic (remote first)
        try {
          console.log(`[PreloadVehicles] Free ship ${asset.id}: trying remoteUrl: ${asset.remoteUrl}`);
          gltf = (await loader.loadAsync(asset.remoteUrl)) as any;
          console.log(`[PreloadVehicles] ✅ Successfully loaded ${asset.id} from remoteUrl`);
        } catch (remoteError) {
          console.warn(`[PreloadVehicles] RemoteUrl failed for ${asset.id}, falling back to localPath: ${asset.localPath}`, remoteError);
          gltf = (await loader.loadAsync(asset.localPath)) as any;
          console.log(`[PreloadVehicles] ✅ Successfully loaded ${asset.id} from localPath`);
        }
      }
      
      const mesh = findFirstMesh(gltf.scene);
      if (mesh) {

        
        preloaded.set(asset.id, {
          geometry: mesh.geometry,
          material: mesh.material
        });
        console.log(`[PreloadVehicles] ✅ Added ${asset.id} to preloaded map`);
      } else {
        console.error(`No mesh found in vehicle model: ${asset.id}`);
      }
    } catch (e) {
      console.error(`Failed to preload vehicle ${asset.id}:`, e);
    }
  }
  
  console.log('[PreloadVehicles] Completed preload. Successfully loaded:', Array.from(preloaded.keys()));
  return preloaded;
} 