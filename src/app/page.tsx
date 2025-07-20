// New simplified landing page without auth / modals for now
'use client';

import { CartoonButton } from '@/components/ui/cartoon-button';
import { SpaceScene } from '@/components/scene/SpaceScene';
import { useState } from 'react';
import { LaunchWizard } from '@/components/wizard/launch-wizard';
import { useAuth } from '@/components/auth/auth-provider';
import { SignInModal } from '@/components/auth/sign-in-modal';
import Image from 'next/image';
import { HangarModal } from '@/components/hangar/hangar-modal';
import { RecentDeploysModal } from '@/components/deploys/recent-deploys-modal';

export default function Home() {
  const { user, signOut } = useAuth(); // Correctly destructure signOut here
  const [showWizard, setShowWizard] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showHangar, setShowHangar] = useState(false);
  const [showRecentDeploys, setShowRecentDeploys] = useState(false);

  return (
    <div className="relative min-h-screen text-white">
      <SpaceScene />
      
      {/* Top UI */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-start p-4 pointer-events-none">
        {/* Left Side: Branding, Deploys, and Hangar */}
        <div className="flex flex-col items-start gap-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Image src="/icon/starfleet.svg" alt="Starfleet Logo" width={40} height={40} />
            <h1 className="text-3xl [font-family:var(--font-barriecito)] pt-1">Starfleet</h1>
          </div>
          <CartoonButton
            variant="secondary"
            size="sm"
            onClick={() => setShowRecentDeploys(true)}
          >
            Recent Deploys
          </CartoonButton>
          {user && (
            <CartoonButton
              variant="secondary"
              size="sm"
              onClick={() => setShowHangar(true)}
            >
              Hangar
            </CartoonButton>
          )}
        </div>
        
        {/* Right Side: Auth */}
        <div className="pointer-events-auto">
          {user ? (
            // Pass the signOut function directly to onClick
            <CartoonButton variant="danger" size="sm" onClick={signOut}>
              Sign Out
            </CartoonButton>
          ) : (
            <CartoonButton
              variant="primary"
              size="sm"
              onClick={() => setShowSignIn(true)}
            >
              Sign In
            </CartoonButton>
          )}
        </div>
      </nav>

      {/* Bottom UI - Simplified for a single centered button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <CartoonButton
          variant="primary"
          size="lg"
          onClick={() => (user ? setShowWizard(true) : setShowSignIn(true))}
        >
          🚀 Deploy Spaceship
        </CartoonButton>
      </div>

      {/* Modals */}
      <LaunchWizard open={showWizard} onOpenChange={setShowWizard} />
      <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
      <HangarModal open={showHangar} onOpenChange={setShowHangar} />
      <RecentDeploysModal open={showRecentDeploys} onOpenChange={setShowRecentDeploys} />
    </div>
  );
}
