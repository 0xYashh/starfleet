"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get('payment_id');

  useEffect(() => {
    (async () => {
      if (!paymentId) {
        router.replace('/');
        return;
      }

      try {
        console.log('🚀 Payment success page - paymentId:', paymentId);
        
        // Use the finalize API instead of localStorage flow
        const finalizeRes = await fetch('/api/payments/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId }),
        });

        console.log('💫 Finalize response status:', finalizeRes.status);
        
        const result = await finalizeRes.json();
        console.log('🎯 Finalize result:', result);
        
        if (finalizeRes.ok && result.ok) {
          // Store commander name for welcome message
          sessionStorage.setItem('welcomeCommander', result.commander || 'Commander');
          // Flag to skip loading screen
          sessionStorage.setItem('skipLoadingScreen', 'true');
          console.log('✅ Ship deployed successfully, redirecting with welcome');
          router.replace('/?welcome=1');
        } else {
          console.error('❌ Finalize failed:', result);
          console.error('Status:', finalizeRes.status, 'Response:', result);
          router.replace('/?error=deploy-failed');
        }
      } catch (e) {
        console.error('💥 Auto deploy failed with exception:', e);
        router.replace('/?error=deploy-failed');
      }
    })();
  }, [paymentId, router]);

  // Don't show any loading screen - just process in background
  return null;
}
