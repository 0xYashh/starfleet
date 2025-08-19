import { dodoPayments } from '@/lib/dodopayments/client';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVehicleById } from '@/lib/data/spaceships';

const PAID_SPACESHIP_PRODUCT_ID = 'pdt_WcZzPJ6jac11MUWE7qpjT'; // Must match create-link

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Finalize API called');
    const { payment_id } = await req.json();
    console.log('📋 Payment ID received:', payment_id);
    
    if (!payment_id) return NextResponse.json({ error: 'payment_id required' }, { status: 400 });

    // Verify user is authenticated
    console.log('🔐 Checking authentication...');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    console.log('✅ User authenticated:', user.id);

    console.log('💳 Retrieving payment from Dodo...');
    const payment = await dodoPayments.payments.retrieve(payment_id);
    console.log('💰 Payment status:', payment.status);
    console.log('💰 Payment amount:', payment.total_amount);
    console.log('💰 Payment metadata:', payment.metadata);
    
    if (payment.status !== 'succeeded') {
      console.log('❌ Payment not succeeded, status:', payment.status);
      return NextResponse.json({ error: 'not-succeeded' }, { status: 400 });
    }

    // Production security checks
    console.log('🔍 Checking payment amount...');
    if (payment.total_amount !== 200) { // $2.00 in cents
      console.log('❌ Wrong amount. Expected: 200, Got:', payment.total_amount);
      return NextResponse.json({ error: 'wrong-amount' }, { status: 400 });
    }
    
    console.log('🔍 Checking product cart...');
    if (payment.product_cart?.length !== 1 || payment.product_cart[0].product_id !== PAID_SPACESHIP_PRODUCT_ID) {
      console.log('❌ Wrong product. Cart:', payment.product_cart);
      return NextResponse.json({ error: 'wrong-product' }, { status: 400 });
    }

    console.log('🔍 Parsing metadata...');
    const metadata = payment.metadata as { shipData?: string; user_id?: string };
    const shipDataStr = metadata?.shipData;
    const user_id = metadata?.user_id;
    if (!shipDataStr || !user_id) {
      console.log('❌ Missing metadata. shipData:', !!shipDataStr, 'user_id:', !!user_id);
      return NextResponse.json({ error: 'metadata-missing' }, { status: 400 });
    }
    const shipData = JSON.parse(shipDataStr);
    console.log('✅ Ship data parsed:', { shipName: shipData.shipName, spaceshipId: shipData.spaceshipId });

    // prevent duplicate
    console.log('🔍 Checking for existing ship...');
    const { data: existing } = await supabase.from('ships').select('id').eq('payment_id', payment_id).maybeSingle();
    if (existing) {
      console.log('✅ Ship already exists for this payment');
      return NextResponse.json({ ok: true, commander: shipData.commanderName });
    }

    console.log('🔍 Getting vehicle info...');
    const vehicle = getVehicleById(shipData.spaceshipId);
    if (!vehicle) {
      console.log('❌ Unknown vehicle:', shipData.spaceshipId);
      return NextResponse.json({ error: 'unknown-vehicle' }, { status: 400 });
    }
    console.log('✅ Vehicle found:', vehicle.label);

    console.log('🌌 Generating orbit parameters...');
    const orbit_radius = 4 + Math.random() * 2;
    const inclination = (Math.random() - 0.5) * Math.PI;
    const phase = Math.random() * Math.PI * 2;
    const ascending_node = Math.random() * Math.PI * 2;
    const eccentricity = 0.1 + Math.random() * 0.2;
    const angular_speed = Math.abs(0.3 / orbit_radius);

    console.log('🚀 Inserting ship into database...');
    const insertResult = await supabase.from('ships').insert({
      user_id: user.id, // Use authenticated user ID, not metadata
      payment_id,
      website_url: shipData.websiteUrl || 'https://starfleet.space', // Default if empty
      name: shipData.shipName,
      tagline: shipData.tagline,
      description: shipData.description,
      orbit_tags: shipData.orbitTags || [],
      spaceship_id: shipData.spaceshipId,
      orbit_radius,
      inclination,
      phase,
      ascending_node,
      eccentricity,
      angular_speed,
      price: vehicle.price,
      icon_url: shipData.iconUrl,
      screenshot_url: shipData.screenshotUrl,
      commander_name: shipData.commanderName ?? null,
      roles: shipData.roles ?? [],
      status: shipData.status ?? 'Launched',
      x_handle: shipData.xHandle ?? null,
      instagram_handle: shipData.instagramHandle ?? null,
      github_handle: shipData.githubHandle ?? null,
      youtube_url: shipData.youtubeUrl ?? null,
    });

    if (insertResult.error) {
      console.log('❌ Database insert failed:', insertResult.error);
      return NextResponse.json({ error: 'database-insert-failed', details: insertResult.error }, { status: 500 });
    }

    console.log('🎉 Ship successfully deployed!');
    return NextResponse.json({ ok: true, commander: shipData.commanderName });
  } catch (err) {
    console.error('💥 Finalize error:', err);
    return NextResponse.json({ error: 'internal', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
