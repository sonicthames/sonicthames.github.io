import type { ReactNode } from "react"
import { Route } from "react-router-dom"
import type { ToRouteSegment } from "../../lib/routing"
import type { appRoutes } from "../location"

/**
 * Type-safe wrapper around React Router's Route component.
 *
 * React Router v6/v7 pattern: use the `element` prop (not `render` or `component`).
 * To access route params, use the `useParams()` hook inside your component.
 *
 * Example:
 *   <AppRoute segment={appRoute("sound", ":sound")} element={<SoundPage />} />
 */
interface Props<FS extends readonly string[]> {
  readonly segment: ToRouteSegment<typeof appRoutes, FS>
  readonly element: ReactNode
  readonly index?: boolean
  readonly caseSensitive?: boolean
}

export const AppRoute = <FS extends readonly string[]>({
  segment,
  element,
  index,
  caseSensitive,
}: Props<FS>) => {
  return (
    <Route
      path={segment.path}
      element={element}
      index={index}
      caseSensitive={caseSensitive}
    />
  )
}
