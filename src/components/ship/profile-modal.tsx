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
            </div>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 space-y-4 py-4">
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