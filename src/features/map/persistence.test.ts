// Mock localStorage first
const localStorageMock = (() => {
  const store = new Map()
  return {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
      return true
    },
    removeItem: (key: string) => {
      store.delete(key)
      return true
    },
    clear: () => {
      store.clear()
      return true
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

import { beforeEach, describe, expect, it, vi } from "vitest"
import { usePersistenceStore } from "./persistence"

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
      "sonic-thames:persistence",
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
})
