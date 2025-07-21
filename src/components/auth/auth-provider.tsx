'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth state changes - this is the source of truth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // When user signs in, clean the magic link params from the URL
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureProfile(session.user);
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // When user signs out, navigate to home and clean up
      if (event === 'SIGNED_OUT') {
        console.log('[AUTH] User signed out, redirecting to home');
        setUser(null);
        setLoading(false);
        
        // Redirect to home - Next.js router will handle URL cleaning
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Fallback profile creation if trigger fails
  async function ensureProfile(user: User) {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            display_name: user.email?.split('@')[0] || 'Pilot'
          });
          
        if (insertError) {
          console.error('Failed to create profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  }

  async function signInWithEmail(email: string) {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sign-in API error:', errorData);
        throw new Error(errorData.error || 'Failed to send sign-in email');
      }

      const data = await response.json();
      console.log('Sign-in success:', data.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Sign-in error:', message);
      throw new Error(message || 'Failed to send sign-in email');
    }
  }

  async function signOut() {
    try {
      console.log('[AUTH] Starting sign-out process');
      
      // Make POST request to sign-out API endpoint
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sign-out API error:', errorData);
        throw new Error(errorData.error || 'Sign-out failed');
      }

      console.log('[AUTH] Server sign-out successful');
      
      // Add a small delay to let the auth state change event fire
      setTimeout(() => {
        // If we're still on the same page after a delay, force redirect
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          console.log('[AUTH] Forcing redirect to home as fallback');
          router.replace('/');
        }
      }, 1000);
      
    } catch (err) {
      console.error('Unexpected sign-out error:', err);
      // Force clear local state and redirect as fallback
      setUser(null);
      setLoading(false);
      router.replace('/');
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}