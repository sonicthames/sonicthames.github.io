import { useDependent } from "@react-hooke/react";

/**
 * REVIEW Recursive type definition using variadic tuples https://stackoverflow.com/questions/65319258/how-to-type-pipe-function-using-variadic-tuple-types-in-typescript-4
 * Dependent pipe transform over a single input dependency.
 * Within the transform definitions, you avoid using any other variable value.
 * If you have to resort to that, then you want a classic useDependent, with more than
 * one dependency instead.
 */
export function usePipe<A>(a: A): A;
export function usePipe<A, B>(a: A, ab: (a: A) => B): B;
export function usePipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function usePipe<A, B, C, D>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): D;
export function usePipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E
): E;
export function usePipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F
): F;
export function usePipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G
): G;
export function usePipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H
): H;
export function usePipe<A, B, C, D, E, F, G, H, I>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I
): I;
export function usePipe<A, B, C, D, E, F, G, H, I, J>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I,
  ij: (i: I) => J
): J;

export function usePipe<A, B, C, D, E, F, G, H, I, J>(
  a: A,
  ab?: (_: A) => B,
  bc?: (_: B) => C,
  cd?: (_: C) => D,
  de?: (_: D) => E,
  ef?: (_: E) => F,
  fg?: (_: F) => G,
  gh?: (_: G) => H,
  hi?: (_: H) => I,
  ij?: (_: I) => J
) {
  switch (arguments.length) {
    case 1:
      return a;
    case 2:
      return useDependent(() => ab!(a), [a]);
    case 3:
      return useDependent(() => bc!(ab!(a)), [a]);
    case 4:
      return useDependent(() => cd!(bc!(ab!(a))), [a]);
    case 5:
      return useDependent(() => de!(cd!(bc!(ab!(a)))), [a]);
    case 6:
      return useDependent(() => ef!(de!(cd!(bc!(ab!(a))))), [a]);
    case 7:
      return useDependent(() => fg!(ef!(de!(cd!(bc!(ab!(a)))))), [a]);
    case 8:
      return useDependent(() => gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))), [a]);
    case 9:
      return useDependent(() => hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))), [a]);
    case 10:
      return useDependent(
        () => ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))),
        [a]
      );
  }
  return;
}
