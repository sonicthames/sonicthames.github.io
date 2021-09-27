import * as S from "fp-ts/string";
import { routePath } from "../lib/routing";

export const appRoutes = {
  main: { fragments: null },
  about: { fragments: null },
  works: {
    fragments: {
      ":work": {
        showInstances: { work: S.Show },
        fragments: {
          ":subroute": {
            fragments: null,
            showInstances: {
              subroute: S.Show,
            },
          },
        },
      },
    },
  },
  contact: { fragments: null },
} as const;
export type Routes = typeof appRoutes;

export const appRoute = routePath(appRoutes);
