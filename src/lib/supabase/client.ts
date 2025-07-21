import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure for better mobile compatibility
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types (we'll define these later)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          x_handle: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          x_handle?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          x_handle?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          spaceship_id: string;
          bought_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spaceship_id: string;
          bought_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          spaceship_id?: string;
          bought_at?: string;
        };
      };
      ships: {
        Row: {
          id: string;
          user_id: string;
          website_url: string;
          name: string;
          tagline: string | null;
          description: string | null;
          icon_url: string | null;
          screenshot_url: string | null;
          spaceship_id: string;
          orbit_radius: number | null;
          inclination: number | null;
          phase: number | null;
          angular_speed: number | null;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          website_url: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          icon_url?: string | null;
          screenshot_url?: string | null;
          spaceship_id: string;
          orbit_radius?: number | null;
          inclination?: number | null;
          phase?: number | null;
          angular_speed?: number | null;
          price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          website_url?: string;
          name?: string;
          tagline?: string | null;
          description?: string | null;
          icon_url?: string | null;
          screenshot_url?: string | null;
          spaceship_id?: string;
          orbit_radius?: number | null;
          inclination?: number | null;
          phase?: number | null;
          angular_speed?: number | null;
          price?: number;
          created_at?: string;
        };
      };
    };
  };
}