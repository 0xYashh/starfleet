import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  console.log('[AUTH CALLBACK] Processing auth callback', {
    hasCode: !!code,
    origin,
    timestamp: new Date().toISOString()
  });

  if (code) {
    const supabase = await createClient();
    
    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH CALLBACK] Session exchange error:', error.message);
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }
      
      if (data?.user) {
        console.log('[AUTH CALLBACK] Authentication successful for user:', data.user.id);
        return NextResponse.redirect(`${origin}/?auth_success=true`);
      } else {
        console.warn('[AUTH CALLBACK] No user data returned');
        return NextResponse.redirect(`${origin}/?error=no_user`);
      }
      
    } catch (err) {
      console.error('[AUTH CALLBACK] Unexpected error:', err);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  console.warn('[AUTH CALLBACK] No code provided in callback');
  return NextResponse.redirect(`${origin}/?error=no_code`);
}