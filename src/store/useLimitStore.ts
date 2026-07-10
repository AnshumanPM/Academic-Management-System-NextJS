"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type LimitStore = {
  usedCount: number;
  maxLimit: number;
  doOperation: () => void;
  resetUsage: () => void;
};

export const useLimitStore = create<LimitStore>()(
  persist(
    (set, get) => ({
      usedCount: 0,
      maxLimit: 15,

      doOperation: () => {
        const { usedCount, maxLimit } = get();
        if (usedCount >= maxLimit) return;
        set({ usedCount: usedCount + 1 });
      },

      resetUsage: () => set({ usedCount: 0 }),
    }),
    {
      name: "limit-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
