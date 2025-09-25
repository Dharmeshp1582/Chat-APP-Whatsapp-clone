import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false, // track hydration
      setUser: (userData) => set({ user: userData, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true); // mark hydration complete
      },
    }
  )
);
