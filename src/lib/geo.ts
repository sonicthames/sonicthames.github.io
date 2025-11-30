import type { LngLatLike } from "mapbox-gl"
import { LngLat } from "mapbox-gl"

const toRadians = (value: number) => (value * Math.PI) / 180

export const haversineDistanceMeters = (
  from: LngLatLike,
  to: LngLatLike,
): number => {
  const fromPoint = LngLat.convert(from)
  const toPoint = LngLat.convert(to)
  const R = 6371000 // Earth radius in meters
  const dLat = toRadians(toPoint.lat - fromPoint.lat)
  const dLon = toRadians(toPoint.lng - fromPoint.lng)
  const lat1 = toRadians(fromPoint.lat)
  const lat2 = toRadians(toPoint.lat)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
