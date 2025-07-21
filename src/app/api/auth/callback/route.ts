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
      // First try to exchange the code
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH CALLBACK] Session exchange error:', error.message);
        
        // If PKCE fails, try to get existing session (mobile fallback)
        if (error.message?.includes('code verifier') || error.message?.includes('PKCE')) {
          console.log('[AUTH CALLBACK] PKCE failed, checking for existing session...');
          
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            console.log('[AUTH CALLBACK] Found existing session, redirecting to success');
            return NextResponse.redirect(`${origin}/?auth_success=true`);
          }
        }
        
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

  // No code provided - check if user already has a session
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (sessionData?.session?.user) {
    console.log('[AUTH CALLBACK] No code but found existing session');
    return NextResponse.redirect(`${origin}/?auth_success=true`);
  }

  console.warn('[AUTH CALLBACK] No code provided and no existing session');
  return NextResponse.redirect(`${origin}/?error=no_code`);
}