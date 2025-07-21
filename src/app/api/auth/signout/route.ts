import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log('[AUTH API] Processing sign-out request');
    
    // Sign out the user - this invalidates the session and clears cookies
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[AUTH API] Server sign-out error:', error);
      return NextResponse.json({ error: 'Sign-out failed' }, { status: 500 });
    }

    console.log('[AUTH API] Sign-out successful');
    
    // Create response with explicit cookie clearing
    const response = NextResponse.json({ 
      success: true, 
      message: 'Signed out successfully' 
    });
    
    // Ensure auth cookies are cleared (belt and suspenders approach)
    response.cookies.delete('supabase-auth-token');
    response.cookies.delete('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    
    return response;
    
  } catch (err) {
    console.error('[AUTH API] Unexpected sign-out error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 