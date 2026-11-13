import { LngLat } from "mapbox-gl"
import { describe, expect, it } from "vitest"
import {
  buildDirectionsApiUrl,
  buildRouteSegments,
  routeCloseEnough,
  stepRouteAnimation,
} from "./route"

const ll = (lng: number, lat: number) => LngLat.convert([lng, lat])

describe("stepRouteAnimation", () => {
  it("returns done immediately for empty segments", () => {
    const result = stepRouteAnimation([], 0, 0, 100)
    expect(result.done).toBe(true)
    expect(result.stepPositions).toHaveLength(0)
  })

  it("returns identical state when travel distance is zero", () => {
    const segs = [{ from: ll(0, 0), to: ll(1, 0), distance: 100 }]
    const result = stepRouteAnimation(segs, 0, 0, 0)
    expect(result.done).toBe(false)
    expect(result.index).toBe(0)
    expect(result.distanceAlong).toBe(0)
    expect(result.stepPositions).toHaveLength(0)
  })

  it("advances partially within a segment", () => {
    const segs = [{ from: ll(0, 0), to: ll(10, 0), distance: 100 }]
    // travel 30 of 100 -> t = 0.3, lng = 3
    const result = stepRouteAnimation(segs, 0, 0, 30)
    expect(result.done).toBe(false)
    expect(result.index).toBe(0)
    expect(result.distanceAlong).toBe(30)
    expect(result.stepPositions).toHaveLength(1)
    expect(result.stepPositions[0]?.lng).toBeCloseTo(3)
    expect(result.stepPositions[0]?.lat).toBeCloseTo(0)
  })

  it("reaches segment boundary when travel equals segment distance", () => {
    const segs = [{ from: ll(0, 0), to: ll(10, 0), distance: 100 }]
    const result = stepRouteAnimation(segs, 0, 0, 100)
    expect(result.done).toBe(true)
    expect(result.index).toBe(1)
    expect(result.stepPositions).toHaveLength(1)
    expect(result.stepPositions[0]?.lng).toBeCloseTo(10)
    expect(result.stepPositions[0]?.lat).toBeCloseTo(0)
  })

  it("skips zero-distance segments", () => {
    const zero = ll(0, 0)
    const segs = [
      { from: zero, to: zero, distance: 0 },
      { from: zero, to: ll(10, 0), distance: 100 },
    ]
    const result = stepRouteAnimation(segs, 0, 0, 30)
    expect(result.done).toBe(false)
    expect(result.index).toBe(1)
    expect(result.distanceAlong).toBe(30)
    expect(result.stepPositions).toHaveLength(1)
  })

  it("traverses multiple segments in one step", () => {
    const segs = [
      { from: ll(0, 0), to: ll(5, 0), distance: 50 },
      { from: ll(5, 0), to: ll(10, 0), distance: 50 },
    ]
    // travel 120 -> consumes seg 0 (50) + seg 1 (50)
    const result = stepRouteAnimation(segs, 0, 0, 120)
    expect(result.done).toBe(true)
    expect(result.index).toBe(2)
    expect(result.stepPositions).toHaveLength(2)
    expect(result.stepPositions[0]?.lng).toBeCloseTo(5)
    expect(result.stepPositions[1]?.lng).toBeCloseTo(10)
  })

  it("lands mid-segment after traversing earlier segments", () => {
    const segs = [
      { from: ll(0, 0), to: ll(5, 0), distance: 50 },
      { from: ll(5, 0), to: ll(15, 0), distance: 100 },
    ]
    // travel 80 -> consumes seg 0 (50), then 30 of seg 1 (t=0.3, lng=8)
    const result = stepRouteAnimation(segs, 0, 0, 80)
    expect(result.done).toBe(false)
    expect(result.index).toBe(1)
    expect(result.distanceAlong).toBe(30)
    expect(result.stepPositions).toHaveLength(2)
    expect(result.stepPositions[0]?.lng).toBeCloseTo(5)
    expect(result.stepPositions[1]?.lng).toBeCloseTo(8)
  })

  it("starts from mid-segment when given a non-zero distanceAlong", () => {
    const segs = [{ from: ll(0, 0), to: ll(10, 0), distance: 100 }]
    // start at 40 along, travel 30 -> should end at 70 along
    const result = stepRouteAnimation(segs, 0, 40, 30)
    expect(result.done).toBe(false)
    expect(result.index).toBe(0)
    expect(result.distanceAlong).toBe(70)
    expect(result.stepPositions).toHaveLength(1)
    expect(result.stepPositions[0]?.lng).toBeCloseTo(7)
  })

  it("handles start at index beyond segment list", () => {
    const segs = [{ from: ll(0, 0), to: ll(10, 0), distance: 100 }]
    const result = stepRouteAnimation(segs, 5, 0, 100)
    expect(result.done).toBe(true)
    expect(result.stepPositions).toHaveLength(0)
  })
})

describe("buildRouteSegments", () => {
  it("returns empty array for fewer than 2 coordinates", () => {
    expect(buildRouteSegments([])).toHaveLength(0)
    expect(buildRouteSegments([ll(0, 0)])).toHaveLength(0)
  })

  it("creates a single segment for two distinct points", () => {
    const segs = buildRouteSegments([ll(0, 0), ll(10, 0)])
    expect(segs).toHaveLength(1)
    expect(segs[0]?.from.lng).toBe(0)
    expect(segs[0]?.to.lng).toBe(10)
    expect(segs[0]?.distance).toBeGreaterThan(0)
  })

  it("filters out zero-distance segments", () => {
    const segs = buildRouteSegments([ll(0, 0), ll(0, 0), ll(10, 0)])
    expect(segs).toHaveLength(1)
  })

  it("builds segments for multiple points", () => {
    const segs = buildRouteSegments([ll(0, 0), ll(5, 0), ll(10, 0)])
    expect(segs).toHaveLength(2)
    expect(segs[0]?.from.lng).toBe(0)
    expect(segs[0]?.to.lng).toBe(5)
    expect(segs[1]?.from.lng).toBe(5)
    expect(segs[1]?.to.lng).toBe(10)
  })
})

describe("routeCloseEnough", () => {
  it("returns false for null origin", () => {
    expect(routeCloseEnough(null, ll(0, 0))).toBe(false)
  })

  it("returns true for identical positions", () => {
    expect(routeCloseEnough({ lat: 51.5, lng: -0.1 }, ll(-0.1, 51.5))).toBe(
      true,
    )
  })

  it("returns true for positions within epsilon", () => {
    expect(
      routeCloseEnough({ lat: 51.5, lng: -0.1 }, ll(-0.1 + 1e-7, 51.5 + 1e-7)),
    ).toBe(true)
  })

  it("returns false for distant positions", () => {
    expect(routeCloseEnough({ lat: 51.5, lng: -0.1 }, ll(0, 0))).toBe(false)
  })
})

describe("buildDirectionsApiUrl", () => {
  it("constructs a valid directions API URL", () => {
    const url = buildDirectionsApiUrl(
      { lng: -0.1, lat: 51.5 },
      ll(0, 51.6),
      "my-token",
    )
    expect(url.protocol).toBe("https:")
    expect(url.hostname).toBe("api.mapbox.com")
    expect(url.pathname).toContain("walking")
    expect(url.pathname).toContain("-0.1,51.5")
    expect(url.pathname).toContain("0,51.6")
    expect(url.searchParams.get("geometries")).toBe("geojson")
    expect(url.searchParams.get("access_token")).toBe("my-token")
  })
})
