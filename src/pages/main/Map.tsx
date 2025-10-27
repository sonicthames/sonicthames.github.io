import * as E from "fp-ts/Either"
import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import * as D from "io-ts/Decoder"
import mapboxgl, { LngLat } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef, useState } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { Map as MapboxMap, Marker } from "react-map-gl/mapbox"
import { BehaviorSubject, Subject } from "rxjs"
import { H2, H3 } from "../../components/Typography"
import type { Category, Sound } from "../../domain/base"
import { showDateTime, showInterval } from "../../domain/base"
import { Icon } from "../../icon"
import type { GoTo } from "../../lib/map"
import { lazyUnsubscribe } from "../../lib/rxjs"
import { foldSumType } from "../../lib/typescript/foldSumType"
import { soundId } from "../../pages/location"
import { brandColors, colorToCssHex } from "../../theme/colors"
import { Hover } from "./Hover"
import { Playlist } from "./Playlist"

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

const LNG_BOUND_OFFSET = 0.13
const LAT_BOUND_OFFSET = 0.08
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
  zoom: 11,
  bearing: 0,
  pitch: 0,
} as const
const MIN_ZOOM = 10
const MAX_ZOOM = 16

const markerIconSize = "1.25rem"
const headerIconSize = "2rem"

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
    <aside
      className={`fixed top-0 bottom-0 left-0 z-[2000] w-[500px] bg-primary-light p-4 overflow-auto cursor-default pointer-events-auto transition-transform duration-150 ease-in-out shadow-[2px_0_24px_rgba(0,0,0,0.2)] ${
        expand ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ backgroundColor: "rgba(250, 242, 244, 0.96)" }}
    >
      <header className="flex items-center justify-between mb-4">
        <H2>Sonic Thames</H2>
        <div className="flex gap-4">
          <fieldset className="flex gap-1 border-none p-0 m-0">
            <legend className="sr-only">Filters</legend>
            <button
              type="button"
              onClick={() => {
                const newFilters = filters.includes("Listen")
                  ? filters.filter((f) => f !== "Listen")
                  : [...filters, "Listen"]
                filters$.next(newFilters as readonly Category[])
              }}
              title="toggle listen"
              className={`p-2 border-none rounded cursor-pointer transition-colors ${
                filters.includes("Listen")
                  ? "bg-action text-white"
                  : "bg-transparent text-primary hover:bg-primary/10"
              }`}
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
              className={`p-2 border-none rounded cursor-pointer transition-colors ${
                filters.includes("See")
                  ? "bg-action text-white"
                  : "bg-transparent text-primary hover:bg-primary/10"
              }`}
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
              className={`p-2 border-none rounded cursor-pointer transition-colors ${
                filters.includes("Feel")
                  ? "bg-action text-white"
                  : "bg-transparent text-primary hover:bg-primary/10"
              }`}
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
          className="p-2 border-none rounded cursor-pointer bg-transparent hover:bg-primary/10 transition-colors"
        >
          <Icon name="Close" width="1.5rem" height="1.5rem" />
        </button>
      </header>
      {pipe(
        soundO,
        O.fold(constNull, (sound) => (
          <div className="[&>*]:mb-4">
            <iframe
              title={sound.title}
              width="320"
              height="240"
              className="w-full border-none box-border"
              src={`https://www.youtube.com/embed/${sound.videoSrc}?rel=0`}
            />
            <div className="flex items-center justify-between">
              <H3>{sound.title}</H3>
              <div>
                <a
                  className="no-underline border border-[#21283B] px-3 py-1 rounded-md text-[#21283B] hover:bg-primary/5 transition-colors"
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
  const mapRef = useRef<MapRef | null>(null)
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

  const [expand$] = useState(
    () => new BehaviorSubject<boolean>(O.isSome(soundO)),
  )

  const [play$] = useState(() => new Subject<string>())
  useEffect(() => {
    const subscription = play$.subscribe((sound) => {
      pipe(
        sounds,
        RA.findFirst((x) => x.title === sound),
        setSoundO,
      )
      expand$.next(true)
    })
    return () => subscription.unsubscribe()
  }, [expand$, play$, sounds])

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
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: "100%", height: "100%" }}
      mapStyle={{
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
            //   features: {
            //   simplification: 6,
            // },
            paint: {
              "fill-color": colorToCssHex(brandColors.map.water),
            },
            // maxzoom: 8,
          },
        ],
      }}
    >
      <div className="absolute right-[50px] top-[50px]">
        {/* <NavigationControl onViewportChange={this.updateViewport} /> */}
      </div>
      <div className="absolute pointer-events-none bottom-[-85px] right-[-40px] w-80 opacity-100">
        <img src="/logo-05.svg" alt="logo" />
      </div>
      {pipe(
        sounds,
        RA.mapWithIndex((_k, s) => {
          const sId = soundId(s)
          return (
            filters.includes(s.category) && (
              <Marker
                key={sId}
                latitude={s.coordinates.lat}
                longitude={s.coordinates.lng}
                className="flex flex-col items-center justify-center cursor-pointer [&_svg]:cursor-pointer hover:z-[1000]"
              >
                <button
                  type="button"
                  className="flex flex-col items-center bg-transparent border-none p-0 cursor-pointer -translate-x-1/2 -translate-y-full"
                  onClick={() => {
                    setHoverSoundO(O.some(s))
                    // TODO: trigger navigation to `/sound/${sId}`
                  }}
                >
                  {/* <img
              alt={`${s.title} thumbnail`}
              width={30}
              height={30}
            /> */}
                  {/* <div className={styles.markerNote}>{s.marker}</div> */}
                  {foldSumType({
                    renderListen: () => (
                      <div
                        className="flex items-center rounded-full p-1 border border-white"
                        style={{ backgroundColor: brandColors.icons.listen }}
                      >
                        <Icon
                          name="Listen"
                          className="text-white"
                          width={markerIconSize}
                          height={markerIconSize}
                        />
                      </div>
                    ),
                    renderSee: () => (
                      <div
                        className="flex items-center rounded-full p-1 border border-white"
                        style={{ backgroundColor: brandColors.icons.see }}
                      >
                        <Icon
                          name="See"
                          className="text-white"
                          width={markerIconSize}
                          height={markerIconSize}
                        />
                      </div>
                    ),
                    renderFeel: () => (
                      <div
                        className="flex items-center rounded-full p-1 border border-white"
                        style={{ backgroundColor: brandColors.icons.feel }}
                      >
                        <Icon
                          name="Feel"
                          className="text-white"
                          width={markerIconSize}
                          height={markerIconSize}
                        />
                      </div>
                    ),
                  })(`render${s.category}`)}
                </button>
              </Marker>
            )
          )
        }),
      )}
      {pipe(
        hoverSoundO,
        O.fold(constNull, (sound) => (
          <Hover
            className="bg-primary-light fixed z-[2000] bottom-[60px] right-[25px] w-[300px]"
            close$={hoverClose$}
            play$={play$}
            sound={sound}
          />
        )),
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
