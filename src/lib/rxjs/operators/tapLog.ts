import * as RX from "rxjs/operators";

/**
 * RxJs operator only to be used for logging with debugging purposes
 * @param {A} s Message
 * @param {RX.Observable} $ Observable stream
 */
export const tapLog = <A>(s: string) =>
  RX.tap<A>((x) => (console.log(s, x), x));
