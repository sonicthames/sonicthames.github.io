import type { JoinTuple } from "./typescript";
import { joinTuple } from "./typescript";

export type RoutingTree<T> = {
  [P in keyof T]: null | (T[P] extends RoutingTree<T[P]> ? T[P] : never);
};

export type RoutingFragments<
  T,
  KS extends readonly string[]
> = KS extends readonly []
  ? readonly []
  : KS extends readonly [infer K]
  ? K extends keyof RoutingTree<T>
    ? readonly [K]
    : never
  : KS extends readonly [infer K, ...infer RS]
  ? K extends keyof RoutingTree<T>
    ? RS extends readonly string[]
      ? readonly [K, ...RoutingFragments<T[K], RS>]
      : never
    : never
  : never;

export type RoutingNode<
  T,
  KS extends readonly unknown[]
> = KS extends readonly []
  ? T
  : KS extends readonly [infer K]
  ? K extends keyof RoutingTree<T>
    ? T[K]
    : never
  : KS extends readonly [infer K, ...infer RS]
  ? K extends keyof RoutingTree<T>
    ? RoutingNode<RoutingTree<T>[K], RS>
    : never
  : never;

/**
 * @param xs Tree of locations
 * @param ks List of fragments of the route path
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
  <LS>(xs: LS) =>
  <KS extends readonly string[]>(
    ks: KS extends RoutingFragments<LS, KS> ? KS : never
  ): {
    path: JoinTuple<"/", KS>;
    remainder: RoutingNode<LS, KS>;
  } => {
    const len = ks.length;
    const path = joinTuple("/")(...ks);
    let remainder = xs;
    for (let i = 0; i < len; i++) {
      const k = ks[i];
      remainder = remainder[k] as unknown as any;
    }
    return {
      path,
      remainder: remainder as any,
    };
  };
