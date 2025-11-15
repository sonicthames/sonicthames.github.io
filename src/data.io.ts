import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as D from "io-ts/Decoder"
import { DateTime, Duration, Interval } from "luxon"
import type {
  HasDateTimeOption,
  HasIntervalOption,
  SoundBase,
} from "./domain/base"

type IsoValidatable = {
  readonly invalidReason: string | null
  readonly invalidExplanation?: string | null
}

const isoError = (label: string, input: string) => (value: IsoValidatable) =>
  D.error(
    input,
    `${label}: ${value.invalidReason ?? "invalid"}${
      value.invalidExplanation ? ` - ${value.invalidExplanation}` : ""
    }`,
  )

const ensureIsoValid =
  <A extends IsoValidatable>(label: string, input: string) =>
  (value: A): E.Either<D.DecodeError, A> =>
    value.invalidReason === null
      ? E.right(value)
      : E.left(isoError(label, input)(value))

const decodeIso = <A extends IsoValidatable>(
  label: string,
  parser: (value: string) => A,
): D.Decoder<unknown, A> =>
  pipe(
    D.string,
    D.parse((input) => pipe(parser(input), ensureIsoValid(label, input))),
  )

const decodeIsoOption = <A extends IsoValidatable>(
  label: string,
  parser: (value: string) => A,
): D.Decoder<unknown, O.Option<A>> =>
  pipe(
    D.nullable(D.string),
    D.parse((value) =>
      pipe(
        value,
        O.fromNullable,
        O.traverse(E.Applicative)((input) =>
          pipe(parser(input), ensureIsoValid(label, input)),
        ),
      ),
    ),
  )

const optional = <A>(
  decoder: D.Decoder<unknown, A>,
): D.Decoder<unknown, O.Option<A>> =>
  pipe(D.nullable(decoder), D.map(O.fromNullable))

const readonlyArray = <A>(decoder: D.Decoder<unknown, A>) =>
  pipe(D.array(decoder), D.readonly)

const readonlyStruct = <A>(decoder: D.Decoder<unknown, A>) =>
  pipe(decoder, D.readonly)

export const D_Category = D.union(
  D.literal("Listen"),
  D.literal("See"),
  D.literal("Feel"),
)

const D_Coordinates = readonlyStruct(
  D.struct({
    lat: D.number,
    lng: D.number,
  }),
)

const D_SoundBase: D.Decoder<unknown, SoundBase> = readonlyStruct(
  D.struct({
    title: D.string,
    description: readonlyArray(D.string),
    marker: D.string,
    category: D_Category,
    playOnProximity: D.boolean,
    duration: decodeIso("Duration.fromISO", Duration.fromISO),
    location: optional(D.string),
    access: optional(D.string),
    coordinates: D_Coordinates,
    videoSrc: D.string,
    thumbnailSrc: optional(D.string),
  }),
)

const D_DateTime: D.Decoder<unknown, HasDateTimeOption> = D.struct({
  dateTime: decodeIsoOption("DateTime.fromISO", DateTime.fromISO),
})

const D_Interval: D.Decoder<unknown, HasIntervalOption> = D.struct({
  interval: decodeIsoOption("Interval.fromISO", Interval.fromISO),
})

export const D_Sound = pipe(
  D_SoundBase,
  D.intersect(D.union(D_DateTime, D_Interval)),
)

export const D_Data = D.readonly(D.array(D.readonly(D_Sound)))
