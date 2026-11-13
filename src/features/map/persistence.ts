import * as z from "zod/mini"
import { create } from "zustand"
import type { PersistStorage, StorageValue } from "zustand/middleware"
import { persist } from "zustand/middleware"
import type { PersistedReveal } from "@/features/map/overlays/Fog/types"

/**
 * Zod schemas for runtime validation of persisted data
 */

const LngLatSchema = z.object({
  lng: z.number(),
  lat: z.number(),
})

const PersistedRevealSchema = z.object({
  lng: z.number(),
  lat: z.number(),
})

const PersistedStateSchema = z.object({
  lastUserPosition: z.nullable(LngLatSchema),
  fogReveals: z.array(PersistedRevealSchema),
})

/**
 * Type inference from Zod schemas
 */
type LngLatData = z.infer<typeof LngLatSchema>
type PersistedState = z.infer<typeof PersistedStateSchema>

const WRITE_INTERVAL_MS = 2000

// The position changes every animation frame and the reveals can number in the
// thousands, so serialising on every update would stall the main thread.
const createThrottledStorage = <S>(intervalMs: number): PersistStorage<S> => {
  let pending: {
    readonly name: string
    readonly value: StorageValue<S>
  } | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (pending === null) {
      return
    }
    const { name, value } = pending
    pending = null
    try {
      localStorage.setItem(name, JSON.stringify(value))
    } catch (error) {
      console.warn("Failed to persist map state", error)
    }
  }

  window.addEventListener("pagehide", flush)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush()
    }
  })

  return {
    getItem: (name) => {
      if (pending?.name === name) {
        return pending.value
      }
      const raw = localStorage.getItem(name)
      return raw === null ? null : (JSON.parse(raw) as StorageValue<S>)
    },
    setItem: (name, value) => {
      pending = { name, value }
      timer ??= setTimeout(flush, intervalMs)
    },
    removeItem: (name) => {
      if (pending?.name === name) {
        pending = null
      }
      localStorage.removeItem(name)
    },
  }
}

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
      storage: createThrottledStorage(WRITE_INTERVAL_MS),
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
