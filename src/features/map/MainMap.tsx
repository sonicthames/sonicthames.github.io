import * as E from "fp-ts/Either"
import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import * as D from "io-ts/Decoder"
import type mapboxgl from "mapbox-gl"
import type { LngLatLike } from "mapbox-gl"
import { LngLat, LngLatBounds } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { MapProps, MapRef } from "react-map-gl/mapbox"
import { Map as MapboxMap } from "react-map-gl/mapbox"
import { useLocation } from "react-router-dom"
import { H2, H3 } from "@/components/Typography"
import type { Category, Sound } from "@/domain/sound"
import { showDateTime, showInterval } from "@/domain/sound"
import { Icon } from "@/icon"
import { haversineDistanceMeters } from "@/lib/geo"
import type { GoTo } from "@/lib/map"
import { brandColors, colorToCssHex } from "@/theme/colors"
import { Hover } from "./components/Hover/Hover"
import { Playlist } from "./components/Playlist/Playlist"
import { ZOOM_MIN_LEVEL } from "./lib/zoomScale"
import {
  debugControls,
  filterButton,
  filtersGroup,
  hoverFloating,
  logoPosition,
  restoreFogButton,
  revealFogButton,
  selectedSound,
  closeButton as sidebarCloseButton,
  sidebarHeader,
  sidebar as sidebarStyle,
  srOnly,
  videoFrame,
  youtubeLink,
} from "./MainMap.css"
import type { MapFogOverlayHandle } from "./overlays/Fog/MapFogOverlay"
import { MapFogOverlay } from "./overlays/Fog/MapFogOverlay"
import { SoundMarkersCanvas } from "./overlays/SoundMarkers/SoundMarkersCanvas"
import type { UserPositionHandle } from "./overlays/UserPosition/UserPositionCanvas"
import { UserPositionCanvas } from "./overlays/UserPosition/UserPositionCanvas"
import { usePersistenceStore } from "./persistence"
import { useMapStore } from "./store"
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

const MAP_STYLE: mapboxgl.Style = {
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
        "background-color": colorToCssHex(brandColors.map.land),
      },
    },
    {
      id: "road",
      source: "mapbox",
      "source-layer": "road",
      type: "line",
      paint: {
        "line-color": brandColors.neutral.black,
      },
    },
    {
      id: "waterway",
      source: "mapbox",
      "source-layer": "water",
      type: "fill",
      paint: {
        "fill-color": colorToCssHex(brandColors.map.water),
      },
    },
  ],
}

const headerIconSize = "2rem"
const AVATAR_SPEED_MPS = 400
const PROXIMITY_THRESHOLD_METERS = 120

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

interface RouteSegment {
  readonly from: LngLat
  readonly to: LngLat
  readonly distance: number
}

interface RouteState {
  readonly segments: RouteSegment[]
  currentSegmentIndex: number
  distanceAlongSegment: number
}

const buildRouteSegments = (coordinates: readonly LngLat[]): RouteSegment[] => {
  if (coordinates.length < 2) {
    return []
  }

  const segments: RouteSegment[] = []
  let previousPoint = coordinates[0]

  for (let i = 1; i < coordinates.length; i++) {
    const nextPoint = coordinates[i]
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

/** @deprecated The old map sidebar/dialog is being retired in favor of a more minimal UI. */
const Sidebar = ({
  onGoTo,
  onPlay,
  sounds,
  soundO,
}: {
  readonly onGoTo: (goTo: GoTo) => void
  readonly onPlay: (soundTitle: string) => void
  readonly soundO: O.Option<Sound>
  readonly sounds: ReadonlyArray<Sound>
}) => {
  const expanded = useMapStore((s) => s.expanded)
  const setExpanded = useMapStore((s) => s.setExpanded)
  const filters = useMapStore((s) => s.filters)
  const setFilters = useMapStore((s) => s.setFilters)

  return (
    <aside className={sidebarStyle({ expanded })}>
      <header className={sidebarHeader}>
        <H2>Sonic Thames</H2>
        <div>
          <fieldset className={filtersGroup}>
            <legend className={srOnly}>Filters</legend>
            <button
              type="button"
              onClick={() => {
                const newFilters = filters.includes("Listen")
                  ? filters.filter((f) => f !== "Listen")
                  : [...filters, "Listen"]
                setFilters(newFilters as readonly Category[])
              }}
              title="toggle listen"
              className={
                filters.includes("Listen")
                  ? filterButton.active
                  : filterButton.inactive
              }
            >
              <Icon
                name="Listen"
                width={headerIconSize}
                height={headerIconSize}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                const newFilters = filters.includes("See")
                  ? filters.filter((f) => f !== "See")
                  : [...filters, "See"]
                setFilters(newFilters as readonly Category[])
              }}
              title="toggle see"
              className={
                filters.includes("See")
                  ? filterButton.active
                  : filterButton.inactive
              }
            >
              <Icon name="See" width={headerIconSize} height={headerIconSize} />
            </button>
            <button
              type="button"
              onClick={() => {
                const newFilters = filters.includes("Feel")
                  ? filters.filter((f) => f !== "Feel")
                  : [...filters, "Feel"]
                setFilters(newFilters as readonly Category[])
              }}
              title="toggle feel"
              className={
                filters.includes("Feel")
                  ? filterButton.active
                  : filterButton.inactive
              }
            >
              <Icon
                name="Feel"
                width={headerIconSize}
                height={headerIconSize}
              />
            </button>
          </fieldset>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          title="close"
          className={sidebarCloseButton}
        >
          <Icon name="Close" width="1.5rem" height="1.5rem" />
        </button>
      </header>
      {pipe(
        soundO,
        O.fold(constNull, (sound) => (
          <div className={selectedSound}>
            <iframe
              title={sound.title}
              width="320"
              height="240"
              className={videoFrame}
              src={`https://www.youtube.com/embed/${sound.videoSrc}?rel=0`}
            />
            <div>
              <H3>{sound.title}</H3>
              <div>
                <a
                  className={youtubeLink}
                  href={`https://www.youtube.com/v/${sound.videoSrc}`}
                >
                  view on youtube
                </a>
              </div>
            </div>
            <div>
              {pipe(
                sound.description,
                RA.map((x) => <div key={x}>{x}</div>),
              )}
            </div>
            {"interval" in sound
              ? pipe(
                  sound.interval,
                  O.fold(constNull, (x) => (
                    <div>
                      <strong>Interval: </strong>
                      <span>{showInterval(x)}</span>
                    </div>
                  )),
                )
              : pipe(
                  sound.dateTime,
                  O.fold(constNull, (x) => (
                    <div>
                      <strong>Recorded date: </strong>
                      <span>{showDateTime(x)}</span>
                    </div>
                  )),
                )}
            {pipe(
              sound.location,
              O.fold(constNull, (location) => (
                <div>
                  <strong>Place: </strong>
                  <span>{location}</span>
                </div>
              )),
            )}
          </div>
        )),
      )}
      <hr />
      <Playlist
        onPlay={onPlay}
        onGoTo={onGoTo}
        sounds={sounds}
        soundO={soundO}
      />
    </aside>
  )
}

interface Props {
  readonly sounds: ReadonlyArray<Sound>
}

export const MainMap = ({ sounds }: Props) => {
  const location = useLocation()
  const mapRef = useRef<MapRef | null>(null)
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
  const userPositionHandleRef = useRef<UserPositionHandle | null>(null)
  const [proximitySound, setProximitySound] = useState<Sound | null>(null)

  const routeStateRef = useRef<RouteState | null>(null)
  const routeDestinationRef = useRef<LngLat | null>(null)
  const routeAnimationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number | null>(null)
  const directionsAbortControllerRef = useRef<AbortController | null>(null)
  const lastPersistedUserPositionRef = useRef<LngLat | null>(null)
  const lastPersistTimeRef = useRef<number>(0)
  const lastProximityCheckRef = useRef<LngLatLike | null>(null)
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
    userPositionHandleRef.current?.fadeIn()
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

      // If we're currently traveling on a route, don't open videos until we reach the destination
      const isMoving = routeStateRef.current !== null
      const destination = routeDestinationRef.current

      if (isMoving && destination) {
        // Check if we've reached the destination (within 10 meters)
        const distanceToDestination = haversineDistanceMeters(
          normalized,
          destination,
        )
        const hasReachedDestination = distanceToDestination < 10

        // Only evaluate proximity when we've reached the destination
        if (!hasReachedDestination) {
          return
        }
      }

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
        setProximitySound((prev) =>
          prev?.title === nearest?.sound.title ? prev : nearest.sound,
        )
        return
      }

      setProximitySound(null)
    },
    [proximitySounds],
  )

  const updateTrackedUserPosition = useCallback(
    (position: LngLatLike) => {
      const normalized = LngLat.convert(position)
      userPositionRef.current = normalized
      fogOverlayRef.current?.trackUserPosition(normalized)
      evaluateProximity(normalized)
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now()
      const lastPersisted = lastPersistedUserPositionRef.current
      const sinceLastPersist = now - lastPersistTimeRef.current
      const movedSincePersist = lastPersisted
        ? haversineDistanceMeters(lastPersisted, normalized)
        : Infinity

      if (!lastPersisted || sinceLastPersist > 500 || movedSincePersist > 5) {
        usePersistenceStore
          .getState()
          .setLastUserPosition(LngLat.convert(normalized))
        lastPersistedUserPositionRef.current = normalized
        lastPersistTimeRef.current = now
      }
    },
    [evaluateProximity],
  )

  useEffect(() => {
    evaluateProximity(userPositionRef.current)
  }, [evaluateProximity])

  const animateRoute = useCallback(
    (timestamp: number) => {
      const routeState = routeStateRef.current
      if (!routeState) {
        routeAnimationFrameRef.current = null
        lastFrameTimeRef.current = null
        return
      }

      const lastFrame =
        lastFrameTimeRef.current === null ? timestamp : lastFrameTimeRef.current
      const deltaSeconds = Math.max(0, (timestamp - lastFrame) / 1000)
      lastFrameTimeRef.current = timestamp

      let distanceToTravel = AVATAR_SPEED_MPS * deltaSeconds

      while (
        routeState.currentSegmentIndex < routeState.segments.length &&
        distanceToTravel > 0
      ) {
        const segment = routeState.segments[routeState.currentSegmentIndex]
        if (!segment) {
          break
        }

        if (segment.distance === 0) {
          routeState.currentSegmentIndex += 1
          routeState.distanceAlongSegment = 0
          continue
        }

        const remainingInSegment =
          segment.distance - routeState.distanceAlongSegment

        if (distanceToTravel < remainingInSegment) {
          routeState.distanceAlongSegment += distanceToTravel
          const t = routeState.distanceAlongSegment / segment.distance
          const lat = segment.from.lat + (segment.to.lat - segment.from.lat) * t
          const lng = segment.from.lng + (segment.to.lng - segment.from.lng) * t
          updateTrackedUserPosition(LngLat.convert([lng, lat]))
          distanceToTravel = 0
        } else {
          distanceToTravel -= remainingInSegment
          routeState.currentSegmentIndex += 1
          routeState.distanceAlongSegment = 0
          updateTrackedUserPosition(segment.to)
        }
      }

      if (routeState.currentSegmentIndex >= routeState.segments.length) {
        routeStateRef.current = null
        routeDestinationRef.current = null
        routeAnimationFrameRef.current = null
        lastFrameTimeRef.current = null
        userPositionHandleRef.current?.fadeIn()
        return
      }

      routeAnimationFrameRef.current = requestAnimationFrame(animateRoute)
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
        userPositionHandleRef.current?.fadeIn()
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
      const normalizedDestination = LngLat.convert(destination)
      if (
        !origin ||
        (Math.abs(origin.lat - normalizedDestination.lat) < 1e-6 &&
          Math.abs(origin.lng - normalizedDestination.lng) < 1e-6)
      ) {
        return
      }

      directionsAbortControllerRef.current?.abort()
      const controller = new AbortController()
      directionsAbortControllerRef.current = controller
      cancelRouteAnimation()

      try {
        const url = new URL(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${normalizedDestination.lng},${normalizedDestination.lat}`,
        )
        url.searchParams.set("alternatives", "false")
        url.searchParams.set("geometries", "geojson")
        url.searchParams.set("overview", "full")
        url.searchParams.set("steps", "false")
        url.searchParams.set("access_token", MAPBOX_TOKEN)

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        })

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

        if (decoded.code !== "Ok" || decoded.routes.length === 0) {
          console.warn("No walking route found for destination.", decoded.code)
          return
        }

        const [route] = decoded.routes
        startRouteAnimation(route.geometry)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
        console.error("Failed to fetch walking directions", error)
      } finally {
        if (directionsAbortControllerRef.current === controller) {
          directionsAbortControllerRef.current = null
        }
      }
    },
    [cancelRouteAnimation, startRouteAnimation],
  )

  const handleMapClick = useCallback(
    (event: mapboxgl.MapLayerMouseEvent) => {
      if (event.originalEvent.defaultPrevented) {
        return
      }
      void requestDirections(event.lngLat)
    },
    [requestDirections],
  )

  useEffect(() => {
    updateTrackedUserPosition(initialUserPosition)
    cancelRouteAnimation()

    // Smoothly fly to the initial user position once map is loaded
    const map = mapRef.current
    if (!map) return

    const handleLoad = () => {
      map.flyTo({
        center: [initialUserPosition.lng, initialUserPosition.lat],
        zoom: 15,
        duration: 2000,
        essential: true,
      })
    }

    const mapInstance = map.getMap()
    if (mapInstance.isStyleLoaded()) {
      handleLoad()
    } else {
      mapInstance.once("load", handleLoad)
    }
  }, [initialUserPosition, cancelRouteAnimation, updateTrackedUserPosition])

  useEffect(() => {
    return () => {
      cancelRouteAnimation()
      directionsAbortControllerRef.current?.abort()
    }
  }, [cancelRouteAnimation])

  const handleGoTo = useCallback(
    ({
      latitude,
      longitude,
      zoom,
      transitionDuration,
      transitionEasing,
    }: GoTo) => {
      const map = mapRef.current
      if (!map) {
        return
      }

      map.flyTo({
        center: [longitude, latitude],
        zoom,
        duration: transitionDuration,
        easing: transitionEasing,
      })
    },
    [],
  )

  const [soundO, setSoundO] = useState(RA.head(sounds))

  const [hoverSoundO, setHoverSoundO] = useState<O.Option<Sound>>(() => O.none)

  const handleHoverClose = useCallback(() => {
    setHoverSoundO(O.none)
  }, [])

  const setExpanded = useMapStore((s) => s.setExpanded)

  // Auto-close playlist when navigating to a different page
  useEffect(() => {
    if (location.pathname !== "/main") {
      setExpanded(false)
    }
  }, [location.pathname, setExpanded])

  const handlePlay = useCallback(
    (title: string) => {
      pipe(
        sounds,
        RA.findFirst((x) => x.title === title),
        setSoundO,
      )
    },
    [sounds],
  )

  const filters = useMapStore((s) => s.filters)

  // Stable callback prevents SoundMarkersCanvas from reinitializing Pixi on every render
  const handleSoundClick = useCallback(
    (s: Sound) => setHoverSoundO(O.some(s)),
    [],
  )

  return (
    <MapboxMap
      ref={mapRef}
      initialViewState={initialViewState}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={lngLatBounds}
      onClick={handleMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={MAPBOX_MAP_STYLE}
      mapStyle={MAP_STYLE}
    >
      <div className={logoPosition}>
        <img src="/logo-05.svg" alt="logo" />
      </div>
      <SoundMarkersCanvas
        mapRef={mapRef}
        sounds={sounds}
        filters={filters}
        playingSound={O.toNullable(soundO)}
        onSoundClick={handleSoundClick}
      />
      {pipe(
        hoverSoundO,
        O.fold(constNull, (sound) => (
          <Hover
            className={hoverFloating}
            onClose={handleHoverClose}
            onPlay={handlePlay}
            sound={sound}
          />
        )),
      )}
      <UserPositionCanvas
        ref={userPositionHandleRef}
        mapRef={mapRef}
        positionRef={userPositionRef}
      />
      <MapFogOverlay
        ref={fogOverlayRef}
        mapRef={mapRef}
        movementBounds={lngLatBounds}
        intensity={1.0}
        enabled
        sounds={sounds}
        filters={filters}
      />
      <ProximityVideo sound={proximitySound} mapRef={mapRef} />
      {import.meta.env.DEV && (
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
      )}
      <Sidebar
        onGoTo={handleGoTo}
        onPlay={handlePlay}
        sounds={sounds}
        soundO={soundO}
      />
    </MapboxMap>
  )
}
