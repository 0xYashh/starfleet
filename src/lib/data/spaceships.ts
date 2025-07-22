export interface VehicleAsset {
  id: string;
  label: string;
  price: 0 | 5;
  remoteUrl: string; // UploadThing CDN URL
  localPath: string; // Local fallback path
  previewPng?: string; // URL for a static preview image
  radius: number; // Orbit layer (4-5 for free, 6-8 for paid)
  category: 'aircraft' | 'spaceship';
}

export const VEHICLES: Record<string, VehicleAsset> = {
  // FREE AIRCRAFT (Lower Orbit - Atmospheric Layer)
  "jet": {
    id: "jet",
    label: "Jet",
    price: 0,
    remoteUrl:"https://fq45fpomsg.ufs.sh/f/dTANuJjEj28L5YrvvX4gcP1MLvUNE7nCdkS3TXVH0DOJhj9m",
    localPath: "/models/jet.glb",
    previewPng: "/spaceships/Jet-mobile.png",
    radius: 4,
    category: 'aircraft'
  },
  "airship": {
    id: "airship", 
    label: "Airship",
    price: 0,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LLKJawTgZ9N4JvGE1AlHyQax8rqtkiOsgKoTP",
    localPath: "/models/airship.glb",
    previewPng: "/spaceships/airship-mobile.png",
    radius: 4.5,
    category: 'aircraft'
  },
  // PAID SPACESHIPS (Higher Orbit - Space Layer)
  "air-police": {
    id: "air-police",
    label: "Air Police – High Speed",
    price: 5,
    remoteUrl:"https://fq45fpomsg.ufs.sh/f/dTANuJjEj28L6abe3kuLrpQnYBGzqU8TAZaPEugtDcLyOxvw",
    localPath: "/models/Air Police - High Speed.glb",
    previewPng: "/spaceships/air-police_high_speed-mobile.png",
    radius: 7,
    category: 'spaceship'
  },
  "colored-freighter": {
    id: "colored-freighter",
    label: "Colored Freighter",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LPEFdGEyfsAkJFcXNHiEneUlMWtKZq204buvB",
    localPath: "/models/Colored Freighter.glb",
    previewPng: "/spaceships/colored_freighter-mobile.png",
    radius: 7.2,
    category: 'spaceship'
  },
  "x-wing-2": {
    id: "x-wing-2",
    label: "x-wing II",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LA1Zh8X36qu5HJNAtLzI7XQiKFcy8lj2avWmo",
    localPath: "/models/x-wing.glb",
    previewPng: "/spaceships/x_wing_II-mobile.png",
    radius: 6.5,
    category: 'spaceship'
  },
  "x-wing": {
    id: "x-wing",
    label: "T-65 X-Wing Starfighter",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LY9t0DB6p2oF1aSPuXhAKQdscCkUW69GzDlER",
    localPath: "/models/T-65 X-Wing Starfighter.glb",
    previewPng: "/spaceships/T-65_X-Wing_Starfighter-mobile.png",
    radius: 6.8,
    category: 'spaceship'
  },
  "ship-1": {
    id: "ship-1",
    label: "Stardust Cruiser",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28L3DVId49nHP4bXojdt3ZFslnSkT07OVQW6Ugr",
    localPath: "/models/Spaceship.glb",
    previewPng: "/spaceships/Stardust_Cruiser-mobile.png",
    radius: 6.2,
    category: 'spaceship'
  },
  "ship-2": {
    id: "ship-2",
    label: "Nova Voyager",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LMHWYMtF7xSFh8PNIwJik1g69ZLRvnCestXzY",
    localPath: "/models/Spaceship 2.glb",
    previewPng: "/spaceships/Nova_Voyager-mobile.png",
    radius: 6.4,
    category: 'spaceship'
  },
  "ship-3": {
    id: "ship-3",
    label: "Galactic Drifter",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LF5COeOKhYN4IEuAKQ5DSGUxgBP7T9bspeOFt",
    localPath: "/models/Spaceship 3.glb",
    previewPng: "/spaceships/Galactic_Drifter-mobile.png",
    radius: 6.6,
    category: 'spaceship'
  },
  "ship-4": {
    id: "ship-4",
    label: "Orion Scout",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LjAliuTkb0IJTkFvWhHX7Px68OYa5NdneAVKy",
    localPath: "/models/Spaceship 4.glb",
    previewPng: "/spaceships/Orion_Scout-mobile.png",
    radius: 6.8,
    category: 'spaceship'
  },
  "ship-5": {
    id: "ship-5",
    label: "Astro Hopper",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LnGCpd8zQcTJN5WH6GwqortR1IE48sXU3izdZ",
    localPath: "/models/spaceship 5.glb",
    previewPng: "/spaceships/astro_hopper-mobile.png",
    radius: 7.0,
    category: 'spaceship'
  }
};

// Helper functions
export function getFreeVehicles(): VehicleAsset[] {
  return Object.values(VEHICLES).filter(vehicle => vehicle.price === 0);
}

export function getPaidVehicles(): VehicleAsset[] {
  return Object.values(VEHICLES).filter(vehicle => vehicle.price === 5);
}

export function getVehicleById(id: string): VehicleAsset | undefined {
  return VEHICLES[id];
}

export function getVehiclesByCategory(category: 'aircraft' | 'spaceship'): VehicleAsset[] {
  return Object.values(VEHICLES).filter(vehicle => vehicle.category === category);
} 