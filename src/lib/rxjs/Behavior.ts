import { Observable } from "rxjs/internal/Observable";

/**
 * A `Behavior` is a custom structure subset of the BehaviorSubject, which acts as an Observable, but
 * also holds a mutable `value` with the latest push.
 */
export interface Behavior<T> extends Observable<T> {
  readonly value: T;
}
