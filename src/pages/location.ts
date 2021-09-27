import * as S from "fp-ts/string";
import { routePath } from "../lib/routing";

export const appRoutes = {
  main: { fragments: null },
  about: { fragments: null },
  listen: {
    fragments: {
      ":sound": {
        showInstances: { sound: S.Show },
        fragments: null,
      },
    },
  },
  see: {
    fragments: {
      ":sound": {
        showInstances: { sound: S.Show },
        fragments: null,
      },
    },
  },
  feel: {
    fragments: {
      ":sound": {
        showInstances: { sound: S.Show },
        fragments: null,
      },
    },
  },

  contact: { fragments: null },
} as const;
export type Routes = typeof appRoutes;

export const appRoute = routePath(appRoutes);
