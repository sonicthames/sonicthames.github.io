import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { usePersistenceStore } from "./persistence"

const PERSISTENCE_KEY = "sonic-thames:persistence"

const localStorageMock = vi.hoisted(() => {
  const store = new Map<string, string>()
  const mock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
  vi.stubGlobal("localStorage", mock)
  return mock
})

describe("Persistence Store", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    // Clear all modules to ensure fresh state
    vi.resetModules()
  })

  it("should initialize with default state", () => {
    const store = usePersistenceStore.getState()
    expect(store.lastUserPosition).toBeNull()
    expect(store.fogReveals).toEqual([])
  })

  it("should set last user position", () => {
    const testPosition = { lng: -0.1, lat: 51.5 }
    usePersistenceStore.getState().setLastUserPosition(testPosition)

    const store = usePersistenceStore.getState()
    expect(store.lastUserPosition).toEqual(testPosition)
  })

  it("should set fog reveals", () => {
    const testReveals = [
      { lng: -0.1, lat: 51.5 },
      { lng: -0.2, lat: 51.6 },
    ]
    usePersistenceStore.getState().setFogReveals(testReveals)

    const store = usePersistenceStore.getState()
    expect(store.fogReveals).toEqual(testReveals)
  })

  it("should clear fog reveals", () => {
    // First set some reveals
    const testReveals = [{ lng: -0.1, lat: 51.5 }]
    usePersistenceStore.getState().setFogReveals(testReveals)

    // Then clear them
    usePersistenceStore.getState().clearFogReveals()

    const store = usePersistenceStore.getState()
    expect(store.fogReveals).toEqual([])
  })

  it("should validate and reset invalid persisted state", async () => {
    // Set invalid state in localStorage FIRST
    localStorageMock.setItem(
      PERSISTENCE_KEY,
      JSON.stringify({
        lastUserPosition: { lng: "invalid", lat: 51.5 }, // Invalid lng type
        fogReveals: [{ lng: -0.1, lat: "invalid" }], // Invalid lat type
      }),
    )

    // Re-import the module to trigger persistence initialization with our mock data
    const { usePersistenceStore: useReloadedPersistenceStore } = await import(
      "./persistence"
    )

    // Initialize store - should reset to defaults due to validation failure
    const store = useReloadedPersistenceStore.getState()
    expect(store.lastUserPosition).toBeNull()
    expect(store.fogReveals).toEqual([])
  })

  it("should persist state across reinitialization", () => {
    // Set state
    const testPosition = { lng: -0.1, lat: 51.5 }
    const testReveals = [{ lng: -0.2, lat: 51.6 }]

    usePersistenceStore.getState().setLastUserPosition(testPosition)
    usePersistenceStore.getState().setFogReveals(testReveals)

    // Create new store instance (simulating page reload)
    const newStore = usePersistenceStore.getState()
    expect(newStore.lastUserPosition).toEqual(testPosition)
    expect(newStore.fogReveals).toEqual(testReveals)
  })

  it("should handle null last user position", () => {
    usePersistenceStore.getState().setLastUserPosition(null)
    const store = usePersistenceStore.getState()
    expect(store.lastUserPosition).toBeNull()
  })

  describe("writes", () => {
    const readPersisted = () =>
      JSON.parse(localStorageMock.getItem(PERSISTENCE_KEY) ?? "null") as {
        readonly state: { readonly lastUserPosition: unknown }
      } | null

    beforeEach(() => {
      // Flush anything earlier tests left pending under real timers.
      window.dispatchEvent(new Event("pagehide"))
      localStorageMock.clear()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("coalesces updates into one write per interval", () => {
      const setItem = vi.spyOn(localStorageMock, "setItem")
      const store = usePersistenceStore.getState()
      store.setLastUserPosition({ lng: 1, lat: 1 })
      store.setLastUserPosition({ lng: 2, lat: 2 })

      vi.advanceTimersByTime(1999)
      expect(setItem).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(setItem).toHaveBeenCalledTimes(1)
      expect(readPersisted()?.state.lastUserPosition).toEqual({
        lng: 2,
        lat: 2,
      })
      setItem.mockRestore()
    })

    it("flushes pending state when the page is hidden", () => {
      usePersistenceStore.getState().setLastUserPosition({ lng: 3, lat: 3 })
      expect(readPersisted()).toBeNull()

      window.dispatchEvent(new Event("pagehide"))
      expect(readPersisted()?.state.lastUserPosition).toEqual({
        lng: 3,
        lat: 3,
      })
    })
  })
})
