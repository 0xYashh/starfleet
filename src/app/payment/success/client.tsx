"use client";
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentSuccessInner() {
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
        // Call finalize API
        const finalizeRes = await fetch('/api/payments/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId }),
        });
        const result = await finalizeRes.json();
        if (finalizeRes.ok && result.ok) {
          sessionStorage.setItem('welcomeCommander', result.commander || 'Commander');
          sessionStorage.setItem('skipLoadingScreen', 'true');
          router.replace('/?welcome=1');
        } else {
          router.replace('/?error=deploy-failed');
        }
      } catch {
        router.replace('/?error=deploy-failed');
      }
    })();
  }, [paymentId, router]);

  return null;
}

export default function PaymentSuccessClient() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
