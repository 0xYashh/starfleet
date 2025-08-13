import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getVehicleById } from '@/lib/data/spaceships';

const DeployShipSchema = z.object({
  shipName: z.string().min(2, "Ship name must be at least 2 characters").max(100),
  spaceshipId: z.string().min(1, "A vehicle must be selected"),
  websiteUrl: z.string().url("A valid website URL is required").optional(),
  tagline: z.string().max(60).optional(),
  description: z.string().max(500).optional(),
  orbitTags: z.array(z.string()).max(3, "You can have a maximum of 3 tags").optional(),
  iconUrl: z.string().url().optional(),
  screenshotUrl: z.string().url().optional(),
  // New wizard fields
  commanderName: z.string().max(120).optional(),
  roles: z.array(z.string()).max(8).optional(),
  status: z.enum(['Building','Launched']).optional(),
  xHandle: z.string().max(50).optional(),
  instagramHandle: z.string().max(50).optional(),
  githubHandle: z.string().max(50).optional(),
  youtubeUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }

    const json = await req.json();
    const parsed = DeployShipSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid-payload', details: parsed.error.format() }, { status: 400 });
    }

    const { shipName, spaceshipId, websiteUrl, tagline, description, orbitTags = [], iconUrl, screenshotUrl, commanderName, roles = [], status = 'Launched', xHandle, instagramHandle, githubHandle, youtubeUrl } = parsed.data;
    const vehicle = getVehicleById(spaceshipId);
    if (!vehicle) {
      return NextResponse.json({ error: 'unknown-vehicle' }, { status: 400 });
    }

    // FUTURE: When payment is integrated, this check will be important.
    // For now, we allow paid ships to be deployed for testing purposes.
    // if (vehicle.price > 0) {
    //   // TODO: Verify payment status from a secure source
    // }

    // Ensure a profile exists for the user before proceeding
    const { error: profileErr } = await supabase.from('profiles').upsert({ id: user.id, display_name: user.email?.split('@')[0] || 'Pilot' });
    if (profileErr) {
      console.error('Profile upsert error:', profileErr);
      return NextResponse.json({ error: 'profile-setup-failed' }, { status: 500 });
    }

    // Determine orbit parameters based on vehicle type - TRUE 3D ORBITAL MECHANICS
    
    // True 3D orbital parameters for satellite-like behavior
    const orbit_radius = 4 + Math.random() * 2; // 4-6 for safe distance from planet (was 2-3.5)
    const inclination = (Math.random() - 0.5) * Math.PI; // Full 3D inclination range
    const phase = Math.random() * Math.PI * 2; // Random starting position
    const ascending_node = Math.random() * Math.PI * 2; // Random orbital plane orientation
    const eccentricity = 0.1 + Math.random() * 0.2; // Slight eccentricity for realism
    const angular_speed = Math.abs(0.3 / orbit_radius); // Orbital speed

    const { data, error } = await supabase.from('ships').insert({
      user_id: user.id,
      website_url: websiteUrl ?? null,
      name: shipName,
      tagline,
      description,
      orbit_tags: orbitTags,
      spaceship_id: spaceshipId,
      orbit_radius,
      inclination,
      phase,
      ascending_node,
      eccentricity,
      angular_speed,
      price: vehicle.price, // Use the actual price from vehicle data
      icon_url: iconUrl,
      screenshot_url: screenshotUrl,
      // New metadata
      commander_name: commanderName ?? null,
      roles,
      status,
      x_handle: xHandle ?? null,
      instagram_handle: instagramHandle ?? null,
      github_handle: githubHandle ?? null,
      youtube_url: youtubeUrl ?? null,
    }).select().single();

    if (error) {
      console.error('Error inserting ship:', error);
      return NextResponse.json({ error: 'ship-insert-failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ship: data });
  } catch (err) {
    console.error('[DEPLOY_API] Unexpected error:', err);
    return NextResponse.json({ error: 'internal-server-error' }, { status: 500 });
  }
} 