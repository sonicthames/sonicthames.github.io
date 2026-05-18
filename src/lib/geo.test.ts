import type { LngLatLike } from "mapbox-gl"
import { describe, expect, it } from "vitest"
import { haversineDistanceMeters } from "./geo"

describe("Geo Utilities", () => {
  describe("haversineDistanceMeters", () => {
    it("should calculate distance between two points", () => {
      // Test case: Greenwich Observatory to London Eye (approximately 4.1 km)
      const greenwich: LngLatLike = { lng: 0.0, lat: 51.4779 }
      const londonEye: LngLatLike = { lng: -0.1191, lat: 51.5034 }

      const distance = haversineDistanceMeters(greenwich, londonEye)

      // Should be approximately 8720 meters (based on actual calculation)
      expect(distance).toBeGreaterThan(8700)
      expect(distance).toBeLessThan(8750)
    })

    it("should return zero for same point", () => {
      const point: LngLatLike = { lng: 0.0, lat: 51.5 }
      const distance = haversineDistanceMeters(point, point)
      expect(distance).toBe(0)
    })

    it("should handle negative coordinates", () => {
      const point1: LngLatLike = { lng: -0.1, lat: 51.5 }
      const point2: LngLatLike = { lng: -0.2, lat: 51.6 }

      const distance = haversineDistanceMeters(point1, point2)
      expect(distance).toBeGreaterThan(0)
    })

    it("should be symmetric", () => {
      const point1: LngLatLike = { lng: 0.0, lat: 51.5 }
      const point2: LngLatLike = { lng: -0.1, lat: 51.6 }

      const distance1 = haversineDistanceMeters(point1, point2)
      const distance2 = haversineDistanceMeters(point2, point1)

      expect(distance1).toBe(distance2)
    })

    it("should handle antipodal points", () => {
      const point1: LngLatLike = { lng: 0.0, lat: 0.0 }
      const point2: LngLatLike = { lng: 180.0, lat: 0.0 }

      const distance = haversineDistanceMeters(point1, point2)
      // Should be approximately half the Earth's circumference
      expect(distance).toBeGreaterThan(20000000) // 20,000 km
      expect(distance).toBeLessThan(21000000) // 21,000 km
    })
  })
})
