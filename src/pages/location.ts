import { routePath, RoutingFragments } from "../lib/routing";

const locations = {
  main: 0,
  about: 0,
  works: {
    ":work": 0,
  },
  contact: 0,
} as const;

type Locations = typeof locations;

export function routePathAbsolute<KS extends readonly string[]>(
  ks: KS extends RoutingFragments<Locations, KS> ? KS : never
) {
  const { path, remainder } = routePath(locations)(ks);
  return {
    path: `/${path}`,
    remainder,
  } as const;
}
