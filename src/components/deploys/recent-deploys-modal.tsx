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

interface RecentDeploysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecentDeploysModal({ open, onOpenChange }: RecentDeploysModalProps) {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentDeploys() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ships')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);

        if (error) throw error;
        setShips(data || []);
      } catch (error) {
        console.error('Error loading recent deploys:', error);
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      loadRecentDeploys();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "backdrop-blur-lg bg-white/10 border-white/20 w-[88vw] sm:w-full text-white sm:max-w-xs",
          // Remove default centering styles
          "top-auto left-auto right-auto bottom-auto translate-x-0 translate-y-0",
          // Mobile: top-centered popover
          "fixed top-24 left-1/2 -translate-x-1/2",
          // Desktop: positioned under the trigger button
          "sm:absolute sm:left-4 sm:top-16 sm:-translate-x-0"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Recent Deploys</DialogTitle>
          <DialogDescription>
            The latest ships to join the fleet.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-4 custom-scrollbar">
          {loading ? (
            <p>Loading recent activity...</p>
          ) : ships.length === 0 ? (
            <p>No ships have been deployed yet.</p>
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