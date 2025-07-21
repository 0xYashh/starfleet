import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  console.log('[AUTH CALLBACK] Processing callback with code:', !!code);

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[AUTH CALLBACK] Error:', error.message);
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }
      
      console.log('[AUTH CALLBACK] Session exchange successful');
      return NextResponse.redirect(`${origin}/?auth_success=true`);
      
    } catch (err) {
      console.error('[AUTH CALLBACK] Unexpected error:', err);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  console.warn('[AUTH CALLBACK] No code provided');
  return NextResponse.redirect(`${origin}/?error=no_code`);
}