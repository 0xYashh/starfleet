'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getVehicleById } from '@/lib/data/spaceships';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Ship } from '@/lib/types/ship';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useShipsStore } from '@/lib/three/useShipsStore';

interface Profile {
  x_handle: string | null;
  instagram_handle: string | null;
  display_name: string | null;
}

interface ShipWithProfile extends Ship {
  profiles: Profile | null;
}

interface VoyagersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoyagersModal({ open, onOpenChange }: VoyagersModalProps) {
  const [ships, setShips] = useState<ShipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const setSelectedShip = useShipsStore((state) => state.setSelectedShip);

  useEffect(() => {
    async function loadRecentDeploys() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ships')
          .select('*, profiles(x_handle, instagram_handle, display_name)')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setShips((data as ShipWithProfile[]) || []);
      } catch (error) {
        console.error('Error loading voyagers:', error);
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      loadRecentDeploys();
    }
  }, [open]);

  const handleVoyagerClick = (ship: ShipWithProfile) => {
    const profile = ship.profiles;
    if (profile?.x_handle) {
      window.open(`https://x.com/${profile.x_handle}`, '_blank');
    } else if (profile?.instagram_handle) {
      window.open(`https://instagram.com/${profile.instagram_handle}`, '_blank');
    } else {
      setSelectedShip(ship);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "backdrop-blur-lg bg-white/10 border-white/20 w-[88vw] sm:w-full text-white sm:max-w-md",
          "top-auto left-auto right-auto bottom-auto translate-x-0 translate-y-0",
          "fixed top-24 left-1/2 -translate-x-1/2 sm:absolute sm:left-4 sm:top-16 sm:-translate-x-0"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Recent Voyagers</DialogTitle>
          <DialogDescription>
            The latest pilots to join the fleet.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-4 custom-scrollbar">
          {loading ? (
            <p>Loading recent voyagers...</p>
          ) : ships.length === 0 ? (
            <p>No voyagers have been deployed yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {ships.map((ship) => {
                const vehicle = getVehicleById(ship.spaceship_id);
                const profile = ship.profiles;
                let handle = profile?.display_name || 'Anonymous';
                if (profile?.x_handle) handle = `@${profile.x_handle}`;
                else if (profile?.instagram_handle) handle = `@${profile.instagram_handle}`;

                return (
                  <div key={ship.id} onClick={() => handleVoyagerClick(ship)} className="p-3 bg-black/20 rounded-lg flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-md bg-black/20 flex-shrink-0">
                      {ship.icon_url ? (
                        <Image src={ship.icon_url} alt={ship.name} width={64} height={64} className="rounded-md object-cover" />
                      ) : (
                        <span className="text-3xl w-full h-full flex items-center justify-center">{vehicle?.category === 'aircraft' ? '✈️' : '🚀'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ship.name}</p>
                      <p className="text-xs text-white/70">{handle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}