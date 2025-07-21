"use client";

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, DynamicDrawUsage, Group } from 'three';
import { preloadVehicles } from '@/lib/three/load-vehicle';
import { getFreeVehicles, getPaidVehicles } from '@/lib/data/spaceships';
import { getOrbitPosition } from '@/lib/three/orbit-utils';
import { useShipsStore } from '@/lib/three/useShipsStore';
import { supabase } from '@/lib/supabase/client';
import type { Ship } from '@/lib/types/ship';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

type InstancedEntry = { mesh: InstancedMesh; shipIds: string[] };

const SCALE = 0.06;
const tempObject = new Object3D();
const allAssets = [...getFreeVehicles(), ...getPaidVehicles()];

export function ShipsInstancedMesh() {
  const groupRef = useRef<Group>(null);
  const vehicleMapRef = useRef<Map<string, InstancedEntry>>(new Map());
  const { ships, setShips, addShip } = useShipsStore();

  useEffect(() => {
    supabase.from('ships').select('*').then(({ data }) => {
      if (data) setShips(data as Ship[]);
    });

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

  useEffect(() => {
    preloadVehicles(allAssets).then((preloaded) => {
      preloaded.forEach(({ geometry, material }, id) => {
        const mesh = new InstancedMesh(geometry, material, 200);
        mesh.count = 0; // Start with zero instances, preventing the bug
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        vehicleMapRef.current.set(id, { mesh, shipIds: [] });
        groupRef.current?.add(mesh);
      });
    });
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const shipsByVehicle: Record<string, Ship[]> = {};

    for (const ship of ships) {
      if (!shipsByVehicle[ship.spaceship_id]) {
        shipsByVehicle[ship.spaceship_id] = [];
      }
      shipsByVehicle[ship.spaceship_id].push(ship);
    }

    vehicleMapRef.current.forEach((entry, vehicleId) => {
      const targetShips = shipsByVehicle[vehicleId] || [];
      entry.mesh.count = targetShips.length; // Set visibility based on data
      entry.shipIds = targetShips.map(s => s.id);

      targetShips.forEach((ship, i) => {
        const radius = ship.orbit_radius ?? (ship.price === 0 ? 4.5 : 7);
        const inclination = ship.inclination ?? 0.25;
        const phase = ship.phase ?? 0;
        const speed = ship.angular_speed ?? 0.25 / radius;
        
        const [x, y, z] = getOrbitPosition(radius, inclination, phase, elapsed, speed);
        
        tempObject.position.set(x, y, z);
        tempObject.rotation.y = phase + elapsed * speed + Math.PI / 2;
        tempObject.scale.setScalar(SCALE);
        tempObject.updateMatrix();
        entry.mesh.setMatrixAt(i, tempObject.matrix);
      });
      entry.mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return <group ref={groupRef} />;
} 