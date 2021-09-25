import { PathX, RelativePath, RouteNode, routePath } from "../lib/routing";

export const appRoutes = {
  main: 0,
  about: 0,
  works: {
    ":work": 0,
  },
  contact: 0,
} as const;
export type Routes = typeof appRoutes;

export type AppRouteSegment<
  B extends string,
  T,
  FS extends readonly string[]
> = {
  path: `${B}${RelativePath<FS>}`;
  routes: RouteNode<T, FS>;
  fragments: FS;
};

// Goes in routing.ts
export const routeP =
  <B extends string>(base: B) =>
  <T>(routes: T) =>
  <FS extends readonly string[] & PathX<T>>(
    ...fragments: FS
  ): AppRouteSegment<B, T, FS> => {
    const segment = routePath(routes)(...fragments);
    return {
      path: `${base}${segment.to}`,
      fragments,
      routes: segment.routes,
    } as const;
  };

export const appRoute = routeP("/")(appRoutes);
