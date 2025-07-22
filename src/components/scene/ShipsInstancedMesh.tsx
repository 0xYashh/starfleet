"use client";

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, DynamicDrawUsage, Group, Vector3 } from 'three';
import { useShipsStore } from '@/lib/three/useShipsStore';
import { supabase } from '@/lib/supabase/client';
import type { Ship } from '@/lib/types/ship';
import { getFreeVehicles, getPaidVehicles, getVehicleById } from '@/lib/data/spaceships';
import { preloadVehicles, InstancedEntry } from '@/lib/three/load-vehicle';
import { ShipLabel } from './ShipLabel';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { shipPositions } from '@/lib/three/ship-positions';

const tempObject = new Object3D();
const upVector = new Vector3(0, 1, 0);
const allAssets = [...getFreeVehicles(), ...getPaidVehicles()];
const SCALE = 0.01; // Final scale adjustment for a more distant view

export function ShipsInstancedMesh() {
  const meshGroupRef = useRef<Group>(null);
  const labelGroupRef = useRef<Group>(null);
  const vehicleMapRef = useRef<Map<string, InstancedEntry>>(new Map());
  const { ships, setShips, addShip } = useShipsStore();

  // Initial data fetch and real-time subscription
  useEffect(() => {
    async function fetchInitialShips() {
      const { data } = await supabase.from('ships').select('*');
      if (data) setShips(data as Ship[]);
    }
    fetchInitialShips();

    const channel = supabase
      .channel('public:ships')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ships' }, (payload: RealtimePostgresInsertPayload<Ship>) => {
        addShip(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setShips, addShip]);

  // Preload all vehicle models and create instanced meshes
  useEffect(() => {
    preloadVehicles(allAssets).then((preloaded) => {
      preloaded.forEach(({ geometry, material }, id) => {
        const mesh = new InstancedMesh(geometry, material, 500);
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.count = 0;
        vehicleMapRef.current.set(id, { mesh, shipIds: [] });
        meshGroupRef.current?.add(mesh);
      });
    });
  }, []);
  
  // Per-frame orbit calculation
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const shipsByVehicle: Record<string, Ship[]> = {};

    for (const ship of ships) {
      if (!shipsByVehicle[ship.spaceship_id]) {
        shipsByVehicle[ship.spaceship_id] = [];
      }
      shipsByVehicle[ship.spaceship_id].push(ship);
    }
    
    vehicleMapRef.current.forEach((entry, vehicleId) => {
      const { mesh } = entry;
      const currentShips = shipsByVehicle[vehicleId] || [];
      mesh.count = currentShips.length;

      currentShips.forEach((ship, i) => {
        const theta = ship.phase + ship.angular_speed * elapsedTime;
        const x = ship.orbit_radius * Math.cos(theta);
        const y = ship.orbit_radius * Math.sin(theta);
        
        tempObject.position.set(x, y * Math.cos(ship.inclination), y * Math.sin(ship.inclination));
        
        // Simplified orientation: Look ahead but maintain a stable world "up"
        const lookAheadTime = 0.01;
        const nextTheta = ship.phase + ship.angular_speed * (elapsedTime + lookAheadTime);
        const nextX = ship.orbit_radius * Math.cos(nextTheta);
        const nextY = ship.orbit_radius * Math.sin(nextTheta);
        const lookAtPosition = new Vector3(
          nextX,
          nextY * Math.cos(ship.inclination),
          nextY * Math.sin(ship.inclination)
        );
        
        tempObject.up.set(0, 1, 0); // Explicitly set world up vector
        tempObject.lookAt(lookAtPosition);
        
        tempObject.scale.setScalar(SCALE);
        tempObject.updateMatrix();
        mesh.setMatrixAt(i, tempObject.matrix);

        // Write the final world position to the global map for the camera to use
        shipPositions.set(ship.id, tempObject.position.clone());
      });

      mesh.instanceMatrix.needsUpdate = true;
    });

    // Update label positions imperatively
    if (labelGroupRef.current) {
        ships.forEach((ship, i) => {
            const label = labelGroupRef.current?.children[i] as Group;
            if (label) {
                const theta = ship.phase + ship.angular_speed * elapsedTime;
                const x = ship.orbit_radius * Math.cos(theta);
                const y = ship.orbit_radius * Math.sin(theta);
                label.position.set(x, y * Math.cos(ship.inclination), y * Math.sin(ship.inclination));
            }
        });
    }
  });

  return (
    <>
      <group ref={meshGroupRef} />
      <group ref={labelGroupRef}>
        {ships.map(ship => (
          <group key={ship.id}>
            <ShipLabel ship={ship} />
          </group>
        ))}
      </group>
    </>
  );
} 