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
}

vi.mock("mapbox-gl", () => {
  return {
    __esModule: true,
    default: {
      LngLat: MockLngLat,
      LngLatBounds: MockLngLatBounds,
      accessToken: "",
    },
    LngLat: MockLngLat,
    LngLatBounds: MockLngLatBounds,
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
