import * as RX from "rxjs/operators"

/**
 * ** Use only for debugging
 *
 * RxJs operator only to be used for logging with debugging purposes
 * @param {A} s Message
 * @param {RX.Observable} $ Observable stream
 */
export const tapLog = <A>(s: string) =>
  RX.tap<A>((value) => {
    console.log(s, value)
    return value
  })
