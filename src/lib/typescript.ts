/* eslint-disable @typescript-eslint/no-explicit-any */
export type Key = keyof any;

export type JoinTuple<
  S extends string,
  KS extends readonly string[]
> = KS extends readonly []
  ? ""
  : KS extends readonly [infer K]
  ? K extends string
    ? K
    : never
  : KS extends readonly [infer K, ...infer RS]
  ? K extends string
    ? RS extends readonly string[]
      ? `${K}${S}${JoinTuple<S, RS>}`
      : never
    : never
  : never;

export function joinTuple<S extends string>(separator: S) {
  return function <KS extends readonly string[]>(
    ...fragments: KS
  ): JoinTuple<S, KS> {
    return fragments.join(separator) as unknown as any;
  };
}
