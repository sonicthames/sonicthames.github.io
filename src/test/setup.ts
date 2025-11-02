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
