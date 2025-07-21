import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Server sign-out error:', error);
      return NextResponse.json({ error: 'Sign-out failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Signed out successfully' });
  } catch (err) {
    console.error('Unexpected sign-out error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 