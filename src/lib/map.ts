import type { ViewportProps } from "react-map-gl";

export interface Coordinate {
  readonly latitude: number;
  readonly longitude: number;
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
