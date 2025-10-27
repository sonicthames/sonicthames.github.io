import type { Show } from "fp-ts/Show"
import * as S from "fp-ts/string"
import type { Sound } from "../domain/base"
import type { AppRoutes } from "../lib/routing"
import { routePath } from "../lib/routing"

const routesDefinition = {
  main: { fragments: null },
  about: { fragments: null },
  sound: {
    fragments: {
      ":sound": {
        showInstances: { sound: S.Show as Show<unknown> },
        fragments: null,
      },
    },
  },
  listen: {
    fragments: null,
  },
  see: {
    fragments: null,
  },
  feel: {
    fragments: null,
  },

  contact: { fragments: null },
} as const
export type Routes = typeof routesDefinition

export const appRoutes: AppRoutes<Routes> = routesDefinition

export const appRoute = routePath(appRoutes)

export const soundId = (s: Sound) => s.marker.toLowerCase().replaceAll(" ", "_")
