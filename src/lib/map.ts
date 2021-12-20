import { ViewportProps } from "react-map-gl";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export type GoTo = Pick<
  ViewportProps,
  | "longitude"
  | "latitude"
  | "zoom"
  | "transitionDuration"
  | "transitionInterpolator"
  | "transitionEasing"
>;
