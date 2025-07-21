import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = SignInSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' }, 
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const supabase = await createClient();
    
    // Log the attempt (useful for production monitoring)
    console.log(`[AUTH] Magic link requested for: ${email} at ${new Date().toISOString()}`);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${req.nextUrl.origin}/`,
      },
    });
    
    if (error) {
      // Log specific error types to detect rate limiting
      console.error(`[AUTH] Supabase error for ${email}:`, {
        message: error.message,
        status: error.status,
        code: error.code || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      // Check if it's a rate limit error
      if (error.message?.toLowerCase().includes('rate') || 
          error.message?.toLowerCase().includes('limit') ||
          error.status === 429) {
        console.warn(`[AUTH] RATE LIMITED: ${email} - ${error.message}`);
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a few minutes.' }, 
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }

    console.log(`[AUTH] Magic link sent successfully to: ${email}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent successfully' 
    });
  } catch (err) {
    console.error('[AUTH] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 