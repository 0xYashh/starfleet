import { NextRequest, NextResponse } from 'next/server';
import { dodoPayments } from '@/lib/dodopayments/client';
import { createClient } from '@/lib/supabase/server';

// NOTE: keep this in sync with finalize route & Dodo dashboard product
const PAID_SPACESHIP_PRODUCT_ID = 'pdt_WcZzPJ6jac11MUWE7qpjT';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      shipData = {},
      // vehicleType is kept for future-proofing (e.g. satellites) but not used right now
    } = body ?? {};

    // ────────────────────────────────────────────────────────────
    // Auth guard – only signed-in users can purchase
    // ────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }

    if (!customer?.email) {
      return NextResponse.json({ error: 'customer-email-required' }, { status: 400 });
    }

    // ────────────────────────────────────────────────────────────
    // Build the payment request
    // ────────────────────────────────────────────────────────────
    const payment = await dodoPayments.payments.create({
      customer: {
        email: customer.email,
        name: customer.name ?? 'Pilot',
      },
      product_cart: [
        {
          product_id: PAID_SPACESHIP_PRODUCT_ID,
          quantity: 1,
        },
      ],
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      // Minimal placeholder billing – required by Dodo
      billing: {
        // @ts-expect-error  address field accepted by API though not in types
        address: {
          line1: '-',
        },
      },
      metadata: {
        shipData: JSON.stringify(shipData),
        user_id: user.id,
      },
    }) as unknown as { payment_link: string };

    return NextResponse.json({ payment_link: payment.payment_link });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('create-link failed', err);
    return NextResponse.json({ error: 'internal-error', message }, { status: 500 });
  }
}
