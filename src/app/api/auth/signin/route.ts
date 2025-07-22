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
    
    console.log(`[AUTH] OTP sign-in requested for: ${email}`);
    
<<<<<<< HEAD
    // Send an email OTP code (no magic link)
    const { data, error } = await supabase.auth.signInWithOtp({
=======
    const origin = req.nextUrl.origin;
    const redirectTo = `${origin}/api/auth/callback`;
    
    // Disable PKCE for magic links to fix mobile browser switching issues
    // Magic links are already secure via email verification
    const { error } = await supabase.auth.signInWithOtp({
>>>>>>> 74373bd210e15d283c6ab763a51434ad2692ff63
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    
    if (error) {
      console.error(`[AUTH] Error for ${email}:`, error.message);
      
      if (error.message?.toLowerCase().includes('rate') || 
          error.message?.toLowerCase().includes('limit') ||
          error.status === 429) {
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

    console.log(`[AUTH] OTP sent successfully to: ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (err) {
    console.error('[AUTH] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}