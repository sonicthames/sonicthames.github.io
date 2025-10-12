import { flow } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RX from "rxjs/operators";

/**
 * RxJs operator with filtering and mapping functionality ala fp-ts' `filterMap`
 * @param f Tranform function
 * @param $ Observable stream
 */
export const filterMap = <A, B>(f: (_: A) => O.Option<B>) =>
  flow(
    RX.map(f),
    RX.filter<O.Option<B>, O.Some<B>>((o): o is O.Some<B> => O.isSome(o)),
    RX.map((o) => o.value)
  );
