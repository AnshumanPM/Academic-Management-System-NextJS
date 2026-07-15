"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const MAX_LIMIT = 15;

type LimitStore = {
  usedCount: number;
  maxLimit: number;
  doOperation: () => boolean;
  resetUsage: () => void;
};

export const useLimitStore = create<LimitStore>()(
  persist(
    (set, get) => ({
      usedCount: 0,
      maxLimit: MAX_LIMIT,

      doOperation: () => {
        const { usedCount, maxLimit } = get();
        if (usedCount >= maxLimit) return false;
        set({ usedCount: usedCount + 1 });
        return true;
      },

      resetUsage: () => set({ usedCount: 0 }),
    }),
    {
      name: "limit-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ usedCount: state.usedCount }),
      migrate: (persistedState: unknown) => {
        const state = persistedState as { usedCount?: number };
        return {
          usedCount: state?.usedCount ?? 0,
        };
      },
    },
  ),
);
