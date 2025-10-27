import type { Key } from "../typescript"
import { isKeyOf } from "../typescript"

/**
 * @example
 * type T = "a" | "b" | "c";
 * const f = foldSumType<T, number>({
 *   a: function () { return 1; }
 *   b: function () { return 2; }
 *   c: function () { return 3; }
 * })
 *
 * // returns 2
 * f("b");
 * // errors
 * f("d");
 * @param {object} fns record of functions of the type `(_: K) => P`. One per each sum value
 * @param {K} k value of the sum type
 * @returns {A} result of the value associated function
 */
export function foldSumType<K extends Key, A>(
  fns: {
    readonly [P in K]: (k: P) => A
  },
) {
  return function inner(k: K): A {
    return fns[k](k)
  }
}

/**
 * Partial version of `foldSumType`
 *
 * @example
 * const f = foldSumType_(function () { return 0; })({
 *   b: function () { return 2; }
 *   c: function () { return 3; }
 * });
 *
 * // returns 2
 * f("b" as "a" | "b" | "c");
 * // returns 0
 * f("a" as "a" | "b" | "c");
 * // compile error
 * f("n");
 * @param {() => D} def function of the type `(_: K) => A`
 * @param {object} fns record of functions of the type `(_: K) => P`. One per each sum value P
 * @param {L} k value of the sum type
 * @returns {A | D} result of the value associated function
 */
export function foldSumType_<D, K extends Key, A>(
  def: () => D,
  fns: {
    readonly [P in K]: (k: P) => A
  },
) {
  return <L extends Key>(
    k: Exclude<K, L> extends undefined ? L : never,
  ): A | D => (isKeyOf(k, fns) ? fns[k](k) : def())
}
