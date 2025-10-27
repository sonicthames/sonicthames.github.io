import type { Subscription } from "rxjs/internal/Subscription"

/**
 * @param s Subscription to an Observable stream.
 * @returns A function to lazily handle unsubscriptions from Observables.
 */
export function lazyUnsubscribe(s: Subscription) {
  return () => {
    s.unsubscribe()
  }
}
