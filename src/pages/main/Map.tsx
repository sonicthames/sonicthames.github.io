import * as React from "react";
import ReactMapGL from "react-map-gl";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN ?? "";
const initialState = {
  viewport: {
    height: 500,
    latitude: 51.46,
    longitude: 0.4,
    width: 400,
    zoom: 11,
    maxZoom: 13,
    minZoom: 10,
  },
};
const minBound = {
  latitude: 51.4,
  longitude: 0.3,
};
const maxBound = {
  latitude: 51.52,
  longitude: 0.5,
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
          if (v.latitude < minBound.latitude) {
            v.latitude = minBound.latitude;
          }
          if (maxBound.latitude < v.latitude) {
            v.latitude = maxBound.latitude;
          }
          if (v.longitude < minBound.longitude) {
            v.longitude = minBound.longitude;
          }
          if (maxBound.longitude < v.longitude) {
            v.longitude = maxBound.longitude;
          }
          this.setState((prevState) => ({
            viewport: { ...prevState.viewport, ...v },
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
                "background-color": "#dedede",
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
                "fill-color": "#00ffff",
              },
              // maxzoom: 8,
            },
            // {
            //   id: "water",
            //   source: "mapbox",
            //   "source-layer": "water",

            //   type: "fill",
            //   paint: {
            //     "fill-color": "#00ffff",
            //   },
            //   features: {
            //     simplification: ["case", ["==", ["zoom"], 10], 1, 4],
            //   },
            //   // maxzoom: 8,
            // },
          ],
        }}
      >
        <div style={{ position: "absolute", right: 50, top: 50 }}>
          {/* <NavigationControl onViewportChange={this.updateViewport} /> */}
        </div>
      </ReactMapGL>
    );
  }
}
