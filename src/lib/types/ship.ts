export interface Ship {
  id: string;
  user_id: string;
  website_url: string;
  name: string;
  tagline: string | null;
  description: string | null;
  orbit_tags?: string[]; // This might not be in all database records
  spaceship_id: string;
  orbit_radius: number | null;
  inclination: number | null;
  phase: number | null;
  ascending_node?: number | null; // This might not be in database
  eccentricity?: number | null; // This might not be in database
  angular_speed: number | null;
  price: number;
  created_at: string;
  updated_at?: string;
  icon_url: string | null;
  screenshot_url: string | null;
  // Extended metadata from Launch Wizard
  commander_name?: string | null;
  roles?: string[];
  status?: 'Building' | 'Launched';
  x_handle?: string | null;
  instagram_handle?: string | null;
  github_handle?: string | null;
  youtube_url?: string | null;
} 