import "@testing-library/jest-dom"
import type { ReactNode } from "react"
import { createElement } from "react"
import { vi } from "vitest"

class MockLngLat {
  readonly lng: number
  readonly lat: number
  constructor(lng: number, lat: number) {
    this.lng = lng
    this.lat = lat
  }

  static convert(
    value:
      | MockLngLat
      | readonly [number, number]
      | { readonly lng: number; readonly lat: number },
  ): MockLngLat {
    if (value instanceof MockLngLat) {
      return value
    }
    if (Array.isArray(value)) {
      const [lng, lat] = value
      return new MockLngLat(lng, lat)
    }
    const obj = value as { readonly lng: number; readonly lat: number }
    return new MockLngLat(obj.lng, obj.lat)
  }

  distanceTo(other: MockLngLat): number {
    const dx = other.lng - this.lng
    const dy = other.lat - this.lat
    return Math.sqrt(dx * dx + dy * dy) * 111_000
  }
}

class MockLngLatBounds {
  readonly sw: MockLngLat
  readonly ne: MockLngLat
  constructor(southWest: MockLngLat, northEast: MockLngLat) {
    this.sw = southWest
    this.ne = northEast
  }

  getSouthWest(): MockLngLat {
    return this.sw
  }

  getNorthEast(): MockLngLat {
    return this.ne
  }
}

class MockMercatorCoordinate {
  lng: number
  lat: number
  x: number
  y: number
  z: number

  constructor(lng: number, lat: number, z = 0) {
    this.lng = lng
    this.lat = lat
    // Simple mercator projection approximation
    this.x = lng * 0.017453292519943295 * 6378137
    this.y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 6378137
    this.z = z
  }

  static fromLngLat({ lng, lat }: { lng: number; lat: number }) {
    return new MockMercatorCoordinate(lng, lat)
  }

  meterInMercatorCoordinateUnits() {
    return 1
  }
}

vi.mock("mapbox-gl", () => {
  return {
    __esModule: true,
    default: {
      LngLat: MockLngLat,
      LngLatBounds: MockLngLatBounds,
      MercatorCoordinate: MockMercatorCoordinate,
      accessToken: "",
    },
    LngLat: MockLngLat,
    LngLatBounds: MockLngLatBounds,
    MercatorCoordinate: MockMercatorCoordinate,
  }
})

vi.mock("react-map-gl/mapbox", () => {
  const MockMap = ({ children }: { readonly children?: ReactNode }) =>
    createElement("div", { "data-testid": "mapbox-map" }, children)

  const Marker = ({ children }: { readonly children?: ReactNode }) =>
    createElement("div", { "data-testid": "mapbox-marker" }, children)

  return {
    __esModule: true,
    Map: MockMap,
    Marker,
  }
})

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

const noop = () => {}

if (typeof window.scrollTo !== "function") {
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    writable: true,
    value: noop,
  })
}

if (typeof globalThis.scrollTo !== "function") {
  globalThis.scrollTo = noop
}

if (typeof window.ResizeObserver !== "function") {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as typeof ResizeObserver
}

// Mock fetch to prevent actual network requests (especially to YouTube)
if (typeof window.fetch !== "function") {
  window.fetch = async () => {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
