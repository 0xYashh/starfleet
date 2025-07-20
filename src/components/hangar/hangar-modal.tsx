'use client';

import { useState, useEffect } from 'react';
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
import { Ship } from '@/lib/types/ship'; // Assuming a Ship type definition exists

interface HangarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HangarModal({ open, onOpenChange }: HangarModalProps) {
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
        setShips(data || []);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-lg bg-white/10 border-white/20 w-[88vw] sm:w-full sm:max-w-md text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Your Owned Spaceships!</DialogTitle>
          <DialogDescription>
            A collection of all the ships you've deployed.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-4">
          {loading ? (
            <p>Loading Hangar...</p>
          ) : ships.length === 0 ? (
            <p>You haven't deployed any ships yet. Launch one to see it here!</p>
          ) : (
            ships.map((ship) => {
              const vehicle = getVehicleById(ship.spaceship_id);
              return (
                <div key={ship.id} className="p-3 bg-black/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{vehicle?.category === 'aircraft' ? '✈️' : '🚀'}</span>
                    <div>
                      <p className="font-bold">{ship.name}</p>
                      <p className="text-sm text-white/70">{vehicle?.label}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">{new Date(ship.created_at).toLocaleDateString()}</p>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 