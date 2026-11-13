let query: MediaQueryList | null = null

/** Decorative map animations hold still when the user asks for reduced motion. */
export const prefersReducedMotion = () => {
  query ??= window.matchMedia("(prefers-reduced-motion: reduce)")
  return query.matches
}
