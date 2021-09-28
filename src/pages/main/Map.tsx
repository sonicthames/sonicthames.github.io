import { css } from "@emotion/css";
import * as React from "react";
import ReactMapGL from "react-map-gl";
import { brandColors, colorToCssHex } from "../../theme/colors";
// import { spaceRem } from "../../theme/spacing";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN ?? "";
const initialState = {
  viewport: {
    height: "100vh",
    latitude: 51.501,
    longitude: -0.001,
    width: 400,
    zoom: 11,
    maxZoom: 16,
    minZoom: 10,
  },
};
const minBound = {
  latitude: initialState.viewport.latitude - 0.08,
  longitude: initialState.viewport.longitude - 0.13,
};
const maxBound = {
  latitude: initialState.viewport.latitude + 0.08,
  longitude: initialState.viewport.longitude + 0.13,
};

type State = typeof initialState;
type Viewport = typeof initialState.viewport;

export class Map extends React.Component<{}, State> {
  public state: State = initialState;

  public componentDidMount() {
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }

  public resize = () => {
    this.setState((prevState) => ({
      viewport: {
        ...prevState.viewport,
        // height: window.innerHeight,
        width: window.innerWidth,
      },
    }));
  };

  public render() {
    const { viewport } = this.state;
    return (
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onViewportChange={(v: Viewport) => {
          this.setState((prevState) => ({
            viewport: {
              ...prevState.viewport,
              ...v,
              latitude: Math.min(
                Math.max(v.latitude, minBound.latitude),
                maxBound.latitude
              ),
              longitude: Math.min(
                Math.max(v.longitude, minBound.longitude),
                maxBound.longitude
              ),
            },
          }));
        }}
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
                "line-color": "#000",
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
        {this.props.children}
      </ReactMapGL>
    );
  }
}

const styles = {
  logo: css({
    position: "absolute",
    // bottom: spaceRem("xl"),
    // left: spaceRem("xl"),
    bottom: -85,
    right: -40,
    width: "20rem",
    opacity: 1,
  }),
};
