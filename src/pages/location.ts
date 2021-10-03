import * as S from "fp-ts/string";
import { NewSound } from "../domain/base";
import { routePath } from "../lib/routing";

export const appRoutes = {
  main: { fragments: null },
  about: { fragments: null },
  sounds: {
    fragments: {
      ":sound": {
        showInstances: { sound: S.Show },
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
} as const;
export type Routes = typeof appRoutes;

export const appRoute = routePath(appRoutes);

export const soundId = (s: NewSound) =>
  s.title.toLowerCase().replaceAll(" ", "_");
