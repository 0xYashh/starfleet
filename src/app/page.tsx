// New simplified landing page without auth / modals for now
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
import { RecentDeploysModal } from '@/components/deploys/recent-deploys-modal';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showHangar, setShowHangar] = useState(false);
  const [showRecentDeploys, setShowRecentDeploys] = useState(false);
  const [mobileAuthMessage, setMobileAuthMessage] = useState<string | null>(null);

  // Check for auth errors and mobile auth scenarios from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    const authSuccess = searchParams.get('auth_success');
    const mobileAuth = searchParams.get('mobile_auth');
    const isMobile = searchParams.get('mobile');
    
    if (authSuccess) {
      console.log('Authentication successful!');
      if (isMobile) {
        setMobileAuthMessage('✅ Successfully signed in! You can now close this tab and return to your main browser.');
        setTimeout(() => setMobileAuthMessage(null), 5000);
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (mobileAuth) {
      switch (mobileAuth) {
        case 'retry':
          setMobileAuthMessage('📱 Please open the magic link in your main browser (Chrome/Safari) instead of the email app.');
          break;
        case 'open_browser':
          setMobileAuthMessage('📱 For best results, copy the magic link and paste it in your main browser.');
          break;
      }
      setTimeout(() => setMobileAuthMessage(null), 8000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (error) {
      console.error('Authentication error:', error);
      
      // More specific error logging for debugging
      switch (error) {
        case 'auth_failed':
          console.error('AUTH ERROR: General authentication failure');
          setMobileAuthMessage('❌ Authentication failed. Please try again.');
          break;
        case 'pkce_failed':
          console.error('AUTH ERROR: PKCE code verifier issue - check Supabase configuration');
          setMobileAuthMessage('📱 Please open the magic link in your main browser (not email app).');
          break;
        case 'no_user':
          console.error('AUTH ERROR: No user data returned from Supabase');
          setMobileAuthMessage('❌ Sign-in incomplete. Please try again.');
          break;
        case 'no_code':
          console.error('AUTH ERROR: No auth code provided in callback');
          setMobileAuthMessage('📱 Please click the magic link directly from your email.');
          break;
        default:
          console.error('AUTH ERROR: Unknown error:', error);
          setMobileAuthMessage('❌ Something went wrong. Please try again.');
      }
      
      setTimeout(() => setMobileAuthMessage(null), 8000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    await signOut();
    // No need to set isSigningOut back to false, as redirect will happen
  }, [signOut]);

  return (
    <div className="relative min-h-screen text-white">
      <SpaceScene />
      
      {/* Mobile Auth Message */}
      {mobileAuthMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center text-sm">
          {mobileAuthMessage}
        </div>
      )}
      
      {/* Top UI */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-start p-4 pointer-events-none">
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
      <LaunchWizard open={showWizard} onOpenChange={setShowWizard} />
      <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
      <HangarModal open={showHangar} onOpenChange={setShowHangar} />
      <RecentDeploysModal open={showRecentDeploys} onOpenChange={setShowRecentDeploys} />
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