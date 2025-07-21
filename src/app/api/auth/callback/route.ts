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
    allParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  });

  if (code) {
    const supabase = await createClient();
    
    try {
      // Use exchangeCodeForSession which handles PKCE properly
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH CALLBACK] Session exchange error:', {
          error: error.message,
          code: error.code,
          userAgent,
          timestamp: new Date().toISOString()
        });
        
        // More specific error handling
        if (error.message?.includes('code verifier')) {
          console.error('[AUTH CALLBACK] PKCE code verifier issue - this is a Supabase configuration problem');
          return NextResponse.redirect(`${origin}/?error=pkce_failed`);
        }
        
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }
      
      if (data?.user) {
        console.log('[AUTH CALLBACK] Session exchange successful', {
          userId: data.user.id,
          userAgent,
          timestamp: new Date().toISOString()
        });
        
        // Successful authentication - redirect to home
        return NextResponse.redirect(`${origin}/`);
      } else {
        console.warn('[AUTH CALLBACK] No user data returned despite no error');
        return NextResponse.redirect(`${origin}/?error=no_user`);
      }
      
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
  return NextResponse.redirect(`${origin}/?error=no_code`);
}