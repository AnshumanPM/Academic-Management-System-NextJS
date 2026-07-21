"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const FREE_LIMIT = 3;
export const WINDOW_DURATION = 2 * 60 * 60 * 1000;

type LimitStore = {
  usedCount: number;
  freeLimit: number;

  windowStartedAt: number | null;
  windowExpiresAt: number | null;

  unlimitedUnlocked: boolean;

  canOperate: () => boolean;
  doOperation: () => boolean;

  unlockUnlimited: () => void;
  resetWindow: () => void;
  refreshWindow: () => void;

  getRemainingFreeOperations: () => number;
  getRemainingTime: () => number;
};

export const useLimitStore = create<LimitStore>()(
  persist(
    (set, get) => ({
      usedCount: 0,
      freeLimit: FREE_LIMIT,

      windowStartedAt: null,
      windowExpiresAt: null,

      unlimitedUnlocked: false,

      refreshWindow: () => {
        const { windowExpiresAt } = get();

        if (windowExpiresAt !== null && Date.now() >= windowExpiresAt) {
          set({
            usedCount: 0,
            windowStartedAt: null,
            windowExpiresAt: null,
            unlimitedUnlocked: false,
          });
        }
      },

      canOperate: () => {
        get().refreshWindow();

        const { usedCount, freeLimit, unlimitedUnlocked } = get();

        if (unlimitedUnlocked) {
          return true;
        }

        return usedCount < freeLimit;
      },

      doOperation: () => {
        get().refreshWindow();

        const { usedCount, freeLimit, windowStartedAt, unlimitedUnlocked } =
          get();

        if (unlimitedUnlocked) {
          return true;
        }

        if (usedCount >= freeLimit) {
          return false;
        }

        const now = Date.now();

        if (windowStartedAt === null) {
          set({
            usedCount: 1,
            windowStartedAt: now,
            windowExpiresAt: now + WINDOW_DURATION,
          });

          return true;
        }

        set({
          usedCount: usedCount + 1,
        });

        return true;
      },

      unlockUnlimited: () => {
        get().refreshWindow();

        const { windowStartedAt, windowExpiresAt } = get();

        const now = Date.now();

        if (windowStartedAt === null || windowExpiresAt === null) {
          set({
            windowStartedAt: now,
            windowExpiresAt: now + WINDOW_DURATION,
            unlimitedUnlocked: true,
          });

          return;
        }

        set({
          unlimitedUnlocked: true,
        });
      },

      resetWindow: () => {
        set({
          usedCount: 0,
          windowStartedAt: null,
          windowExpiresAt: null,
          unlimitedUnlocked: false,
        });
      },

      getRemainingFreeOperations: () => {
        get().refreshWindow();

        const { usedCount, freeLimit, unlimitedUnlocked } = get();

        if (unlimitedUnlocked) {
          return Infinity;
        }

        return Math.max(0, freeLimit - usedCount);
      },

      getRemainingTime: () => {
        get().refreshWindow();

        const { windowExpiresAt } = get();

        if (windowExpiresAt === null) {
          return 0;
        }

        return Math.max(0, windowExpiresAt - Date.now());
      },
    }),

    {
      name: "limit-store",
      version: 3,

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        usedCount: state.usedCount,
        windowStartedAt: state.windowStartedAt,
        windowExpiresAt: state.windowExpiresAt,
        unlimitedUnlocked: state.unlimitedUnlocked,
      }),

      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<LimitStore>;

        return {
          usedCount: state.usedCount ?? 0,
          windowStartedAt: state.windowStartedAt ?? null,
          windowExpiresAt: state.windowExpiresAt ?? null,
          unlimitedUnlocked: state.unlimitedUnlocked ?? false,
        };
      },
    },
  ),
);
