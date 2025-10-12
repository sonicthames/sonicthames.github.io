import type * as T from "fp-ts/Task";
import { from } from "rxjs";
import type { Observable } from "rxjs/internal/Observable";

/**
 * @experimental
 * Build an Observable from a task
 * Could have a different signature, returning a `Subject` instead
 */
export function fromTask<A>(t: T.Task<A>): Observable<A> {
  return from(t());
}
