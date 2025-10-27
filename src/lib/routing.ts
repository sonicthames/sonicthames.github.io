import type { Show } from "fp-ts/Show"
import type { ParamParseKey, PathParam } from "react-router"
import { generatePath } from "react-router"
import type { EmptyObject, JoinTuple } from "./typescript"
import { joinTuple } from "./typescript"

/** Join path fragments like ["a","b"] -> "a/b" and "/a/b" helpers */
export type RelativePath<FS extends readonly string[]> = JoinTuple<"/", FS>
export type AbsolutePath<FS extends readonly string[]> = `/${RelativePath<FS>}`

/** Whether a path pattern has any `:param` segments. */
type HasParams<Path extends string> = Path extends `${string}:${string}`
  ? true
  : false

/** Exact key equality helper (no extras / no missing keys). */
type ExactKeys<A, B> = Exclude<keyof A, keyof B> extends never
  ? Exclude<keyof B, keyof A> extends never
    ? A
    : never
  : never

/** showInstances must exist only when the fragment declares params. Keys must be exact. */
export type ShowInstances<P extends string> = ExactKeys<
  Readonly<Record<ParamParseKey<P>, Show<unknown>>>,
  Record<ParamParseKey<P>, unknown>
>

export type FragmentShowInstances<P> = P extends string
  ? HasParams<P> extends true
    ? Readonly<{ readonly showInstances: ShowInstances<P> }>
    : EmptyObject
  : EmptyObject

/** AppRoutes: each entry has `fragments` which is either null (leaf) or a nested map. */
type NormalizeRoute<TValue, P extends string> = TValue extends Readonly<{
  readonly fragments: infer W
}>
  ? Readonly<FragmentShowInstances<P>> &
      Omit<TValue, "fragments"> & {
        readonly fragments: W extends null ? null : AppRoutes<W>
      }
  : never

export type AppRoutes<T> = {
  readonly [P in Extract<keyof T, string>]-?: NormalizeRoute<T[P], P>
}

/** Type-level selection of a node by walking fragments. */
export type RouteNode<T, FS extends readonly unknown[]> = FS extends readonly []
  ? T
  : FS extends readonly [infer F]
    ? F extends keyof T
      ? T[F]
      : never
    : FS extends readonly [infer F, ...infer RS]
      ? F extends keyof T
        ? RouteNode<
            T[F] extends { readonly fragments: infer W } ? W : never,
            RS
          >
        : never
      : never

/** Enumerate valid fragment sequences for a given tree. */
export type PathTree<T> = {
  readonly [P in keyof T]-?: T[P] extends {
    readonly fragments: object
    readonly showInstances?: P extends string ? ShowInstances<P> : undefined
  }
    ? readonly [P] | readonly [P, ...Path<T[P]["fragments"]>]
    : readonly [P]
}
export type Path<T> = PathTree<T>[keyof PathTree<T>]

/** The selected route segment plus metadata. */
export type RouteSegment<
  T,
  FS extends readonly string[],
  B extends string = "/",
> = {
  readonly path: `${B}${RelativePath<FS>}`
  readonly routes: RouteNode<T, FS>
  readonly fragments: FS
}

/** Result of calling `to(...)`: fully-resolved path, no remaining fragments. */
export type ResolvedRouteSegment<T> = {
  readonly path: string
  readonly fragments: readonly []
  readonly routes: T
}

/** Route segment with a `to` helper to materialize params. */
export type ToRouteSegment<
  T,
  FS extends readonly string[],
  B extends string = "/",
> = RouteSegment<T, FS, B> & {
  readonly to: (
    _: Record<PathParam<`/${RelativePath<FS>}`>, string | null>,
  ) => ResolvedRouteSegment<T>
}

/**
 * Build a typed route helper bound to a routes tree.
 * Usage:
 *   const appRoute = routePath(appRoutes)
 *   appRoute("sound", ":sound").to({ sound: "kick" }) // -> "/sound/kick"
 */
export const routePath =
  <T>(routes: AppRoutes<T> & T) =>
  <FS extends readonly string[] & Path<T>>(
    ...fragments: FS
  ): ToRouteSegment<T, FS> => {
    const path = `/${joinTuple("/")<FS>(...fragments)}` as const

    // Runtime walk into the remainder; types are enforced at call site via Path<T>/RouteNode<T,FS>.
    let remainder: unknown = routes
    for (let i = 0; i < fragments.length; i += 1) {
      const k = fragments[i]
      if (
        remainder !== null &&
        typeof remainder === "object" &&
        k in remainder
      ) {
        remainder = (remainder as Record<PropertyKey, unknown>)[k]
        if (
          remainder !== null &&
          typeof remainder === "object" &&
          "fragments" in remainder
        ) {
          remainder = (remainder as { readonly fragments: unknown }).fragments
        } else {
          remainder = undefined
        }
      } else {
        remainder = undefined
      }
    }

    return {
      path,
      fragments,
      to: (props) => ({
        path: generatePath(path, props),
        fragments: [] as const,
        routes,
      }),
      routes: remainder as RouteNode<T, FS>,
    }
  }
