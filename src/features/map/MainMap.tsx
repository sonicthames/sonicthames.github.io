import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import * as D from "io-ts/Decoder"
import type * as mapboxgl from "mapbox-gl"
import type { LngLatLike } from "mapbox-gl"
import { LngLat, LngLatBounds } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { MapProps, MapRef } from "react-map-gl/mapbox"
import { Map as MapboxMap } from "react-map-gl/mapbox"
import { matchPath, useLocation } from "react-router"
import type { Sound } from "@/domain/sound"
import { haversineDistanceMeters } from "@/lib/geo"
import { appRoute } from "@/pages/location"
import { mapColorTheme } from "@/theme/mapColors"
import {
  pauseSharedTicker,
  resumeSharedTicker,
  stepSharedTicker,
} from "./lib/pixiTicker"
import { ZOOM_MIN_LEVEL } from "./lib/zoomScale"
import {
  debugControls,
  logoPosition,
  restoreFogButton,
  revealFogButton,
} from "./MainMap.css"
import type { MapFogOverlayHandle } from "./overlays/Fog/MapFogOverlay"
import { MapFogOverlay } from "./overlays/Fog/MapFogOverlay"
import { SoundMarkersCanvas } from "./overlays/SoundMarkers/SoundMarkersCanvas"
import { UserPositionCanvas } from "./overlays/UserPosition/UserPositionCanvas"
import { usePersistenceStore } from "./persistence"
import type { RouteState } from "./route"
import {
  buildDirectionsApiUrl,
  buildRouteSegments,
  routeCloseEnough,
  stepRouteAnimation,
} from "./route"
import { ProximityVideo } from "./video/ProximityVideo"

const EnvDecoder = D.struct({
  VITE_MAPBOX_TOKEN: pipe(
    D.string,
    D.refine(
      (value): value is string => value.trim().length > 0,
      "Mapbox token",
    ),
  ),
})

const env = pipe(
  EnvDecoder.decode(import.meta.env),
  E.getOrElseW((errors) => {
    throw new Error(D.draw(errors))
  }),
)

const MAPBOX_TOKEN = env.VITE_MAPBOX_TOKEN

const LNG_BOUND_OFFSET = 0.325
const LAT_BOUND_OFFSET = 0.125
const center = new LngLat(-0.001, 51.501)

const lngLatBounds = new LngLatBounds(
  new LngLat(center.lng - LNG_BOUND_OFFSET, center.lat - LAT_BOUND_OFFSET),
  new LngLat(center.lng + LNG_BOUND_OFFSET, center.lat + LAT_BOUND_OFFSET),
)

const initialViewState: MapProps["initialViewState"] = {
  latitude: center.lat,
  longitude: center.lng,
  zoom: 13,
  bearing: 0,
  pitch: 0,
}
const MIN_ZOOM = ZOOM_MIN_LEVEL
const MAX_ZOOM = 18

const MAPBOX_MAP_STYLE = {
  width: "100%",
  height: "100%",
} as const

const readLastUserPosition = (): LngLat | null => {
  const stored = usePersistenceStore.getState().lastUserPosition
  if (!stored) {
    return null
  }
  return LngLat.convert([stored.lng, stored.lat])
}

const MAP_STYLE: mapboxgl.StyleSpecification = {
  version: 8,
  name: "Test",
  sources: {
    mapbox: {
      url: "mapbox://mapbox.mapbox-streets-v8",
      type: "vector",
      minzoom: 7,
      maxzoom: 12,
    },
  },
  sprite: "mapbox://sprites/mapbox/basic-v8",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": mapColorTheme.streetSurfaceColor,
      },
    },
    {
      id: "road",
      source: "mapbox",
      "source-layer": "road",
      type: "line",
      paint: {
        "line-color": mapColorTheme.streetLineColor,
      },
    },
    {
      id: "waterway",
      source: "mapbox",
      "source-layer": "water",
      type: "fill",
      paint: {
        "fill-color": mapColorTheme.riverColor,
      },
    },
  ],
}

const AVATAR_SPEED_MPS = 400
const PROXIMITY_THRESHOLD_METERS = 200

const LngLatDecoder: D.Decoder<unknown, LngLat> = pipe(
  D.tuple(D.number, D.number),
  D.parse(([lng, lat]) =>
    E.tryCatch(
      () => LngLat.convert([lng, lat]),
      () => D.error([lng, lat], "Invalid coordinate"),
    ),
  ),
)

interface RouteGeometry {
  readonly type: "LineString"
  readonly coordinates: readonly LngLat[]
}

const LineStringGeometryDecoder: D.Decoder<unknown, RouteGeometry> = D.struct({
  type: D.literal("LineString"),
  coordinates: D.array(LngLatDecoder),
})
const DirectionsRouteDecoder = D.struct({
  geometry: LineStringGeometryDecoder,
  distance: D.number,
  duration: D.number,
})
const DirectionsResponseDecoder = D.struct({
  code: D.string,
  routes: D.array(DirectionsRouteDecoder),
})

const fetchAndValidateDirections = async (
  url: string,
  signal: AbortSignal,
): Promise<{ readonly route: RouteGeometry } | null> => {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Directions request failed: ${response.status}`)
  }

  const raw = (await response.json()) as unknown
  const decoded = pipe(
    DirectionsResponseDecoder.decode(raw),
    E.getOrElseW((errors) => {
      throw new Error(D.draw(errors))
    }),
  )

  const [route] = decoded.routes
  if (decoded.code !== "Ok" || route === undefined) {
    console.warn("No walking route found for destination.", decoded.code)
    return null
  }

  return { route: route.geometry }
}

interface Props {
  readonly sounds: ReadonlyArray<Sound>
}

export const MainMap = ({ sounds }: Props) => {
  const location = useLocation()
  const isMainRoute = Boolean(
    matchPath({ path: appRoute("main").path, end: true }, location.pathname),
  )
  const mapRef = useRef<MapRef | null>(null)
  const projectSoundToViewport = useCallback(
    (sound: Sound): { readonly x: number; readonly y: number } | null => {
      const map = mapRef.current?.getMap()
      if (!map) {
        return null
      }
      const point = map.project([sound.coordinate.lng, sound.coordinate.lat])
      const rect = map.getContainer().getBoundingClientRect()
      return {
        x: rect.left + point.x,
        y: rect.top + point.y,
      }
    },
    [],
  )
  const [mapReady, setMapReady] = useState(false)
  useEffect(() => {
    if (isMainRoute) {
      resumeSharedTicker()
      return
    }
    pauseSharedTicker()
    const map = mapRef.current?.getMap()
    if (!mapReady || !map) {
      return
    }
    // Behind a page, the overlays follow the map only when it redraws.
    map.on("render", stepSharedTicker)
    return () => {
      map.off("render", stepSharedTicker)
    }
  }, [isMainRoute, mapReady])
  const fogOverlayRef = useRef<MapFogOverlayHandle | null>(null)

  // Parse user position from query params (?lat=51.5&lng=-0.1) or use map center
  const initialUserPosition = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const lat = Number.parseFloat(searchParams.get("lat") || "")
    const lng = Number.parseFloat(searchParams.get("lng") || "")
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return LngLat.convert([lng, lat])
    }
    const storedPosition = readLastUserPosition()
    if (storedPosition) {
      return storedPosition
    }
    return center
  }, [location.search])

  const userPositionRef = useRef(initialUserPosition)
  const [proximitySound, setProximitySound] = useState<Sound | null>(null)
  const [proximityOrigin, setProximityOrigin] = useState<{
    readonly x: number
    readonly y: number
  } | null>(null)

  const lastProximityCheckRef = useRef<LngLatLike | null>(null)
  const routeStateRef = useRef<RouteState | null>(null)
  const routeDestinationRef = useRef<LngLat | null>(null)
  const routeAnimationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number | null>(null)
  const directionsAbortControllerRef = useRef<AbortController | null>(null)
  const proximitySounds = useMemo(
    // Stable list keeps proximity checks predictable and avoids re-filtering per frame
    () => sounds.filter((sound) => sound.playOnProximity),
    [sounds],
  )

  const cancelRouteAnimation = useCallback(() => {
    if (routeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(routeAnimationFrameRef.current)
      routeAnimationFrameRef.current = null
    }
    lastFrameTimeRef.current = null
    routeStateRef.current = null
    routeDestinationRef.current = null
  }, [])

  const evaluateProximity = useCallback(
    (position: LngLatLike) => {
      const normalized = LngLat.convert(position)
      const lastChecked = lastProximityCheckRef.current
      if (
        lastChecked &&
        haversineDistanceMeters(lastChecked, normalized) < 15
      ) {
        return
      }
      lastProximityCheckRef.current = normalized

      let nearest: { sound: Sound; distance: number } | null = null

      for (const sound of proximitySounds) {
        const distance = haversineDistanceMeters(normalized, sound.coordinate)

        if (nearest === null || distance < nearest.distance) {
          nearest = { sound, distance }
        }
      }

      if (
        nearest &&
        Number.isFinite(nearest.distance) &&
        nearest.distance <= PROXIMITY_THRESHOLD_METERS
      ) {
        const origin = projectSoundToViewport(nearest.sound)
        if (!origin) {
          setProximitySound(null)
          setProximityOrigin(null)
          return
        }
        setProximityOrigin(origin)
        setProximitySound((prev) =>
          prev?.title === nearest.sound.title ? prev : nearest.sound,
        )
        return
      }

      setProximitySound(null)
      setProximityOrigin(null)
    },
    [proximitySounds, projectSoundToViewport],
  )

  const updateTrackedUserPosition = useCallback(
    (position: LngLatLike) => {
      const normalized = LngLat.convert(position)
      userPositionRef.current = normalized
      fogOverlayRef.current?.trackUserPosition(normalized)
      evaluateProximity(normalized)
      usePersistenceStore
        .getState()
        .setLastUserPosition({ lng: normalized.lng, lat: normalized.lat })
    },
    [evaluateProximity],
  )

  const animateRoute = useCallback(
    (startTimestamp: number) => {
      const step = (timestamp: number) => {
        const routeState = routeStateRef.current
        if (!routeState) {
          routeAnimationFrameRef.current = null
          lastFrameTimeRef.current = null
          return
        }

        const lastFrame =
          lastFrameTimeRef.current === null
            ? timestamp
            : lastFrameTimeRef.current
        const deltaSeconds = Math.max(0, (timestamp - lastFrame) / 1000)
        lastFrameTimeRef.current = timestamp

        const distanceToTravel = AVATAR_SPEED_MPS * deltaSeconds
        const { index, distanceAlong, stepPositions, done } =
          stepRouteAnimation(
            routeState.segments,
            routeState.currentSegmentIndex,
            routeState.distanceAlongSegment,
            distanceToTravel,
          )

        routeState.currentSegmentIndex = index
        routeState.distanceAlongSegment = distanceAlong

        for (const pos of stepPositions) {
          updateTrackedUserPosition(LngLat.convert([pos.lng, pos.lat]))
        }

        if (done) {
          routeStateRef.current = null
          routeDestinationRef.current = null
          routeAnimationFrameRef.current = null
          lastFrameTimeRef.current = null
          return
        }

        routeAnimationFrameRef.current = requestAnimationFrame(step)
      }
      step(startTimestamp)
    },
    [updateTrackedUserPosition],
  )

  const startRouteAnimation = useCallback(
    (geometry: RouteGeometry) => {
      const segments = buildRouteSegments(geometry.coordinates)
      const finalCoordinate = geometry.coordinates.at(-1)
      const destination = finalCoordinate
        ? LngLat.convert(finalCoordinate)
        : null

      // Store the destination for proximity evaluation
      if (destination) {
        routeDestinationRef.current = destination
      }

      if (segments.length === 0) {
        if (destination) {
          updateTrackedUserPosition(destination)
        }
        routeDestinationRef.current = null
        return
      }

      routeStateRef.current = {
        segments,
        currentSegmentIndex: 0,
        distanceAlongSegment: 0,
      }
      lastFrameTimeRef.current = null
      routeAnimationFrameRef.current = requestAnimationFrame(animateRoute)
    },
    [animateRoute, updateTrackedUserPosition],
  )

  const requestDirections = useCallback(
    async (destination: LngLatLike) => {
      const origin = userPositionRef.current
      if (routeCloseEnough(origin, destination)) {
        return
      }

      const normalizedDestination = LngLat.convert(destination)
      setProximitySound(null)
      setProximityOrigin(null)
      directionsAbortControllerRef.current?.abort()
      const controller = new AbortController()
      directionsAbortControllerRef.current = controller
      cancelRouteAnimation()

      try {
        const url = buildDirectionsApiUrl(
          { lng: origin.lng, lat: origin.lat },
          normalizedDestination,
          MAPBOX_TOKEN,
        )

        const result = await fetchAndValidateDirections(
          url.toString(),
          controller.signal,
        )

        if (result) {
          startRouteAnimation(result.route)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to fetch walking directions", error)
        }
      }
      if (directionsAbortControllerRef.current === controller) {
        directionsAbortControllerRef.current = null
      }
    },
    [cancelRouteAnimation, startRouteAnimation],
  )

  const handleMapClick = useCallback(
    (event: mapboxgl.MapMouseEvent) => {
      if (event.originalEvent.defaultPrevented) {
        return
      }
      void requestDirections(event.lngLat)
    },
    [requestDirections],
  )

  useEffect(() => {
    if (!mapReady) {
      return
    }
    cancelRouteAnimation()
    // oxlint-disable-next-line react/set-state-in-effect -- proximity state comes from the map's viewport projection
    updateTrackedUserPosition(initialUserPosition)
    mapRef.current?.flyTo({
      center: [initialUserPosition.lng, initialUserPosition.lat],
      zoom: 15,
      duration: 2000,
    })
  }, [
    mapReady,
    initialUserPosition,
    cancelRouteAnimation,
    updateTrackedUserPosition,
  ])

  useEffect(() => {
    return () => {
      cancelRouteAnimation()
      directionsAbortControllerRef.current?.abort()
    }
  }, [cancelRouteAnimation])

  const handleSoundClick = useCallback(
    (sound: Sound) => {
      void requestDirections([sound.coordinate.lng, sound.coordinate.lat])
    },
    [requestDirections],
  )

  const handleMapLoad = useCallback(() => {
    // The overlays draw in screen space and assume a flat, north-up map.
    const map = mapRef.current?.getMap()
    map?.touchZoomRotate.disableRotation()
    map?.keyboard.disableRotation()
    setMapReady(true)
  }, [])

  return (
    <MapboxMap
      ref={mapRef}
      initialViewState={initialViewState}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={lngLatBounds}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      maxPitch={0}
      onClick={handleMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={MAPBOX_MAP_STYLE}
      onLoad={handleMapLoad}
      mapStyle={MAP_STYLE}
    >
      <div className={logoPosition}>
        <img src="/logo-05.svg" alt="logo" />
      </div>
      <SoundMarkersCanvas
        mapRef={mapRef}
        sounds={sounds}
        playingSound={proximitySound}
        onSoundClick={handleSoundClick}
        mapReady={mapReady}
      />
      <UserPositionCanvas
        mapRef={mapRef}
        positionRef={userPositionRef}
        mapReady={mapReady}
      />
      <MapFogOverlay
        ref={fogOverlayRef}
        mapRef={mapRef}
        movementBounds={lngLatBounds}
        intensity={1.0}
        enabled
        sounds={sounds}
        animate={isMainRoute}
      />
      <ProximityVideo
        sound={proximitySound}
        origin={proximityOrigin}
        allowPlayback={isMainRoute}
      />
      {import.meta.env.DEV ? (
        <div className={debugControls}>
          <button
            type="button"
            onClick={() => {
              fogOverlayRef.current?.restoreFog()
              fogOverlayRef.current?.trackUserPosition(userPositionRef.current)
            }}
            className={restoreFogButton}
          >
            Restore Fog
          </button>
          <button
            type="button"
            onClick={() => fogOverlayRef.current?.revealMap()}
            className={revealFogButton}
          >
            Reveal Map
          </button>
        </div>
      ) : null}
    </MapboxMap>
  )
}
