import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Enhanced logging for mobile debugging
  console.log('[AUTH CALLBACK] Processing auth callback', {
    hasCode: !!code,
    origin,
    userAgent,
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
    timestamp: new Date().toISOString()
  });

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH CALLBACK] Session exchange error:', {
          error: error.message,
          code: error.code,
          userAgent,
          timestamp: new Date().toISOString()
        });
        // Redirect to homepage with error
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }
      
      console.log('[AUTH CALLBACK] Session exchange successful', {
        userAgent,
        timestamp: new Date().toISOString()
      });
      // Redirect to homepage on success
      return NextResponse.redirect(`${origin}/`);
      
    } catch (err) {
      console.error('[AUTH CALLBACK] Unexpected error:', {
        error: err,
        userAgent,
        timestamp: new Date().toISOString()
      });
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  // No code provided, redirect to homepage
  console.warn('[AUTH CALLBACK] No code provided in callback', {
    userAgent,
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  });
  return NextResponse.redirect(`${origin}/`);
}