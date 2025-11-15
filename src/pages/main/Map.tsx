import * as E from "fp-ts/Either"
import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import * as D from "io-ts/Decoder"
import mapboxgl, { LngLat } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { LineString } from "geojson"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { Map as MapboxMap } from "react-map-gl/mapbox"
import { useLocation } from "react-router-dom"
import { BehaviorSubject, Subject } from "rxjs"
import { H2, H3 } from "../../components/Typography"
import type { Category, Sound } from "../../domain/base"
import { showDateTime, showInterval } from "../../domain/base"
import { Icon } from "../../icon"
import type { GoTo } from "../../lib/map"
import { lazyUnsubscribe } from "../../lib/rxjs"
import { brandColors, colorToCssHex } from "../../theme/colors"
import { Hover } from "./Hover"
import {
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
} from "./Map.css"
import type { MapFogOverlayHandle } from "./MapFogOverlay"
import { MapFogOverlay } from "./MapFogOverlay"
import { Playlist } from "./Playlist"
import { SoundMarkersCanvas } from "./SoundMarkersCanvas"
import { UserPositionCanvas } from "./UserPositionCanvas"
import { ZOOM_MIN_LEVEL } from "./zoomScale"

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

const lngLatBounds = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(
    center.lng - LNG_BOUND_OFFSET,
    center.lat - LAT_BOUND_OFFSET,
  ),
  new mapboxgl.LngLat(
    center.lng + LNG_BOUND_OFFSET,
    center.lat + LAT_BOUND_OFFSET,
  ),
)

const initialViewState = {
  latitude: center.lat,
  longitude: center.lng,
  zoom: 13,
  bearing: 0,
  pitch: 0,
} as const
const MIN_ZOOM = ZOOM_MIN_LEVEL
const MAX_ZOOM = 18

const MAPBOX_MAP_STYLE = {
  width: "100%",
  height: "100%",
} as const

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

const CoordinatesTupleDecoder = D.tuple(D.number, D.number)
const LineStringGeometryDecoder = D.struct({
  type: D.literal("LineString"),
  coordinates: D.array(CoordinatesTupleDecoder),
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

const buildRouteSegments = (
  coordinates: LineString["coordinates"],
): RouteSegment[] => {
  const segments: RouteSegment[] = []
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [fromLng, fromLat] = coordinates[i] as unknown as readonly [
      number,
      number,
    ]
    const [toLng, toLat] = coordinates[i + 1] as unknown as readonly [
      number,
      number,
    ]
    const from = new LngLat(fromLng, fromLat)
    const to = new LngLat(toLng, toLat)
    segments.push({
      from,
      to,
      distance: from.distanceTo(to),
    })
  }
  return segments
}

/** @deprecated The old map sidebar/dialog is being retired in favor of a more minimal UI. */
const Sidebar = ({
  expand$,
  filters$,
  goTo$,
  play$,
  sounds,
  soundO,
}: {
  readonly expand$: BehaviorSubject<boolean>
  readonly filters$: BehaviorSubject<readonly Category[]>
  readonly goTo$: Subject<GoTo>
  readonly play$: Subject<string>
  readonly soundO: O.Option<Sound>
  readonly sounds: ReadonlyArray<Sound>
}) => {
  const [expand, setExpand] = useState<boolean>(expand$.value)
  useEffect(() => {
    const subscription = expand$.subscribe(setExpand)
    return () => subscription.unsubscribe()
  }, [expand$])

  const [filters, setFilters] = useState<readonly Category[]>(filters$.value)
  useEffect(() => {
    const subscription = filters$.subscribe(setFilters)
    return () => subscription.unsubscribe()
  }, [filters$])

  return (
    <aside className={sidebarStyle({ expanded: expand })}>
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
                filters$.next(newFilters as readonly Category[])
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
                filters$.next(newFilters as readonly Category[])
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
                filters$.next(newFilters as readonly Category[])
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
          onClick={() => setExpand(false)}
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
      <Playlist play$={play$} goTo$={goTo$} sounds={sounds} soundO={soundO} />
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
    return {
      lat: Number.isFinite(lat) ? lat : center.lat,
      lng: Number.isFinite(lng) ? lng : center.lng,
    }
  }, [location.search])

  const userPositionRef = useRef(initialUserPosition)

  const routeStateRef = useRef<RouteState | null>(null)
  const routeAnimationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number | null>(null)
  const directionsAbortControllerRef = useRef<AbortController | null>(null)

  const cancelRouteAnimation = useCallback(() => {
    if (routeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(routeAnimationFrameRef.current)
      routeAnimationFrameRef.current = null
    }
    lastFrameTimeRef.current = null
    routeStateRef.current = null
  }, [])

  const updateTrackedUserPosition = useCallback(
    (position: { lat: number; lng: number }) => {
      userPositionRef.current = position
      fogOverlayRef.current?.trackUserPosition(position)
    },
    [],
  )

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
          updateTrackedUserPosition({ lat, lng })
          distanceToTravel = 0
        } else {
          distanceToTravel -= remainingInSegment
          routeState.currentSegmentIndex += 1
          routeState.distanceAlongSegment = 0
          updateTrackedUserPosition({
            lat: segment.to.lat,
            lng: segment.to.lng,
          })
        }
      }

      if (routeState.currentSegmentIndex >= routeState.segments.length) {
        routeStateRef.current = null
        routeAnimationFrameRef.current = null
        lastFrameTimeRef.current = null
        return
      }

      routeAnimationFrameRef.current = requestAnimationFrame(animateRoute)
    },
    [updateTrackedUserPosition],
  )

  const startRouteAnimation = useCallback(
    (geometry: LineString) => {
      const segments = buildRouteSegments(geometry.coordinates)
      if (segments.length === 0) {
        const finalCoordinate =
          geometry.coordinates[geometry.coordinates.length - 1]
        if (finalCoordinate) {
          updateTrackedUserPosition({
            lat: finalCoordinate[1],
            lng: finalCoordinate[0],
          })
        }
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
    async (destination: mapboxgl.LngLat) => {
      const origin = userPositionRef.current
      if (
        !origin ||
        (Math.abs(origin.lat - destination.lat) < 1e-6 &&
          Math.abs(origin.lng - destination.lng) < 1e-6)
      ) {
        return
      }

      directionsAbortControllerRef.current?.abort()
      const controller = new AbortController()
      directionsAbortControllerRef.current = controller
      cancelRouteAnimation()

      try {
        const url = new URL(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
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
        const normalizedCoordinates = route.geometry.coordinates.map(
          ([lng, lat]) => [lng, lat] as [number, number],
        )
        const geometry: LineString = {
          type: "LineString",
          coordinates: normalizedCoordinates,
        }

        startRouteAnimation(geometry)
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
  }, [initialUserPosition, cancelRouteAnimation, updateTrackedUserPosition])

  useEffect(() => {
    return () => {
      cancelRouteAnimation()
      directionsAbortControllerRef.current?.abort()
    }
  }, [cancelRouteAnimation])

  const [goTo$] = useState(() => new Subject<GoTo>())
  useEffect(
    () =>
      pipe(
        goTo$,
        ($) =>
          $.subscribe(
            ({
              latitude,
              longitude,
              zoom,
              transitionDuration,
              transitionEasing,
            }) => {
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
          ),
        lazyUnsubscribe,
      ),
    [goTo$],
  )

  const [soundO, setSoundO] = useState(RA.head(sounds))

  const [hoverSoundO, setHoverSoundO] = useState<O.Option<Sound>>(() => O.none)
  const [hoverClose$] = useState(() => new Subject<void>())
  useEffect(() =>
    pipe(
      hoverClose$,
      ($) => $.subscribe(() => setHoverSoundO(O.none)),
      lazyUnsubscribe,
    ),
  )

  const [expand$] = useState(() => new BehaviorSubject<boolean>(false))

  // Auto-close playlist when navigating to a different page
  useEffect(() => {
    if (location.pathname !== "/main") {
      expand$.next(false)
    }
  }, [location.pathname, expand$])

  const [play$] = useState(() => new Subject<string>())
  useEffect(() => {
    const subscription = play$.subscribe((sound) => {
      pipe(
        sounds,
        RA.findFirst((x) => x.title === sound),
        setSoundO,
      )
    })
    return () => subscription.unsubscribe()
  }, [play$, sounds])

  const [filters$] = useState(
    () => new BehaviorSubject<readonly Category[]>(["Feel", "Listen", "See"]),
  )
  const [filters, setFilters] = useState<readonly Category[]>(filters$.value)
  useEffect(() => {
    const subscription = filters$.subscribe((fs) => {
      setFilters(fs)
    })
    return () => subscription.unsubscribe()
  }, [filters$])

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
        onSoundClick={(sound) => {
          setHoverSoundO(O.some(sound))
        }}
      />
      {pipe(
        hoverSoundO,
        O.fold(constNull, (sound) => (
          <Hover
            className={hoverFloating}
            close$={hoverClose$}
            play$={play$}
            sound={sound}
          />
        )),
      )}
      <UserPositionCanvas mapRef={mapRef} positionRef={userPositionRef} />
      <MapFogOverlay
        ref={fogOverlayRef}
        mapRef={mapRef}
        movementBounds={lngLatBounds}
        intensity={1.0}
        enabled
        sounds={sounds}
        filters={filters}
      />
      {import.meta.env.DEV && (
        <>
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
        </>
      )}
      <Sidebar
        expand$={expand$}
        goTo$={goTo$}
        filters$={filters$}
        play$={play$}
        sounds={sounds}
        soundO={soundO}
      />
    </MapboxMap>
  )
}
