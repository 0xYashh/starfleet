import { create } from 'zustand';
import { Ship } from '@/lib/types/ship';

interface ShipsStore {
  ships: Ship[];
  selectedShip: Ship | null;
  setShips: (ships: Ship[]) => void;
  addShip: (ship: Ship) => void;
  setSelectedShip: (ship: Ship | null) => void;
}

export const useShipsStore = create<ShipsStore>((set) => ({
  ships: [],
  selectedShip: null,
  setShips: (ships) => set({ ships }),
  addShip: (ship) => set((state) => ({ ships: [...state.ships, ship] })),
  setSelectedShip: (ship) => set({ selectedShip: ship }),
})); 