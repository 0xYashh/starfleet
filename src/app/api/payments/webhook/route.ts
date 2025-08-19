import { Webhook } from 'standardwebhooks';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVehicleById } from '@/lib/data/spaceships';

export function GET() {
  // Simple health-check for Dodo dashboard – no auth, no body parsing
  return NextResponse.json({ ok: true });
}

export function HEAD() {
  // Same for HEAD requests (dashboard does a HEAD ping)
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        if (!process.env.DODO_WEBHOOK_SECRET) {
            console.log('No webhook secret configured, skipping verification');
            return NextResponse.json({ ok: true });
        }

        const headersList = request.headers;
        const rawBody = await request.text();
        const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET);

        const webhookHeaders = {
            'webhook-id': headersList.get('webhook-id') || '',
            'webhook-signature': headersList.get('webhook-signature') || '',
            'webhook-timestamp': headersList.get('webhook-timestamp') || '',
        };

        await webhook.verify(rawBody, webhookHeaders);
        const payload = JSON.parse(rawBody);

        // Process the payload according to your business logic
        console.log('Webhook payload:', payload);

        if (payload?.event === 'payment.succeeded' || payload?.status === 'succeeded') {
            try {
                const metadataStr = payload.metadata?.shipData;
                if (!metadataStr) {
                    console.log('No shipData metadata; skipping ship creation');
                    return NextResponse.json({ ok: true });
                }
                const shipData = JSON.parse(metadataStr);

                const user_id = payload.metadata?.user_id ?? null;
                if (!user_id) {
                    console.log('No user_id in metadata; skipping');
                    return NextResponse.json({ ok: true });
                }

                const supabase = await createClient();

                const vehicle = getVehicleById(shipData.spaceshipId);
                if (!vehicle) {
                    console.log('Unknown vehicle in shipData');
                    return NextResponse.json({ ok: true });
                }

                // insert ship row if not exists (simple uniqueness by payment_id)
                const { data: existing } = await supabase
                  .from('ships')
                  .select('id')
                  .eq('payment_id', payload.payment_id)
                  .maybeSingle();

                if (existing) {
                  console.log('Ship already created for payment');
                  return NextResponse.json({ ok: true });
                }

                // Ensure profile exists
                await supabase.from('profiles').upsert({ id: user_id, display_name: shipData.commanderName || 'Pilot' });

                // using same orbit calc as deploy API (simplified)
                const orbit_radius = 4 + Math.random() * 2;
                const inclination = (Math.random() - 0.5) * Math.PI;
                const phase = Math.random() * Math.PI * 2;
                const ascending_node = Math.random() * Math.PI * 2;
                const eccentricity = 0.1 + Math.random() * 0.2;
                const angular_speed = Math.abs(0.3 / orbit_radius);

                await supabase.from('ships').insert({
                  user_id,
                  payment_id: payload.payment_id,
                  website_url: shipData.websiteUrl ?? null,
                  name: shipData.shipName,
                  tagline: shipData.tagline,
                  description: shipData.description,
                  orbit_tags: shipData.orbitTags,
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

                console.log('Ship deployed via webhook');
            } catch (err) {
                console.error('Error creating ship from webhook', err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
}
