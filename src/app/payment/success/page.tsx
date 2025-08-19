import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const PaymentSuccessClient = dynamic(() => import('./client'), { ssr: false });

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
