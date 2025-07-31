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
    remoteUrl:"https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LmlN5cLd6LdMEGRiBUcoWu0SKVgv9A7sZ1jqQ",
    localPath: "/models/jet.compressed.glb",
    previewPng: "/spaceships/Jet-mobile.png",
    radius: 4,
    category: 'aircraft'
  },
  "airship": {
    id: "airship", 
    label: "Airship",
    price: 0,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LKmOADzulmyZFNflaQBRIXGPe2jAJHzw3DuO0",
    localPath: "/models/airship.compressed.glb",
    previewPng: "/spaceships/airship-mobile.png",
    radius: 4.5,
    category: 'aircraft'
  },
  // PAID SPACESHIPS (Higher Orbit - Space Layer)
  "air-police": {
    id: "air-police",
    label: "Air Police – High Speed",
    price: 5,
    remoteUrl:"https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LSMMGkxGPebdnWFGYOMhy08Cqti7oJfjRk6gK",
    localPath: "/models/Air Police - High Speed.compressed.glb",
    previewPng: "/spaceships/air-police_high_speed-mobile.png",
    radius: 7,
    category: 'spaceship'
  },
  "colored-freighter": {
    id: "colored-freighter",
    label: "Colored Freighter",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LRcaWThGeXZ4l0NKcOH76Qtq3JuM2YoaCzm1D",
    localPath: "/models/Colored Freighter.compressed.glb",
    previewPng: "/spaceships/colored_freighter-mobile.png",
    radius: 7.2,
    category: 'spaceship'
  },
  "x-wing-2": {
    id: "x-wing-2",
    label: "x-wing II",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28Lg63wTPatUdwImrA7XYNxSpPM1kuJiBz6aCZl",
    localPath: "/models/x-wing.compressed.glb",
    previewPng: "/spaceships/x_wing_II-mobile.png",
    radius: 6.5,
    category: 'spaceship'
  },
  "x-wing": {
    id: "x-wing",
    label: "T-65 X-Wing Starfighter",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LkEQ9SeIuXSi8s7tWkgypqHwFPoGlhQBrnKLf",
    localPath: "/models/T-65 X-Wing Starfighter.compressed.glb",
    previewPng: "/spaceships/T-65_X-Wing_Starfighter-mobile.png",
    radius: 6.8,
    category: 'spaceship'
  },
  "ship-1": {
    id: "ship-1",
    label: "Stardust Cruiser",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LjqOzPLkb0IJTkFvWhHX7Px68OYa5NdneAVKy",
    localPath: "/models/Spaceship.compressed.glb",
    previewPng: "/spaceships/Stardust_Cruiser-mobile.png",
    radius: 6.2,
    category: 'spaceship'
  },
  "ship-2": {
    id: "ship-2",
    label: "Nova Voyager",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LnXlV8FzQcTJN5WH6GwqortR1IE48sXU3izdZ",
    localPath: "/models/Spaceship 2.compressed.glb",
    previewPng: "/spaceships/Nova_Voyager-mobile.png",
    radius: 6.4,
    category: 'spaceship'
  },
  "ship-3": {
    id: "ship-3",
    label: "Galactic Drifter",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LX8uEXjCWmvgNMzlUsfDdZQOwYkKcu9x0JCah",
    localPath: "/models/Spaceship 3.compressed.glb",
    previewPng: "/spaceships/Galactic_Drifter-mobile.png",
    radius: 6.6,
    category: 'spaceship'
  },
  "ship-4": {
    id: "ship-4",
    label: "Orion Scout",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28Ljfmo1Ukb0IJTkFvWhHX7Px68OYa5NdneAVKy",
    localPath: "/models/Spaceship 4.compressed.glb",
    previewPng: "/spaceships/Orion_Scout-mobile.png",
    radius: 6.8,
    category: 'spaceship'
  },
  "ship-5": {
    id: "ship-5",
    label: "Astro Hopper",
    price: 5,
    remoteUrl: "https://fq45fpomsg.ufs.sh/f/dTANuJjEj28LLXwJSLgZ9N4JvGE1AlHyQax8rqtkiOsgKoTP",
    localPath: "/models/spaceship 5.compressed.glb",
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