'use client';

import { useShipsStore } from '@/lib/three/useShipsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CartoonButton } from '@/components/ui/cartoon-button';
import Image from 'next/image';
import { ExternalLink, Share2 } from 'lucide-react';
import { getVehicleById } from '@/lib/data/spaceships';

export function ProfileModal() {
  const { selectedShip, setSelectedShip } = useShipsStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedShip(null);
    }
  };

  if (!selectedShip) {
    return null;
  }

  const vehicle = getVehicleById(selectedShip.spaceship_id);
  const tags = selectedShip.orbit_tags || [];
  const xHandle = selectedShip.x_handle ?? null;
  const instagramHandle = selectedShip.instagram_handle ?? null;
  const githubHandle = selectedShip.github_handle ?? null;
  const youtubeUrl = selectedShip.youtube_url ?? null;
  const commanderName = selectedShip.commander_name ?? null;
  const roles = selectedShip.roles ?? [];
  const status = selectedShip.status ?? 'Launched';
  // Basic heuristics for socials if the URL looks like a profile

  return (
    <Dialog open={!!selectedShip} onOpenChange={handleOpenChange}>
      <DialogContent className="backdrop-blur-lg bg-white/10 border-white/20 w-[92vw] sm:w-full sm:max-w-lg text-white flex flex-col h-auto max-h-[80vh]">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            {selectedShip.icon_url && (
              <Image
                src={selectedShip.icon_url}
                alt={`${selectedShip.name} icon`}
                width={64}
                height={64}
                className="rounded-lg border-2 border-white/20"
              />
            )}
            <div>
              <DialogTitle className="text-3xl [font-family:var(--font-barriecito)]">
                {selectedShip.name}
              </DialogTitle>
              <DialogDescription className="text-white/80">
                {selectedShip.tagline}
              </DialogDescription>
              {vehicle && (
                <p className="text-xs text-white/60 mt-1">{vehicle.label}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 space-y-4 py-4">
          {/* Quick meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-md p-3">
              <p className="text-xs text-white/60">Status</p>
              <p className="font-semibold">{status}</p>
            </div>
            {tags.length > 0 && (
              <div className="bg-white/5 rounded-md p-3">
                <p className="text-xs text-white/60">Orbit Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white/10 text-xs">#{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(commanderName || roles.length > 0) && (
            <div className="bg-white/5 rounded-md p-3">
              <p className="text-xs text-white/60">Commander</p>
              {commanderName && <p className="font-semibold">{commanderName}</p>}
              {roles.length > 0 && (
                <p className="text-sm text-white/80 mt-1">Roles: {roles.join(', ')}</p>
              )}
            </div>
          )}

          <a
            href={selectedShip.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <CartoonButton variant="secondary" size="md" className="w-full">
              <ExternalLink size={16} className="mr-2" />
              Visit {selectedShip.website_url.replace(/^https?:\/\//, '')}
            </CartoonButton>
          </a>

          {selectedShip.description && (
            <div>
              <h3 className="font-bold text-lg mb-2">About {selectedShip.name}</h3>
              <p className="text-white/90 whitespace-pre-wrap">
                {selectedShip.description}
              </p>
            </div>
          )}

          {selectedShip.screenshot_url && (
            <div>
              <h3 className="font-bold text-lg mb-2">Screenshot</h3>
              <Image
                src={selectedShip.screenshot_url}
                alt={`${selectedShip.name} screenshot`}
                width={1280}
                height={720}
                className="rounded-lg border-2 border-white/20 w-full h-auto"
              />
            </div>
          )}

          {(xHandle || instagramHandle || githubHandle || youtubeUrl) && (
            <div>
              <h3 className="font-bold text-lg mb-2">Socials</h3>
              <div className="flex flex-wrap gap-2">
                {xHandle && (
                  <a href={`https://x.com/${xHandle}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/15 flex items-center gap-2">
                    <Image src="/icon/X_icon.svg" alt="X" width={16} height={16} />
                    @{xHandle}
                  </a>
                )}
                {instagramHandle && (
                  <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/15 flex items-center gap-2">
                    <Image src="/icon/instagram.png" alt="Instagram" width={16} height={16} />
                    @{instagramHandle}
                  </a>
                )}
                {githubHandle && (
                  <a href={`https://github.com/${githubHandle}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/15 flex items-center gap-2">
                    <Image src="/icon/github.png" alt="GitHub" width={16} height={16} />
                    @{githubHandle}
                  </a>
                )}
                {youtubeUrl && (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/15 flex items-center gap-2">
                    <Image src="/icon/youtube.png" alt="YouTube" width={16} height={16} />
                    YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-shrink-0">
          <CartoonButton variant="primary" size="md">
            <Share2 size={16} className="mr-2" />
            Share
          </CartoonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 