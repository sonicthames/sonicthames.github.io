import { z } from "zod"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { PersistedReveal } from "@/features/map/overlays/Fog/types"

/**
 * Zod schemas for runtime validation of persisted data
 */

const LngLatSchema = z.object({
  lng: z.number().finite(),
  lat: z.number().finite(),
})

const PersistedRevealSchema = z.object({
  lng: z.number().finite(),
  lat: z.number().finite(),
})

const PersistedStateSchema = z.object({
  lastUserPosition: LngLatSchema.nullable(),
  fogReveals: z.array(PersistedRevealSchema),
})

/**
 * Type inference from Zod schemas
 */
type LngLatData = z.infer<typeof LngLatSchema>
type PersistedState = z.infer<typeof PersistedStateSchema>

/**
 * Store actions
 */
interface PersistenceActions {
  setLastUserPosition: (position: LngLatData | null) => void
  setFogReveals: (reveals: readonly PersistedReveal[]) => void
  clearFogReveals: () => void
}

type PersistenceStore = PersistedState & PersistenceActions

/**
 * Centralized persistence store for map interactivity data
 *
 * Features:
 * - Zod schema validation for runtime safety
 * - Zustand middleware for automatic persistence
 * - Type-safe API for accessing persisted state
 * - Graceful error handling for localStorage failures
 */
export const usePersistenceStore = create<PersistenceStore>()(
  persist(
    (set) => ({
      // State
      lastUserPosition: null,
      fogReveals: [],

      // Actions
      setLastUserPosition: (position) => set({ lastUserPosition: position }),

      setFogReveals: (reveals) =>
        set({
          fogReveals: [...reveals],
        }),

      clearFogReveals: () => set({ fogReveals: [] }),
    }),
    {
      name: "sonic-thames:persistence",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastUserPosition: state.lastUserPosition,
        fogReveals: state.fogReveals,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Failed to rehydrate persistence store", error)
          return
        }

        if (!state) {
          return
        }

        // Validate rehydrated state with Zod
        const result = PersistedStateSchema.safeParse({
          lastUserPosition: state.lastUserPosition,
          fogReveals: state.fogReveals,
        })

        if (!result.success) {
          console.warn(
            "Persisted state validation failed, resetting to defaults",
            result.error,
          )
          // Reset to defaults on validation failure
          state.lastUserPosition = null
          state.fogReveals = []
        }
      },
    },
  ),
)

/**
 * Convenience hooks for specific slices of persisted state
 */
export const useLastUserPosition = () =>
  usePersistenceStore((state) => state.lastUserPosition)

export const useSetLastUserPosition = () =>
  usePersistenceStore((state) => state.setLastUserPosition)

export const useFogReveals = () =>
  usePersistenceStore((state) => state.fogReveals)

export const useSetFogReveals = () =>
  usePersistenceStore((state) => state.setFogReveals)

export const useClearFogReveals = () =>
  usePersistenceStore((state) => state.clearFogReveals)
