import { css } from "@emotion/css";
import { pipe } from "fp-ts/lib/function";
import React, { useEffect, useState } from "react";
import ReactMapGL from "react-map-gl";
import { Subject } from "rxjs";
import { lazyUnsubscribe, subjectHandle } from "../../lib/rxjs";
import { brandColors, colorToCssHex } from "../../theme/colors";

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
  children: React.ReactNode;
}

export const Map = ({ children }: Props): JSX.Element => {
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
      {children}
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
} as const;
