'use client';

import { Html } from '@react-three/drei';
import { Ship } from '@/lib/types/ship';
import { getVehicleById } from '@/lib/data/spaceships';
import { useShipsStore } from '@/lib/three/useShipsStore';
import Image from 'next/image';

interface ShipLabelProps {
  ship: Ship;
}

export function ShipLabel({ ship }: ShipLabelProps) {
  const vehicle = getVehicleById(ship.spaceship_id);
  const setSelectedShip = useShipsStore((state) => state.setSelectedShip);

  if (!vehicle) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the click from passing through to the canvas
    setSelectedShip(ship);
  };

  return (
    <Html
      as="div"
      position={[0, 1.2, 0]} // Moved closer to the ship
      center
      distanceFactor={8}
      occlude
      className="select-none pointer-events-none" // Allow clicks to pass through to the ship
    >
      <div
        onClick={handleClick}
        className="bg-black/30 backdrop-blur-xl rounded-lg px-3 py-2 text-white text-xs whitespace-nowrap shadow-xl pointer-events-auto cursor-pointer transition-transform hover:scale-105 flex items-center gap-2"
      >
        {ship.icon_url && (
          <Image
            src={ship.icon_url}
            alt={`${ship.name} icon`}
            width={24}
            height={24}
            className="rounded-md"
          />
        )}
        <div>
          <p className="font-bold tracking-wide">{ship.name}</p>
          {ship.tagline && <p className="text-white/70">{ship.tagline}</p>}
        </div>
      </div>
    </Html>
  );
} 