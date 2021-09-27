import { Show } from "fp-ts/lib/Show";
import { ExtractRouteParams, generatePath } from "react-router";
import type { JoinTuple } from "./typescript";
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

// TODO
type ConsumedShowInstances<
  T,
  FS extends readonly string[]
> = T extends AppRoutes<T>
  ? FS extends []
    ? {}
    : FS extends [infer F]
    ? F extends keyof T
      ? T[F]["showInstances"]
      : {}
    : FS extends [infer F, ...infer RS]
    ? F extends keyof T
      ? RS extends readonly string[]
        ? T[F]["showInstances"] & ConsumedShowInstances<T[F]["fragments"], RS>
        : never
      : never
    : never
  : never;

type Test_ConsumedShowInstances = ConsumedShowInstances<TestTree, ["leaf"]>;
type Test_ConsumedShowInstances2 = ConsumedShowInstances<TestTree, ["base"]>;

// {  ...ConsumedShowInstances<T[P]["fragments"], RS> }

//   P extends string ? T[P] extends {
//     showInstances: ShowInstances<P>;
//   } : {} : {} ? [ShowInstances<P>, ...ConsumedShowInstances]
//     ? readonly [P] | readonly [P, ...Path<T[P]["fragments"]>]
//     : readonly [P];
// };

// export type RouteSegment<T, FS extends readonly string[]> = {
//   path: RelativePath<FS>;
//   routes: RouteNode<T, FS>;
//   fragments: FS;
//   // NOTE: Temp to function, should instead use Show<T>
//   to: (_: ExtractRouteParams<RelativePath<FS>>) => RouteSegment<T, FS>;
// };

export type RouteSegment<
  T,
  FS extends readonly string[],
  B extends string = "/"
> = {
  path: `${B}${RelativePath<FS>}`;
  routes: RouteNode<T, FS>;
  fragments: FS;
};

export type ToRouteSegment<
  T,
  FS extends readonly string[],
  B extends string = "/"
> = RouteSegment<T, FS, B> & {
  // NOTE: Temp to function, should instead use Show<T>
  to: (
    _: ExtractRouteParams<RelativePath<FS>>
  ) => ToRouteSegment<T, [], `${B}${RelativePath<FS>}`>;
};

type TestTree = {
  leaf: {
    fragments: null;
  };
  base: {
    fragments: {
      ":work": {
        showInstances: { work: { show: () => "1" } };
        fragments: {
          ":multiple": {
            showInstances: { multiple: { show: () => "1" } };
            fragments: null;
          };
        };
      };
    };
  };
};

export type FragmentShowInstances<P> = P extends string
  ? {} extends ShowInstances<P>
    ? {}
    : Readonly<{ showInstances: ShowInstances<P> }>
  : {};

export type AppRoutes<T> = {
  [P in keyof T]-?: T[P] extends Readonly<{
    fragments: infer W;
    // showInstances?: P extends string ? ShowInstances<P> : undefined;
  }> &
    FragmentShowInstances<P>
    ? W extends AppRoutes<W>
      ? T[P]
      : never
    : never;
};

type Test_AppRoutes = AppRoutes<TestTree>;

// type AppRoutes = null | Readonly<
//   Record<
//     string,
//     { fragments: AppRoutes; showInstances?: ReadonlyArray<Show<unknown>> }
//   >
// >;

// type ShowInstances<T> = T;
// interface LocationNode<T> {
//   showInstances: ShowInstances<T>;
//   fragments: Path<T>;
// }

export type ShowInstances<P extends string> = Readonly<
  Record<keyof ExtractRouteParams<P>, Show<any>>
>;

type Test_ShowInstances = ShowInstances<"works/:work:kkoko/:00909/">;

export type PathTree<T> = {
  [P in keyof T]-?: T[P] extends {
    fragments: object;
    // TODO Is this check even needed? Probably not
    showInstances?: P extends string ? ShowInstances<P> : undefined;
  }
    ? readonly [P] | readonly [P, ...Path<T[P]["fragments"]>]
    : readonly [P];
};

// export type Intermediate<T> = {
//   fragments: Path<T>;
//   showInstances?: null;
// };

// extends
export type Path<T> = PathTree<T>[keyof PathTree<T>];

type Test_Path = Path<TestTree>;

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


    <T>(routes: AppRoutes<T>) =>
    <FS extends readonly string[] & Path<T>>(
      ...fragments: FS
    ): ToRouteSegment<T, FS> => {
      const len = fragments.length;
      const path = `/${joinTuple("/")<FS>(...fragments)}` as const;
      let remainder = routes;
      for (let i = 0; i < len; i++) {
        const k = fragments[i];
        // @ts-ignore Too heavy for the compiler to work this one out.
        remainder = remainder[k]["fragments"];
        // showInstances[] =
      }

      return {
        path,
        fragments,
        to: (props) => ({
          // @ts-ignore
          path: generatePath(path, props),
          // @ts-ignore
          fragments,
          routes,
        }),
        routes: remainder as RouteNode<T, FS>,
      };
    };
