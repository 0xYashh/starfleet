export interface Ship {
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
} 