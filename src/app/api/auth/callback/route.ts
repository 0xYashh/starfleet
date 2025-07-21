import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // Log the callback attempt
  console.log('[AUTH CALLBACK] Processing auth callback', {
    hasCode: !!code,
    origin,
    timestamp: new Date().toISOString()
  });

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH CALLBACK] Session exchange error:', error);
        // Redirect to homepage with error
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }
      
      console.log('[AUTH CALLBACK] Session exchange successful');
      // Redirect to homepage on success
      return NextResponse.redirect(`${origin}/`);
      
    } catch (err) {
      console.error('[AUTH CALLBACK] Unexpected error:', err);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  // No code provided, redirect to homepage
  console.warn('[AUTH CALLBACK] No code provided in callback');
  return NextResponse.redirect(`${origin}/`);
} 