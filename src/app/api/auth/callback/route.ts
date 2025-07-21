import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isInAppBrowser = /FBAN|FBAV|Instagram|Twitter|LinkedIn|WhatsApp/.test(userAgent);
  
  // Enhanced logging for mobile debugging
  console.log('[AUTH CALLBACK] Processing auth callback', {
    hasCode: !!code,
    origin,
    userAgent,
    isMobile,
    isInAppBrowser,
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
          isMobile,
          isInAppBrowser,
          timestamp: new Date().toISOString()
        });
        
        // Handle PKCE errors specifically for mobile
        if (error.message?.includes('code verifier') || error.message?.includes('PKCE')) {
          console.error('[AUTH CALLBACK] PKCE code verifier issue - likely mobile browser isolation');
          
          // For mobile, redirect with a special success page that handles cross-browser auth
          if (isMobile || isInAppBrowser) {
            return NextResponse.redirect(`${origin}/?mobile_auth=retry&email_hint=check_email`);
          }
          
          return NextResponse.redirect(`${origin}/?error=pkce_failed`);
        }
        
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }
      
      if (data?.user) {
        console.log('[AUTH CALLBACK] Session exchange successful', {
          userId: data.user.id,
          userAgent,
          isMobile,
          isInAppBrowser,
          timestamp: new Date().toISOString()
        });
        
        // For mobile/in-app browsers, add success indicator
        if (isMobile || isInAppBrowser) {
          return NextResponse.redirect(`${origin}/?auth_success=true&mobile=true`);
        }
        
        // Successful authentication - redirect to home
        return NextResponse.redirect(`${origin}/?auth_success=true`);
      } else {
        console.warn('[AUTH CALLBACK] No user data returned despite no error');
        return NextResponse.redirect(`${origin}/?error=no_user`);
      }
      
    } catch (err) {
      console.error('[AUTH CALLBACK] Unexpected error:', {
        error: err,
        userAgent,
        isMobile,
        isInAppBrowser,
        timestamp: new Date().toISOString()
      });
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  // No code provided - common with mobile browser switching
  console.warn('[AUTH CALLBACK] No code provided in callback', {
    userAgent,
    isMobile,
    isInAppBrowser,
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  });
  
  // For mobile without code, suggest opening in main browser
  if (isMobile || isInAppBrowser) {
    return NextResponse.redirect(`${origin}/?mobile_auth=open_browser`);
  }
  
  return NextResponse.redirect(`${origin}/?error=no_code`);
}