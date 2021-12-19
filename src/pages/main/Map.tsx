import { css } from "@emotion/css";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { History } from "history";
import React, { useEffect, useState } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import { Subject } from "rxjs";
import { H2, H3 } from "../../components/Typography";
import { Sound } from "../../domain/base";
import { Icon } from "../../icon";
import { lazyUnsubscribe, subjectHandle } from "../../lib/rxjs";
import { soundId } from "../../pages/location";
import { brandColors, colorToCssHex } from "../../theme/colors";
import { fontSize } from "../../theme/fontSize";
import { spacingEm, spacingRem } from "../../theme/spacing";
import { Playlist } from "./Playlist";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN ?? "";
const initialViewport = {
  height: "100vh",
  latitude: 51.501,
  longitude: -0.001,
  width: 400,
  zoom: 11,
  maxZoom: 16,
  minZoom: 10,
};
const minBound = {
  latitude: initialViewport.latitude - 0.08,
  longitude: initialViewport.longitude - 0.13,
} as const;
const maxBound = {
  latitude: initialViewport.latitude + 0.08,
  longitude: initialViewport.longitude + 0.13,
} as const;

type Viewport = typeof initialViewport;

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
          setViewport({
            ...v,
            width: window.innerWidth,
            latitude: Math.min(
              Math.max(v.latitude, minBound.latitude),
              maxBound.latitude
            ),
            longitude: Math.min(
              Math.max(v.longitude, minBound.longitude),
              maxBound.longitude
            ),
          });
        }),
        lazyUnsubscribe
      ),
    [viewportChange$]
  );

  const [soundO] = useState(RA.head(sounds));

  // TODO
  const recordedDate = new Date();

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
            <Marker
              key={s.title}
              latitude={s.coordinates.lat}
              longitude={s.coordinates.lng}
              className={styles.marker}
            >
              <div
                className={styles.markerContent}
                onClick={() => {
                  history.push(
                    `/sound/${sId}`
                    // REVIEW
                    // appRoute(R_CategoryRoute[s.category], ":sound").to({
                    //   sound: k.toString(),
                    // }).path
                  );
                }}
              >
                {/* <img
              alt={`${s.title} thumbnail`}
              width={30}
              height={30}
            /> */}
                <div className={styles.markerNote}>{s.marker}</div>
                {((c) => {
                  switch (c) {
                    case "Listen":
                      return (
                        <Icon name="MarkerL" width="2.5rem" height="2.5rem" />
                      );
                    case "See":
                      return (
                        <Icon name="MarkerS" width="2.5rem" height="2.5rem" />
                      );
                    case "Feel":
                      return (
                        <Icon name="MarkerF" width="2.5rem" height="2.5rem" />
                      );
                  }
                })(s.category)}
              </div>
            </Marker>
          );
        })
      )}
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <H2>Sonic Thames</H2>
          <div>
            <Icon name="MarkerL" width="2.5rem" height="2.5rem" />
            <Icon name="MarkerS" width="2.5rem" height="2.5rem" />
            <Icon name="MarkerF" width="2.5rem" height="2.5rem" />
          </div>
          <button className={styles.closeButton}>
            <Icon name="Close" width="2rem" height="2rem" />
          </button>
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
                  <a href={`https://www.youtube.com/v/${sound.videoSrc}`}>
                    view on youtube
                  </a>
                </div>
              </div>
              <div>
                {pipe(
                  sound.description,
                  RA.map((x) => <div>{x}</div>)
                )}
              </div>
              <div>
                <label>
                  <strong>Recorded date: </strong>
                </label>
                <span>{recordedDate.toString()}</span>
              </div>
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
        <Playlist sounds={sounds} />
      </aside>
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
  sidebar: css({
    // backgroundColor: colorToCssRGBA([0, 0, 0, 0.4] as const),
    padding: spacingRem("default"),
    backgroundColor: brandColors.neutral.s95,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 500,
  }),
  sidebarHeader: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  sound: css({
    "> *": css({
      marginTop: spacingRem("default"),
    }),
  }),
  soundHeader: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  closeButton: css({
    background: "none",
    border: "none",
  }),
} as const;
