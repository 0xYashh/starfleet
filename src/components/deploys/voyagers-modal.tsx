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
        // Fetch recent ships with profiles in a single query using join
        const { data: shipsWithProfiles, error: shipsError } = await supabase
          .from('ships')
          .select(`
            id,
            user_id,
            website_url,
            name,
            tagline,
            description,
            spaceship_id,
            orbit_radius,
            inclination,
            phase,
            angular_speed,
            price,
            created_at,
            icon_url,
            screenshot_url,
            commander_name,
            roles,
            status,
            x_handle,
            instagram_handle,
            github_handle,
            youtube_url,
            profiles:user_id (
              x_handle,
              instagram_handle,
              display_name
            )
          `)
          // Only fetch the five most recent voyagers
          .limit(5);

        if (shipsError) {
          console.error('Supabase error:', shipsError);
          throw shipsError;
        }

        // Transform the data to match our types
        const transformedShips: ShipWithProfile[] = (shipsWithProfiles || []).map((ship: any) => {
          // Extract profile data
          const profile = ship.profiles || null;
          
          // Transform ship data to match Ship interface
          const transformedShip: Ship = {
            ...ship,
            orbit_tags: [], // Default empty array since it's not in database
            orbit_radius: ship.orbit_radius || 0,
            inclination: ship.inclination || 0,
            phase: ship.phase || 0,
            angular_speed: ship.angular_speed || 0,
            roles: ship.roles || [],
          };
          
          // Remove the profiles property from ship object
          delete (transformedShip as any).profiles;
          
          return {
            ...transformedShip,
            profiles: profile,
          };
        });

        setShips(transformedShips);
      } catch (error) {
        console.error('Error loading voyagers:', error);
        setShips([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      loadRecentDeploys();
    }
  }, [open]);

  // Clicking a voyager opens its profile modal directly
  const handleVoyagerClick = (ship: ShipWithProfile) => {
    setSelectedShip(ship);
    onOpenChange(false);
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
                const commanderName = ship.commander_name || 'Unknown Commander';

                // Prefer vehicle-specific logo; fallback to generic icon
                const logoSrc = vehicle?.previewPng || ship.icon_url;

                return (
                  <div
                    key={ship.id}
                    onClick={() => handleVoyagerClick(ship)}
                    className="p-3 bg-black/20 rounded-lg flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-md bg-black/20 flex-shrink-0 flex items-center justify-center">
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={vehicle?.label || ship.name}
                          width={80}
                          height={80}
                          className="rounded-md object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-4xl">{vehicle?.category === 'aircraft' ? '✈️' : '🚀'}</span>
                      )}
                    </div>
                    <p className="font-bold text-sm truncate max-w-[8rem]">{commanderName}</p>
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