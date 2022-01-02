/* eslint-disable @typescript-eslint/no-explicit-any */
export type Key = keyof any;

export type EmptyObject = Readonly<Record<string, unknown>>;

export type PathTree<T> = {
  readonly [P in keyof T]-?: T[P] extends object
    ? readonly [P] | readonly [P, ...Path<T[P]>]
    : readonly [P];
};

export type Path<T> = PathTree<T>[keyof PathTree<T>];

export type LeafPathTree<T> = {
  readonly [P in keyof T]-?: T[P] extends object
    ? readonly [P, ...LeafPath<T[P]>]
    : readonly [P];
};
export type LeafPath<T> = LeafPathTree<T>[keyof LeafPathTree<T>];

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

/**
 * @param  {Key} key Key expected in the object
 * @param  {T} obj Object that should contain the expected key
 * @returns {boolean} whether key is a keyof obj
 */
export function isKeyOf<T>(key: Key, obj: T): key is keyof T {
  return key in obj;
}
