'use client';

import { CartoonButton } from '@/components/ui/cartoon-button';
import { SpaceScene } from '@/components/scene/SpaceScene';
import { useState, Suspense } from 'react';
import { LaunchWizard } from '@/components/wizard/launch-wizard';
import { useAuth } from '@/components/auth/auth-provider';
import { useCallback, useEffect } from 'react';
import { SignInModal } from '@/components/auth/sign-in-modal';
import Image from 'next/image';
import { HangarModal } from '@/components/hangar/hangar-modal';
import { VoyagersModal } from '@/components/deploys/voyagers-modal';
import { useSearchParams } from 'next/navigation';
import { ProfileModal } from '@/components/ship/profile-modal';
import type { Ship } from '@/lib/types/ship';

function HomeContent() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showHangar, setShowHangar] = useState(false);
  const [showVoyagers, setShowVoyagers] = useState(false);
  const [initialWizardData, setInitialWizardData] = useState<Ship | null>(null);

  // Simple auth success handling
  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    
    if (authSuccess) {
      console.log('Authentication successful!');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // Reset sign-out loading state when user changes
  useEffect(() => {
    setIsSigningOut(false);
  }, [user]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    await signOut();
  }, [signOut]);

  const handleHangarSelect = (ship: Ship) => {
    setInitialWizardData(ship);
    setShowWizard(true);
  };

  return (
    <div className="relative min-h-screen text-white">
      <SpaceScene />
      
      {/* Top UI */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex flex-col md:flex-row md:justify-between md:items-start p-4 pointer-events-none">
        {/* Left Side: Branding, Deploys, and Hangar */}
        <div className="flex flex-col items-start gap-4 pointer-events-auto w-full md:w-auto">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Image src="/icon/starfleet.svg" alt="Starfleet Logo" width={40} height={40} />
              <h1 className="text-3xl [font-family:var(--font-barriecito)] pt-1">Starfleet</h1>
            </div>
            <div className="md:hidden">
              {user ? (
                <CartoonButton
                  variant="danger"
                  size="sm"
                  onClick={handleSignOut}
                  isLoading={isSigningOut}
                  loadingText="Signing Out..."
                >
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
          </div>
          <div className="flex items-center gap-2">
            <CartoonButton
              variant="secondary"
              size="sm"
              onClick={() => setShowVoyagers(true)}
            >
              Voyagers
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
        </div>
        
        {/* Right Side: Auth (Desktop only) */}
        <div className="pointer-events-auto hidden md:block">
          {user ? (
            <div className="flex flex-col items-end gap-2">
              <CartoonButton
                variant="danger"
                size="sm"
                onClick={handleSignOut}
                isLoading={isSigningOut}
                loadingText="Signing Out..."
              >
                Sign Out
              </CartoonButton>
            </div>
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
      <LaunchWizard 
        open={showWizard} 
        onOpenChange={setShowWizard} 
        initialData={initialWizardData}
      />
      <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
      <HangarModal 
        open={showHangar} 
        onOpenChange={setShowHangar}
        onSelectShip={handleHangarSelect}
      />
      <VoyagersModal open={showVoyagers} onOpenChange={setShowVoyagers} />
      <ProfileModal />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}