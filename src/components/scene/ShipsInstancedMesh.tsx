"use client";

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3, PointLight, AmbientLight } from 'three';
import { useGLTF } from '@react-three/drei';
import { useShipsStore } from '@/lib/three/useShipsStore';
import { supabase } from '@/lib/supabase/client';
import type { Ship } from '@/lib/types/ship';
import { getVehicleById, VehicleAsset } from '@/lib/data/spaceships';
import { ShipLabel } from './ShipLabel';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { shipPositions } from '@/lib/three/ship-positions';

// Removed unused constants

// Ship scale configuration - easy to tweak individual ships
const SHIP_SCALES: Record<string, number> = {
  // Free Aircraft
  'jet': 0.01,
  'airship': 0.004,
  
  // Paid Spaceships
  'air-police': 0.15,
  'colored-freighter': 0.30,
  'x-wing-2': 0.3,
  'x-wing': 0.45,
  'ship-1': 0.003, // Stardust Cruiser
  'ship-2': 0.15,
  'ship-3': 0.15,
  'ship-4': 0.15,
  'ship-5': 4.40,
};

// Ship instances - one per ship in database
const shipInstances = new Map<string, { 
  asset: VehicleAsset;
  ref: React.RefObject<Group | null>;
  ship: Ship;
}>();

function ShipInstance({ ship, asset }: { ship: Ship; asset: VehicleAsset }) {
  const ref = useRef<Group>(null);
  // Start with local path for paid ships, remote for free ships
  const [modelUrl, setModelUrl] = useState(asset.price > 0 ? asset.localPath : (asset.remoteUrl || asset.localPath));
  const [loadError, setLoadError] = useState(false);
  
  // Use the same loading logic as launch wizard
  const gltfResult = useGLTF(modelUrl);
  
  // Register this instance
  useEffect(() => {
    if (ref.current) {
      shipInstances.set(ship.id, { asset, ref, ship });
      return () => {
        shipInstances.delete(ship.id);
      };
    }
  }, [ship.id, ship, asset]);

  // Fallback loading logic like launch wizard
  useEffect(() => {
    if (!gltfResult?.scene && !loadError) {
      // For paid ships: try remote if local failed
      if (asset.price > 0 && modelUrl === asset.localPath && asset.remoteUrl) {
        console.log(`[ShipInstance] Local failed for paid ship ${asset.id}, trying remote: ${asset.remoteUrl}`);
        setLoadError(true);
        setModelUrl(asset.remoteUrl);
      }
      // For free ships: try local if remote failed
      else if (asset.price === 0 && modelUrl === asset.remoteUrl && asset.localPath) {
        console.log(`[ShipInstance] Remote failed for free ship ${asset.id}, trying local: ${asset.localPath}`);
        setLoadError(true);
        setModelUrl(asset.localPath);
      }
    }
  }, [gltfResult?.scene, loadError, modelUrl, asset.localPath, asset.remoteUrl, asset.id, asset.price]);

    // Apply proper scaling and orientation like launch wizard
  useEffect(() => {
    if (!ref.current || !gltfResult?.scene) return;
    
    try {
      // Clone the scene to avoid conflicts
      const clonedScene = gltfResult.scene.clone();
      
      // Clear existing children and add cloned scene
      ref.current.clear();
      ref.current.add(clonedScene);
      
      // Get scale from configuration, fallback to default
      const scaleValue = SHIP_SCALES[asset.id] ?? 0.20;

      ref.current.scale.setScalar(scaleValue);
      
      // No initial rotation - let the orbital mechanics handle orientation
      
      // Add lighting to the ship model
      const shipLight = new PointLight(0xffffff, 0.5, 2);
      shipLight.position.set(0, 0.5, 0);
      ref.current.add(shipLight);
      
      // Add ambient light to the ship
      const ambientLight = new AmbientLight(0x404040, 0.3);
      ref.current.add(ambientLight);
      
      console.log(`[ShipInstance] Successfully set up ship ${ship.name} (${asset.id}) with scale ${scaleValue} and lighting`);
    } catch (err) {
      console.error(`[ShipInstance] Error setting up ship ${ship.name}:`, err);
    }
  }, [gltfResult?.scene, ship.name, asset.id, asset.category]);

  if (!gltfResult?.scene) {
    return null; // Don't render anything if model isn't loaded
  }

  return <group ref={ref} />;
}

export function ShipsInstancedMesh() {
  const { camera } = useThree();
  const labelGroupRef = useRef<Group>(null);
  const { ships, setShips, addShip } = useShipsStore();
  
  // Performance optimization: Only render ships within camera view
  const [visibleShips, setVisibleShips] = useState<Ship[]>([]);

  // Initial data fetch and real-time subscription
  useEffect(() => {
    async function fetchInitialShips() {
      console.log('[ShipsInstancedMesh] Fetching initial ships...');
      const { data, error } = await supabase.from('ships').select('*');
      if (error) {
        console.error('[ShipsInstancedMesh] Error fetching ships:', error);
        return;
      }
      console.log('[ShipsInstancedMesh] Fetched ships:', data);
      if (data) {
        setShips(data as Ship[]);
        setVisibleShips(data as Ship[]); // Initially show all ships
      }
    }
    fetchInitialShips();

    const channel = supabase
      .channel('public:ships')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ships' }, (payload: RealtimePostgresInsertPayload<Ship>) => {
        console.log('[ShipsInstancedMesh] Real-time insert received:', payload.new);
        addShip(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setShips, addShip]);

  // Keep visibleShips in sync with ships store when under performance threshold
  useEffect(() => {
    if (ships.length <= 50) {
      setVisibleShips(ships);
    }
  }, [ships]);

  // Performance optimization: Update visible ships based on camera distance
  useFrame(() => {
    if (ships.length > 50) { // Only apply culling for large numbers
      const cameraPosition = camera.position;
      const visible = ships.filter(ship => {
        // Simple distance-based culling
        const shipPos = shipPositions.get(ship.id);
        if (!shipPos) return true;
        
        const distance = cameraPosition.distanceTo(shipPos);
        return distance < 20; // Only render ships within 20 units
      });
      
      if (visible.length !== visibleShips.length) {
        setVisibleShips(visible);
      }
    }
  });

  // Per-frame orbit calculation and positioning with TRUE 3D ORBITAL MECHANICS
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Update positions for all ship instances with true 3D orbital mechanics
    shipInstances.forEach(({ ref, ship }, shipId) => {
      if (!ref.current) return;

      // TRUE 3D ORBITAL MECHANICS - Satellite-like behavior
      // Ensure ships always move (some entries may have near-zero speeds)
      const baseAngularSpeed = ship.angular_speed ?? 0;
      const minAngularSpeed = 0.05; // radians/sec visual minimum
      const angularSpeed = Math.abs(baseAngularSpeed) < minAngularSpeed
        ? Math.sign(baseAngularSpeed || 1) * minAngularSpeed
        : baseAngularSpeed;

      // Safely handle possibly-null DB values
      const orbitRadius = ship.orbit_radius ?? 0;
      const inclination = ship.inclination ?? 0;
      const ascendingNode = ship.ascending_node ?? 0;
      const eccentricity = ship.eccentricity ?? 0.1;
      const phase = ship.phase ?? 0;

      const theta = phase + angularSpeed * elapsedTime;
      
      // Calculate eccentric orbit position
      const r = orbitRadius * (1 - eccentricity * Math.cos(theta));
      const x_orbital = r * Math.cos(theta);
      const y_orbital = r * Math.sin(theta);
      
      // Apply 3D orbital plane transformation
      const cos_node = Math.cos(ascendingNode);
      const sin_node = Math.sin(ascendingNode);
      const cos_incl = Math.cos(inclination);
      const sin_incl = Math.sin(inclination);
      
      // Transform from orbital plane to 3D space
      const x_temp = x_orbital * cos_node - y_orbital * sin_node;
      const y_temp = x_orbital * sin_node + y_orbital * cos_node;
      
      const x = x_temp;
      const y = y_temp * cos_incl;
      const z = y_temp * sin_incl;
      
      // Position the ship in 3D space
      ref.current.position.set(x, y, z);
      
      // Safety check: Prevent ships from going inside the planet
      const distanceFromCenter = Math.sqrt(x*x + y*y + z*z);
      const planetRadius = 3; // Approximate planet radius
      if (distanceFromCenter < planetRadius + 0.5) {
        // Move ship to safe distance
        const safeDistance = planetRadius + 0.5;
        const scale = safeDistance / distanceFromCenter;
        ref.current.position.set(x * scale, y * scale, z * scale);
      }
      
      // Calculate velocity vector for proper orientation
      const v_theta = angularSpeed;
      const v_r = orbitRadius * eccentricity * v_theta * Math.sin(theta);
      const v_orbital_x = -r * v_theta * Math.sin(theta) + v_r * Math.cos(theta);
      const v_orbital_y = r * v_theta * Math.cos(theta) + v_r * Math.sin(theta);
      
      // Transform velocity to 3D space
      const v_x_temp = v_orbital_x * cos_node - v_orbital_y * sin_node;
      const v_y_temp = v_orbital_x * sin_node + v_orbital_y * cos_node;
      
      const v_x = v_x_temp;
      const v_y = v_y_temp * cos_incl;
      const v_z = v_y_temp * sin_incl;
      
      // Create velocity vector for orientation
      const velocity = new Vector3(v_x, v_y, v_z);
      const position = new Vector3(x, y, z);
      
      // Orient ship along velocity vector (direction of travel)
      if (velocity.length() > 0.001) {
        velocity.normalize();
        
        // Calculate the look-at position ahead of the ship
        const lookAheadDistance = 1.0; // Look 1 unit ahead
        const lookAtPosition = position.clone().add(velocity.clone().multiplyScalar(lookAheadDistance));
        
        // Make ship point its nose in the direction of travel
        ref.current.lookAt(lookAtPosition);
        
        // Adjust for ship-specific orientation (different ships have different "forward" directions)
        const asset = shipInstances.get(shipId)?.asset;
        if (asset) {
          // Different ships may need different initial rotations
          switch (asset.id) {
            case 'x-wing':
            case 'x-wing-2':
              ref.current.rotateY(Math.PI); // X-wings need 180° rotation
              break;
            case 'colored-freighter':
              ref.current.rotateY(Math.PI / 2); // Freighter needs 90° rotation
              break;
            case 'jet':
            case 'air-police':
              ref.current.rotateY(-Math.PI / 2); // Jets need -90° rotation
              break;
            case 'airship':
              ref.current.rotateY(-Math.PI / 2); // Align airship forward direction
              break;
            default:
              // Most ships work with default orientation
              break;
          }
        }
        
        // Add slight banking based on orbital direction
        const bankAngle = Math.sin(theta) * 0.1;
        ref.current.rotateZ(bankAngle);
        
        // Debug: Log ship orientation every 5 seconds
        if (Math.floor(elapsedTime) % 5 === 0) {
          console.log(`[ShipInstance] ${ship.name} (${asset?.id}) - Position: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) - Velocity: (${v_x.toFixed(2)}, ${v_y.toFixed(2)}, ${v_z.toFixed(2)})`);
        }
      }
      
      // Add subtle rotation and movement for life
      ref.current.rotation.y += 0.005;
      
      // Add slight bobbing motion
      const bobHeight = Math.sin(elapsedTime * 1.2 + phase) * 0.03;
      ref.current.position.y += bobHeight;

      // Store position for camera system
      shipPositions.set(ship.id, ref.current.position.clone());
    });

    // Update label positions with 3D orbital mechanics
    if (labelGroupRef.current) {
      ships.forEach((ship, i) => {
        const label = labelGroupRef.current?.children[i] as Group;
        if (label) {
          const labelPhase = ship.phase ?? 0;
          const labelAngularSpeed = ship.angular_speed ?? 0;
          const labelTheta = labelPhase + labelAngularSpeed * elapsedTime;
          const eccentricity = ship.eccentricity ?? 0.1;
          const ascendingNode = ship.ascending_node ?? 0;
          const orbitRadius = ship.orbit_radius ?? 0;
          const inclination = ship.inclination ?? 0;
          const r = orbitRadius * (1 - eccentricity * Math.cos(labelTheta));
          const x_orbital = r * Math.cos(labelTheta);
          const y_orbital = r * Math.sin(labelTheta);
          
          const cos_node = Math.cos(ascendingNode);
          const sin_node = Math.sin(ascendingNode);
          const cos_incl = Math.cos(inclination);
          const sin_incl = Math.sin(inclination);
          
          const x_temp = x_orbital * cos_node - y_orbital * sin_node;
          const y_temp = x_orbital * sin_node + y_orbital * cos_node;
          
          const x = x_temp;
          const y = y_temp * cos_incl;
          const z = y_temp * sin_incl;
          
          const bobHeight = Math.sin(elapsedTime * 1.2 + labelPhase) * 0.03;
          label.position.set(x, y + bobHeight, z);
          
          // Safety check: Prevent labels from going inside the planet
          const labelDistanceFromCenter = Math.sqrt(x*x + (y+bobHeight)*(y+bobHeight) + z*z);
          const planetRadius = 3; // Approximate planet radius
          if (labelDistanceFromCenter < planetRadius + 0.5) {
            const safeDistance = planetRadius + 0.5;
            const scale = safeDistance / labelDistanceFromCenter;
            label.position.set(x * scale, (y + bobHeight) * scale, z * scale);
          }
        }
      });
    }
  });

  return (
    <>
      {/* Render individual ship instances using the same method as launch wizard */}
      {(visibleShips.length > 0 ? visibleShips : ships).map(ship => {
        const asset = getVehicleById(ship.spaceship_id);
        if (!asset) {
          console.warn(`[ShipsInstancedMesh] No asset found for spaceship_id: ${ship.spaceship_id}`);
          return null;
        }
        
        return (
          <ShipInstance 
            key={ship.id} 
            ship={ship} 
            asset={asset as VehicleAsset}
          />
        );
      })}
      
      {/* Ship labels */}
      <group ref={labelGroupRef}>
        {(visibleShips.length > 0 ? visibleShips : ships).map(ship => (
          <group key={ship.id}>
            <ShipLabel ship={ship} />
          </group>
        ))}
      </group>
    </>
  );
} 