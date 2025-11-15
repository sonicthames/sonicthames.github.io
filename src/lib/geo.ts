export interface GeographicCoordinate {
  readonly lat: number
  readonly lng: number
}

const toRadians = (value: number) => (value * Math.PI) / 180

export const haversineDistanceMeters = (
  from: GeographicCoordinate,
  to: GeographicCoordinate,
): number => {
  const R = 6371000 // Earth radius in meters
  const dLat = toRadians(to.lat - from.lat)
  const dLon = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
