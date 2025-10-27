export interface Coordinate {
  readonly latitude: number
  readonly longitude: number
}

export interface GoTo {
  readonly longitude: number
  readonly latitude: number
  readonly zoom?: number
  readonly transitionDuration?: number
  readonly transitionEasing?: (time: number) => number
}
