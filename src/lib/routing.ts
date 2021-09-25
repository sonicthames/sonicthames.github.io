import type { JoinTuple, PathTree } from "./typescript";
import { joinTuple } from "./typescript";

export type RelativePath<FS extends readonly string[]> = JoinTuple<"/", FS>;
export type AbsolutePath<FS extends readonly string[]> = `/${RelativePath<FS>}`;

export type RouteTree<T> = {
  [P in keyof T]: null | (T[P] extends RouteTree<T[P]> ? T[P] : never);
};

export type RouteNode<T, FS extends readonly unknown[]> = FS extends readonly []
  ? T
  : FS extends readonly [infer F]
  ? F extends keyof RouteTree<T>
    ? T[F]
    : never
  : FS extends readonly [infer F, ...infer RS]
  ? F extends keyof RouteTree<T>
    ? RouteNode<RouteTree<T>[F], RS>
    : never
  : never;

export type RouteSegment<T, FS extends readonly string[]> = {
  to: RelativePath<FS>;
  routes: RouteNode<T, FS>;
  fragments: FS;
};

// extends
export type PathX<T> = PathTree<T>[keyof PathTree<T>];

/**
 * @param routes Tree of locations
 * @param fragments List of fragments of the route path
 * @returns Composed path and the remainder subtree
 * @tutorial
 * ```
 * routePath(locations)(["route", "subroute"] as const);
 * ```
 *
 * NOTE: This isn't the ideal definition.
 * Ideally, the second argument would be a remainder, which would aid in autocompletion and simplicity,
 * but so far, I haven't found a way to do this. Should keep tabs on TS to see if this ever changes
 *
 * ```
 * routePath(locations)("route", "subroute");
 * ```
 */
export const routePath =
  // <T extends RouteTree>(routes: T) =>


    <T>(routes: T) =>
    <FS extends readonly string[] & PathX<T>>(
      ...fragments: FS
    ): RouteSegment<T, FS> => {
      const len = fragments.length;
      const path = joinTuple("/")<FS>(...fragments);
      let remainder = routes;
      for (let i = 0; i < len; i++) {
        const k = fragments[i];
        // @ts-ignore Too heavy for the compiler to work this one out.
        remainder = remainder[k];
      }
      return {
        to: path,
        fragments,
        routes: remainder as RouteNode<T, FS>,
      };
    };
