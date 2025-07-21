import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getVehicleById } from '@/lib/data/spaceships';

const BodySchema = z.object({
  shipName: z.string().min(2).max(100),
  spaceshipId: z.string(),
  websiteUrl: z.string().url(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  orbitTags: z.array(z.string()).max(3).optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid-payload' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { shipName, spaceshipId, websiteUrl, tagline, description, orbitTags = [] } = parsed.data;
  const vehicle = getVehicleById(spaceshipId);
  if (!vehicle) return NextResponse.json({ error: 'unknown-vehicle' }, { status: 400 });
  if (vehicle.price !== 0) return NextResponse.json({ error: 'paid-vehicle' }, { status: 400 });

  // Ensure a profile exists for the user before proceeding
  const { error: profileErr } = await supabase.from('profiles').upsert({ id: user.id });
  if (profileErr) {
    console.error('Profile upsert error:', profileErr);
    return NextResponse.json({ error: 'profile-setup-failed' }, { status: 500 });
  }

  // orbital params
  const orbit_radius = 4 + Math.random(); // 4-5
  const inclination = (Math.random() - 0.5) * 0.5;
  const phase = Math.random() * Math.PI * 2;
  const angular_speed = 0.25 / orbit_radius;

  const { error: purchErr } = await supabase.from('purchases').insert({
    user_id: user.id,
    spaceship_id: spaceshipId,
  });
  if (purchErr) return NextResponse.json({ error: 'purchase-insert' }, { status: 500 });

  const { data, error } = await supabase.from('ships').insert({
    user_id: user.id,
    website_url: websiteUrl,
    name: shipName,
    tagline,
    description,
    orbit_tags: orbitTags,
    spaceship_id: spaceshipId,
    orbit_radius,
    inclination,
    phase,
    angular_speed,
    price: 0,
  }).select().single();

  if (error) return NextResponse.json({ error: 'ship-insert' }, { status: 500 });
  return NextResponse.json({ success: true, ship: data });
} 