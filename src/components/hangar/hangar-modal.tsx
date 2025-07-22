'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
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
import Image from 'next/image';

interface HangarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShip: (ship: Ship) => void; // Callback to open the wizard
}

export function HangarModal({ open, onOpenChange, onSelectShip }: HangarModalProps) {
  const { user } = useAuth();
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShips() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ships')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        // Deduplicate ships by spaceship_id to show only one of each type
        const uniqueShips = data.filter((ship, index, self) =>
          index === self.findIndex((s) => s.spaceship_id === ship.spaceship_id)
        );
        setShips(uniqueShips || []);
      } catch (error) {
        console.error('Error loading hangar ships:', error);
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      loadShips();
    }
  }, [user, open]);
  
  const handleShipClick = (ship: Ship) => {
    onSelectShip(ship);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-lg bg-white/10 border-white/20 w-[88vw] sm:w-full sm:max-w-md text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Your Hangar</DialogTitle>
          <DialogDescription>
            Select a ship to deploy a new instance.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-4 custom-scrollbar">
          {loading ? (
            <p>Loading Hangar...</p>
          ) : ships.length === 0 ? (
            <p>{`You haven't deployed any ships yet.`}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {ships.map((ship) => {
                const vehicle = getVehicleById(ship.spaceship_id);
                return (
                  <div key={ship.id} onClick={() => handleShipClick(ship)} className="p-3 bg-black/20 rounded-lg flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-24 h-24 rounded-md bg-black/20 flex-shrink-0">
                      {vehicle?.previewPng ? (
                        <Image src={vehicle.previewPng} alt={vehicle.label} width={96} height={96} className="rounded-md object-contain" />
                      ) : (
                        <span className="text-4xl w-full h-full flex items-center justify-center">{vehicle?.category === 'aircraft' ? '✈️' : '🚀'}</span>
                      )}
                    </div>
                    <p className="font-bold text-sm">{vehicle?.label}</p>
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