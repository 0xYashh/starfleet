export interface VehicleAsset {
  id: string;
  label: string;
  price: 0 | 5;
  remoteUrl: string; // UploadThing CDN URL
  localPath: string; // Local fallback path
  radius: number; // Orbit layer (4-5 for free, 6-8 for paid)
  category: 'aircraft' | 'spaceship';
}

export const VEHICLES: Record<string, VehicleAsset> = {
  // FREE AIRCRAFT (Lower Orbit - Atmospheric Layer)
  "airplane": {
    id: "airplane",
    label: "Airplane",
    price: 0,
    remoteUrl: "https://utfs.io/f/placeholder_airplane.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Airplane 1.glb",
    radius: 4,
    category: 'aircraft'
  },
  "airship": {
    id: "airship", 
    label: "Airship",
    price: 0,
    remoteUrl: "https://utfs.io/f/placeholder_airship.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/airship.glb",
    radius: 4.5,
    category: 'aircraft'
  },

  // PAID SPACESHIPS (Higher Orbit - Space Layer)
  "air-police": {
    id: "air-police",
    label: "Air Police – High Speed",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_air-police.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Air Police - High Speed.glb",
    radius: 7,
    category: 'spaceship'
  },
  "colored-freighter": {
    id: "colored-freighter",
    label: "Colored Freighter",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_colored-freighter.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Colored Freighter.glb",
    radius: 7.2,
    category: 'spaceship'
  },
  "flying-saucer": {
    id: "flying-saucer",
    label: "Flying Saucer",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_flying-saucer.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Flying saucer.glb",
    radius: 6.5,
    category: 'spaceship'
  },
  "x-wing": {
    id: "x-wing",
    label: "T-65 X-Wing Starfighter",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_x-wing.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/T-65 X-Wing Starfighter.glb",
    radius: 6.8,
    category: 'spaceship'
  },
  "ship-1": {
    id: "ship-1",
    label: "Spaceship (Low-poly)",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_ship-1.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Spaceship.glb",
    radius: 6.2,
    category: 'spaceship'
  },
  "ship-2": {
    id: "ship-2",
    label: "Spaceship 2",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_ship-2.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Spaceship 2.glb",
    radius: 6.4,
    category: 'spaceship'
  },
  "ship-3": {
    id: "ship-3",
    label: "Spaceship 3",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_ship-3.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Spaceship 3.glb",
    radius: 6.6,
    category: 'spaceship'
  },
  "ship-4": {
    id: "ship-4",
    label: "Spaceship 4",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_ship-4.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/Spaceship 4.glb",
    radius: 6.8,
    category: 'spaceship'
  },
  "ship-5": {
    id: "ship-5",
    label: "Spaceship 5",
    price: 5,
    remoteUrl: "https://utfs.io/f/placeholder_ship-5.glb", // TODO: Replace with actual UploadThing URL
    localPath: "/models/spaceship 5.glb",
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