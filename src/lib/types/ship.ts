export interface Ship {
  id: string;
  user_id: string;
  website_url: string;
  name: string;
  tagline: string | null;
  description: string | null;
  orbit_tags: string[];
  spaceship_id: string;
  orbit_radius: number;
  inclination: number;
  phase: number;
  angular_speed: number;
  price: number;
  created_at: string;
  icon_url: string | null;
  screenshot_url: string | null;
} 