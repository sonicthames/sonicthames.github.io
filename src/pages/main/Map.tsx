import { css, cx } from "@emotion/css";
import { IconButton } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import type { History } from "history";
import { LngLat } from "mapbox-gl";
import { useEffect, useState } from "react";
import ReactMapGL, {
  Marker,
  WebMercatorViewport,
  _useMapControl,
} from "react-map-gl";
import { BehaviorSubject, Subject } from "rxjs";
import { H2, H3 } from "../../components/Typography";
import { Category, showDateTime, showInterval, Sound } from "../../domain/base";
import { Icon } from "../../icon";
import { GoTo } from "../../lib/map";
import { lazyUnsubscribe, subjectHandle } from "../../lib/rxjs";
import { foldSumType } from "../../lib/typescript/foldSumType";
import { soundId } from "../../pages/location";
import { brandColors, colorToCssHex } from "../../theme/colors";
import { fontSize } from "../../theme/fontSize";
import { controlIconSize, spacingEm, spacingRem } from "../../theme/spacing";
import { Hover } from "./Hover";
import { Playlist } from "./Playlist";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN ?? "";

const center = new LngLat(-0.001, 51.501);
const swBound = {
  latitude: center.lat - 0.08,
  longitude: center.lng - 0.13,
} as const;
const neBound = {
  latitude: center.lat + 0.08,
  longitude: center.lng + 0.13,
} as const;
const bounds: readonly [readonly [number, number], readonly [number, number]] =
  [
    [swBound.longitude, swBound.latitude],
    [neBound.longitude, neBound.latitude],
    // [swBound.latitude, swBound.longitude],
    // [neBound.latitude, neBound.longitude],
  ];

const initialViewport = {
  height: "100vh",
  latitude: center.lat,
  longitude: center.lng,
  width: 400,
  zoom: 11,
  maxZoom: 16,
  minZoom: 10,
};

const markerIconSize = "1.25rem";
const headerIconSize = "2rem";

//  const bounds = new LngLatBounds(

type Viewport = typeof initialViewport;

const Sidebar = ({
  expand$,
  filters$,
  goTo$,
  play$,
  sounds,
  soundO,
}: {
  readonly expand$: BehaviorSubject<boolean>;
  readonly filters$: BehaviorSubject<readonly Category[]>;
  readonly goTo$: Subject<GoTo>;
  readonly play$: Subject<string>;
  readonly soundO: O.Option<Sound>;
  readonly sounds: ReadonlyArray<Sound>;
}) => {
  const [expand, setExpand] = useState<boolean>(expand$.value);
  useEffect(() => {
    const subscription = expand$.subscribe(setExpand);
    return () => subscription.unsubscribe();
  }, [expand$]);

  const [filters, setFilters] = useState<readonly Category[]>(filters$.value);
  useEffect(() => {
    const subscription = filters$.subscribe(setFilters);
    return () => subscription.unsubscribe();
  }, [filters$]);

  const sidebarRef = _useMapControl({
    capturePointerMove: true,
    captureClick: true,
    captureDoubleClick: true,
    captureScroll: true,
    captureDrag: true,
  });

  return (
    <aside
      ref={sidebarRef.containerRef}
      className={cx(
        styles.sidebar,
        css({ transform: expand ? "translateX(0%)" : "translateX(-100%)" })
      )}
    >
      <header className={styles.sidebarHeader}>
        <H2>Sonic Thames</H2>
        <div className={styles.sidebarHeaderIcons}>
          <ToggleButtonGroup
            value={filters}
            onChange={(e, value) => filters$.next(value)}
            size="small"
            aria-label="filters"
          >
            <ToggleButton value="Listen" title="toggle listen">
              <Icon
                name="Listen"
                width={headerIconSize}
                height={headerIconSize}
              />
            </ToggleButton>
            <ToggleButton value="See" title="toggle see">
              <Icon name="See" width={headerIconSize} height={headerIconSize} />
            </ToggleButton>
            <ToggleButton value="Feel" title="toggle feel">
              <Icon
                name="Feel"
                width={headerIconSize}
                height={headerIconSize}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <IconButton onClick={() => setExpand(false)} title="close">
          <Icon name="Close" width={controlIconSize} height={controlIconSize} />
        </IconButton>
      </header>
      {pipe(
        soundO,
        O.fold(constNull, (sound) => (
          <div className={styles.sound}>
            <iframe
              title={sound.title}
              width="320"
              height="240"
              style={{
                width: "100%",
                border: "none",
                boxSizing: "border-box",
              }}
              src={`https://www.youtube.com/embed/${sound.videoSrc}?rel=0`}
            />
            <div className={styles.soundHeader}>
              <H3>{sound.title}</H3>
              <div>
                <a
                  className={styles.viewOnYoutube}
                  href={`https://www.youtube.com/v/${sound.videoSrc}`}
                >
                  view on youtube
                </a>
              </div>
            </div>
            <div>
              {pipe(
                sound.description,
                RA.map((x) => <div key={x}>{x}</div>)
              )}
            </div>
            {"interval" in sound
              ? pipe(
                  sound.interval,
                  O.fold(constNull, (x) => (
                    <div>
                      <label>
                        <strong>Interval: </strong>
                      </label>
                      <span>{showInterval(x)}</span>
                    </div>
                  ))
                )
              : pipe(
                  sound.dateTime,
                  O.fold(constNull, (x) => (
                    <div>
                      <label>
                        <strong>Recorded date: </strong>
                      </label>
                      <span>{showDateTime(x)}</span>
                    </div>
                  ))
                )}
            {pipe(
              sound.location,
              O.fold(constNull, (location) => (
                <div>
                  <label>
                    <strong>Place: </strong>
                  </label>
                  <span>{location}</span>
                </div>
              ))
            )}
          </div>
        ))
      )}
      <hr />
      <Playlist play$={play$} goTo$={goTo$} sounds={sounds} soundO={soundO} />
    </aside>
  );
};

interface Props {
  readonly history: History;
  readonly sounds: ReadonlyArray<Sound>;
}

export const Map = ({ history, sounds }: Props): JSX.Element => {
  const [viewport, setViewport] = useState<Viewport>(initialViewport);
  useEffect(() => {
    function resize() {
      setViewport((prevState) => ({
        ...prevState,
        // height: window.innerHeight,
        width: window.innerWidth,
      }));
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [setViewport]);

  const [viewportChange$] = useState(() => new Subject<Viewport>());
  useEffect(
    () =>
      pipe(
        viewportChange$.subscribe((v) => {
          const mercatorViewport = new WebMercatorViewport({
            width: window.innerWidth,
            height: window.innerHeight,
            latitude: v.latitude,
            longitude: v.longitude,
            zoom: v.zoom,
          });

          const [[wbound, sbound], [ebound, nbound]] =
            mercatorViewport.getBounds();
          const eDiff = Math.max(0, ebound - neBound.longitude);
          const wDiff = Math.max(0, swBound.longitude - wbound);
          const nDiff = Math.max(0, nbound - neBound.latitude);
          const sDiff = Math.max(0, swBound.latitude - sbound);

          // console.log("BOUNDS", mercatorViewport.getBounds());
          // console.log(v.longitude + wDiff - eDiff);
          // console.log(v.latitude + sDiff - nDiff);

          // TODO inspect
          // https://github.com/mapbox/mapbox-gl-js/blob/ade9271dc97df2f21c48be07e940b50fd0119c38/src/geo/transform.js#L1565
          // const boundHeight = wbound - ebound;
          // const newBounds: [[number, number], [number, number]] = [
          //   [
          //     Math.max(wbound, swBound.longitude),
          //     Math.max(sbound, swBound.latitude),
          //   ],
          //   [
          //     Math.min(ebound, neBound.longitude),
          //     Math.min(nbound, neBound.latitude),
          //   ],
          // ];
          // swBound.latitude
          // currentBounds
          // console.log("MERCA", newBounds);
          // const newV = mercatorViewport.fitBounds(newBounds);
          // console.log("NEW V", newV);

          // if (0 !== wDiff - eDiff) {
          //   console.log("LONGITUDE!", wDiff, eDiff);
          // }
          // if (0 !== sDiff - nDiff) {
          //   console.log("LATITUDE!", sDiff, nDiff);
          // }

          setViewport({
            ...v,
            width: window.innerWidth,
            // latitude: v.latitude + sDiff - nDiff,
            // longitude: v.longitude + wDiff - eDiff,

            // latitude: newV.latitude,
            latitude: Math.min(
              Math.max(v.latitude, swBound.latitude),
              neBound.latitude
            ),
            // latitude:
            //   sDiff === 0 || nDiff === 0
            //     ? v.latitude + sDiff - nDiff
            //     : Math.min(
            //         Math.max(v.latitude, swBound.latitude),
            //         neBound.latitude
            //       ),
            // longitude: newV.longitude,
            longitude: Math.min(
              Math.max(v.longitude, swBound.longitude),
              neBound.longitude
            ),
            // longitude:
            //   wDiff === 0 || eDiff === 0
            //     ? v.latitude + wDiff - eDiff
            //     : Math.min(
            //         Math.max(v.longitude, swBound.longitude),
            //         neBound.longitude
            //       ),
          });
        }),
        lazyUnsubscribe
      ),
    [viewportChange$]
  );

  const [goTo$] = useState(() => new Subject<GoTo>());
  useEffect(
    () =>
      pipe(
        goTo$,
        // TODO filter by bounds contain
        ($) =>
          $.subscribe((v) =>
            // TODO Validate position?
            setViewport((p) => ({
              ...p,
              ...v,
            }))
          ),
        lazyUnsubscribe
      ),
    [goTo$]
  );

  const [soundO, setSoundO] = useState(RA.head(sounds));

  const [hoverSoundO, setHoverSoundO] = useState<O.Option<Sound>>(() => O.none);
  const [hoverClose$] = useState(() => new Subject<void>());
  useEffect(() =>
    pipe(
      hoverClose$,
      ($) => $.subscribe(() => setHoverSoundO(O.none)),
      lazyUnsubscribe
    )
  );

  const [expand$] = useState(
    () => new BehaviorSubject<boolean>(O.isSome(soundO))
  );

  const [play$] = useState(() => new Subject<string>());
  useEffect(() => {
    const subscription = play$.subscribe((sound) => {
      pipe(
        sounds,
        RA.findFirst((x) => x.title === sound),
        setSoundO
      );
      expand$.next(true);
    });
    return () => subscription.unsubscribe();
  }, [play$]);

  const [filters$] = useState(
    () => new BehaviorSubject<readonly Category[]>(["Feel", "Listen", "See"])
  );
  const [filters, setFilters] = useState<readonly Category[]>(filters$.value);
  useEffect(() => {
    const subscription = filters$.subscribe((fs) => {
      setFilters(fs);
    });
    return () => subscription.unsubscribe();
  }, [filters$]);

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      onViewportChange={subjectHandle(viewportChange$)}
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
      <div style={{ position: "absolute", right: 50, top: 50 }}>
        {/* <NavigationControl onViewportChange={this.updateViewport} /> */}
      </div>
      <div className={styles.logo}>
        <img src="/logo-05.svg" alt="logo" />
      </div>
      {pipe(
        sounds,
        RA.mapWithIndex((k, s) => {
          const sId = soundId(s);
          return (
            filters.includes(s.category) && (
              <Marker
                key={sId}
                latitude={s.coordinates.lat}
                longitude={s.coordinates.lng}
                className={styles.marker}
              >
                <div
                  className={styles.markerContent}
                  onClick={() => {
                    setHoverSoundO(O.some(s));
                    // history.push(
                    //   `/sound/${sId}`
                    //   // REVIEW
                    //   // appRoute(R_CategoryRoute[s.category], ":sound").to({
                    //   //   sound: k.toString(),
                    //   // }).path
                    // );
                  }}
                >
                  {/* <img
              alt={`${s.title} thumbnail`}
              width={30}
              height={30}
            /> */}
                  {/* <div className={styles.markerNote}>{s.marker}</div> */}
                  {foldSumType({
                    Listen: () => (
                      <div
                        className={styles.markerIcon(brandColors.icons.listen)}
                      >
                        <Icon
                          name="Listen"
                          color="white"
                          width={markerIconSize}
                          height={markerIconSize}
                        />
                      </div>
                    ),
                    See: () => (
                      <div className={styles.markerIcon(brandColors.icons.see)}>
                        <Icon
                          name="See"
                          color="white"
                          width={markerIconSize}
                          height={markerIconSize}
                        />
                      </div>
                    ),
                    Feel: () => (
                      <div
                        className={styles.markerIcon(brandColors.icons.feel)}
                      >
                        <Icon
                          name="Feel"
                          color="white"
                          width={markerIconSize}
                          height={markerIconSize}
                        />
                      </div>
                    ),
                  })(s.category)}
                </div>
              </Marker>
            )
          );
        })
      )}
      {pipe(
        hoverSoundO,
        O.fold(constNull, (sound) => (
          <Hover
            className={styles.hover}
            close$={hoverClose$}
            play$={play$}
            sound={sound}
          />
        ))
      )}
      <Sidebar
        expand$={expand$}
        goTo$={goTo$}
        filters$={filters$}
        play$={play$}
        sounds={sounds}
        soundO={soundO}
      />
    </ReactMapGL>
  );
};

const styles = {
  logo: css({
    position: "absolute",
    pointerEvents: "none",
    bottom: -85,
    right: -40,
    width: "20rem",
    opacity: 1,
  }),
  marker: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: brandColors.main.light,
    cursor: "pointer",
    // position: ""
    svg: css({
      cursor: "pointer",
    }),
    "&:hover": css({
      zIndex: 1000,
      // Removed
      // "> div": css({
      //   div: css({
      //     border: `2px solid ${colorToCssRGB(brandColors.action.dark)}`,
      //   }),
      // }),
    }),
  }),
  markerContent: css({
    transform: "translate(-50%, -100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),
  markerNote: css({
    // backgroundColor: colorToCssRGB(brandColors.neve.primary),
    boxSizing: "content-box",
    fontSize: fontSize("s"),
    padding: spacingEm("xxs"),
    // borderRadius: spaceRem(),
    cursor: "pointer",
  }),
  markerIcon: (color: string) =>
    css({
      display: "flex",
      alignItems: "center",
      background: color,
      borderRadius: "50%",
      padding: spacingRem("xxs"),
      border: "1px solid white",
    }),
  sidebar: css({
    // backgroundColor: colorToCssRGBA([0, 0, 0, 0.4] as const),
    padding: spacingRem("default"),
    backgroundColor: brandColors.neutral.s95,
    position: "absolute",
    zIndex: 2000,
    top: 0,
    bottom: 0,
    left: 0,
    width: 500,
    transitionDuration: "150ms",
    msTransitionProperty: "transform",
    transitionTimingFunction: "ease-in-out",
    overflow: "auto",
    cursor: "initial",
  }),
  sidebarHeader: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingRem("default"),
  }),
  sidebarHeaderIcons: css({
    display: "flex",
    gap: spacingRem("default"),
  }),
  sound: css({
    "> *": css({
      marginBottom: spacingRem("default"),
    }),
  }),
  soundHeader: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  hover: css({
    backgroundColor: brandColors.neutral.s95,
    position: "absolute",
    zIndex: 2000,
    bottom: 60,
    right: 25,
    width: 300,
  }),
  viewOnYoutube: css({
    textDecoration: "none",
    border: `1px solid ${brandColors.neutral.main}`,
    padding: `${spacingEm("xxxs")} ${spacingEm("xs")}`,
    borderRadius: spacingEm("xs"),
    color: brandColors.neutral.main,
  }),
} as const;
