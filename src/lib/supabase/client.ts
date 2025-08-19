import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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
          payment_id: string | null;
          website_url: string;
          name: string;
          tagline: string | null;
          description: string | null;
          orbit_tags: string[];
          icon_url: string | null;
          screenshot_url: string | null;
          spaceship_id: string;
          orbit_radius: number | null;
          inclination: number | null;
          phase: number | null;
          ascending_node: number | null;
          eccentricity: number | null;
          angular_speed: number | null;
          price: number;
          commander_name: string | null;
          roles: string[];
          status: string | null;
          x_handle: string | null;
          instagram_handle: string | null;
          github_handle: string | null;
          youtube_url: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          payment_id?: string | null;
          website_url: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          orbit_tags?: string[];
          icon_url?: string | null;
          screenshot_url?: string | null;
          spaceship_id: string;
          orbit_radius?: number | null;
          inclination?: number | null;
          phase?: number | null;
          ascending_node?: number | null;
          eccentricity?: number | null;
          angular_speed?: number | null;
          price?: number;
          commander_name?: string | null;
          roles?: string[];
          status?: string | null;
          x_handle?: string | null;
          instagram_handle?: string | null;
          github_handle?: string | null;
          youtube_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          payment_id?: string | null;
          website_url?: string;
          name?: string;
          tagline?: string | null;
          description?: string | null;
          orbit_tags?: string[];
          icon_url?: string | null;
          screenshot_url?: string | null;
          spaceship_id?: string;
          orbit_radius?: number | null;
          inclination?: number | null;
          phase?: number | null;
          ascending_node?: number | null;
          eccentricity?: number | null;
          angular_speed?: number | null;
          price?: number;
          commander_name?: string | null;
          roles?: string[];
          status?: string | null;
          x_handle?: string | null;
          instagram_handle?: string | null;
          github_handle?: string | null;
          youtube_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
  };
}