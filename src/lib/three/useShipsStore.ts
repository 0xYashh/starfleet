import { create } from 'zustand';
import type { Ship } from '@/lib/types/ship';

interface ShipsState {
  ships: Ship[];
  setShips: (ships: Ship[]) => void;
  addShip: (ship: Ship) => void;
}

export const useShipsStore = create<ShipsState>((set) => ({
  ships: [],
  setShips: (ships) => set({ ships }),
  addShip: (ship) => set((state) => ({ ships: [...state.ships, ship] })),
})); 