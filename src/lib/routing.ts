import { Show } from "fp-ts/lib/Show";
import { generatePath } from "react-router";
import type { ExtractRouteParams } from "react-router";
import type { EmptyObject, JoinTuple } from "./typescript";
import { joinTuple } from "./typescript";

export type RelativePath<FS extends readonly string[]> = JoinTuple<"/", FS>;
export type AbsolutePath<FS extends readonly string[]> = `/${RelativePath<FS>}`;

export type RouteTree<T> = {
  readonly [P in keyof T]: null | (T[P] extends RouteTree<T[P]> ? T[P] : never);
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
  ? FS extends readonly []
    ? EmptyObject
    : FS extends readonly [infer F]
    ? F extends keyof T
      ? T[F]["showInstances"]
      : EmptyObject
    : FS extends readonly [infer F, ...infer RS]
    ? F extends keyof T
      ? RS extends readonly string[]
        ? T[F]["showInstances"] & ConsumedShowInstances<T[F]["fragments"], RS>
        : never
      : never
    : never
  : never;

type Test_ConsumedShowInstances = ConsumedShowInstances<
  TestTree,
  readonly ["leaf"]
>;
type Test_ConsumedShowInstances2 = ConsumedShowInstances<
  TestTree,
  readonly ["base"]
>;

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
  readonly path: `${B}${RelativePath<FS>}`;
  readonly routes: RouteNode<T, FS>;
  readonly fragments: FS;
};

export type ToRouteSegment<
  T,
  FS extends readonly string[],
  B extends string = "/"
> = RouteSegment<T, FS, B> & {
  // NOTE: Temp to function, should instead use Show<T>
  readonly to: (
    _: ExtractRouteParams<RelativePath<FS>>
  ) => ToRouteSegment<T, readonly [], `${B}${RelativePath<FS>}`>;
};

type TestTree = {
  readonly leaf: {
    readonly fragments: null;
  };
  readonly base: {
    readonly fragments: {
      readonly ":work": {
        readonly showInstances: { readonly work: { readonly show: () => "1" } };
        readonly fragments: {
          readonly ":multiple": {
            readonly showInstances: {
              readonly multiple: { readonly show: () => "1" };
            };
            readonly fragments: null;
          };
        };
      };
    };
  };
};

export type FragmentShowInstances<P> = P extends string
  ? EmptyObject extends ShowInstances<P>
    ? EmptyObject
    : Readonly<{ readonly showInstances: ShowInstances<P> }>
  : EmptyObject;

export type AppRoutes<T> = {
  readonly [P in keyof T]-?: T[P] extends Readonly<{
    readonly fragments: infer W;
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
  readonly [P in keyof T]-?: T[P] extends {
    readonly fragments: object;
    // TODO Is this check even needed? Probably not
    readonly showInstances?: P extends string ? ShowInstances<P> : undefined;
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
      // eslint-disable-next-line functional/no-let
      let remainder = routes;
      // eslint-disable-next-line functional/no-let
      let i;
      // eslint-disable-next-line functional/no-loop-statement
      for (i = 0; i < len; i++) {
        const k = fragments[i];
        // @ts-expect-error Too heavy for the compiler to work this one out.
        remainder = remainder[k]["fragments"];
        // showInstances[] =
      }

      return {
        path,
        fragments,
        // @ts-expect-error Too heavy for the compiler to work this one out.
        to: (props) => {
          return {
            // TODO a better version of generatePath
            // @ts-expect-error generatePath generates the correct shape
            path: generatePath(path, props),
            fragments,
            routes,
          };
        },
        routes: remainder as RouteNode<T, FS>,
      };
    };
