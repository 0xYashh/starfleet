'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  // Static content – no data fetching required
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "backdrop-blur-lg bg-white/10 border-white/20 w-[88vw] sm:w-full text-white sm:max-w-md",
          "top-auto left-auto right-auto bottom-auto translate-x-0 translate-y-0",
          "fixed top-24 left-1/2 -translate-x-1/2 sm:absolute sm:left-4 sm:top-16 sm:-translate-x-0"
        )}
        style={{ fontFamily: 'var(--font-poppins)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">About Starfleet</DialogTitle>
          <DialogDescription>
            Meet the crew behind the fleet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Project overview */}
          <div className="p-4 rounded-lg bg-black/20 border border-white/20 space-y-3">
            <p className="text-sm leading-relaxed">
              Starfleet is a fun 3-D playground to launch your product and showcase what you are working on as spaceships orbiting a planet.
            </p>
          </div>
          {/* Pricing policy */}
          <div className="p-4 rounded-lg bg-black/20 border border-white/20 space-y-2">
            <h3 className="font-bold text-lg">Pricing</h3>
            <p className="text-sm leading-relaxed">
              Basic aircraft are <span className="text-green-400 font-semibold">free forever</span>. Premium spaceships come with a one-time launch fee of
              <span className="text-yellow-300 font-semibold"> $2</span>.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-black/20 border border-white/20 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center text-3xl">
              🚀
            </div>
            <div>
              <p className="text-lg font-semibold">🧑‍🚀Commander at Starfleet</p>
              <p className="text-xl [font-family:var(--font-barriecito)]">Yash</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Socials</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://x.com/yashpxl"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/15 flex items-center gap-2"
              >
                <Image src="/icon/X_icon.svg" alt="X" width={16} height={16} />
                @yashpxl
              </a>
              <a
                href="https://instagram.com/yash.pxl"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/15 flex items-center gap-2"
              >
                <Image src="/icon/instagram.png" alt="Instagram" width={16} height={16} />
                @yash.pxl
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
