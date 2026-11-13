import type { LngLatLike } from "mapbox-gl"
import { LngLat } from "mapbox-gl"

export interface RouteSegment {
  readonly from: LngLat
  readonly to: LngLat
  readonly distance: number
}

export interface RouteState {
  readonly segments: RouteSegment[]
  currentSegmentIndex: number
  distanceAlongSegment: number
}

export type StepRouteResult = {
  readonly index: number
  readonly distanceAlong: number
  readonly done: boolean
  readonly stepPositions: readonly {
    readonly lng: number
    readonly lat: number
  }[]
}

export const buildRouteSegments = (
  coordinates: readonly LngLat[],
): RouteSegment[] => {
  const [first, ...rest] = coordinates
  if (first === undefined || rest.length === 0) {
    return []
  }

  const segments: RouteSegment[] = []
  let previousPoint = first

  for (const nextPoint of rest) {
    const distance = previousPoint.distanceTo(nextPoint)

    if (distance > 0) {
      segments.push({
        from: previousPoint,
        to: nextPoint,
        distance,
      })
    }

    previousPoint = nextPoint
  }

  return segments
}

export const stepRouteAnimation = (
  segments: readonly RouteSegment[],
  currentIndex: number,
  distanceAlong: number,
  distanceToTravel: number,
): StepRouteResult => {
  let index = currentIndex
  let distanceAlongSegment = distanceAlong
  let remaining = distanceToTravel
  const stepPositions: { readonly lng: number; readonly lat: number }[] = []

  while (index < segments.length && remaining > 0) {
    const segment = segments[index]
    if (!segment) {
      break
    }

    if (segment.distance === 0) {
      index += 1
      distanceAlongSegment = 0
      continue
    }

    const remainingInSegment = segment.distance - distanceAlongSegment

    if (remaining < remainingInSegment) {
      distanceAlongSegment += remaining
      const t = distanceAlongSegment / segment.distance
      const lat = segment.from.lat + (segment.to.lat - segment.from.lat) * t
      const lng = segment.from.lng + (segment.to.lng - segment.from.lng) * t
      stepPositions.push({ lat, lng })
      remaining = 0
    } else {
      remaining -= remainingInSegment
      index += 1
      distanceAlongSegment = 0
      stepPositions.push({ lat: segment.to.lat, lng: segment.to.lng })
    }
  }

  return {
    index,
    distanceAlong: distanceAlongSegment,
    stepPositions,
    done: index >= segments.length,
  }
}

export const routeCloseEnough = (
  a: { readonly lat: number; readonly lng: number } | null,
  b: LngLatLike,
): boolean => {
  if (!a) return false
  const dest = LngLat.convert(b)
  return Math.abs(a.lat - dest.lat) < 1e-6 && Math.abs(a.lng - dest.lng) < 1e-6
}

export const buildDirectionsApiUrl = (
  origin: { readonly lng: number; readonly lat: number },
  destination: LngLat,
  accessToken: string,
): URL => {
  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
  )
  url.searchParams.set("alternatives", "false")
  url.searchParams.set("geometries", "geojson")
  url.searchParams.set("overview", "full")
  url.searchParams.set("steps", "false")
  url.searchParams.set("access_token", accessToken)
  return url
}
