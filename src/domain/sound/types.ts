import type * as O from "fp-ts/Option"
import type { DateTime, Duration, Interval } from "luxon"

// export type Category =
//   | "Soundscapes"
//   | "Sound Walks"
//   | "Binaural Cycling"
//   | "Sonic Sculptures";

// export type Microphone =
//   | "binaural"
//   | "hydrophone"
//   | "shotgun"
//   | "contact"
//   | "mobile_phone"
//   | "stereo_xy";

// export const micDescriptions: Record<Microphone, string> = {
//   binaural: "",
//   hydrophone: "",
//   shotgun: "",
//   contact: "",
//   mobile_phone: "",
//   stereo_xy: "",
// };

// export interface Sound {
//   position: { lat: number; lng: number };
//   title: string;
//   // REVIEW: Could have multiple types
//   videoSrc: string;
//   videoType?: string;
//   description: string | ReadonlyArray<string>;
//   category: Category;
//   microphones?: Partial<
//     Record<
//       Microphone,
//       | false
//       | true
//       | {
//           enabled?: boolean;
//           subcategories?: string | ReadonlyArray<string>;
//         }
//     >
//   >;
//   thumbnailSrc: string;
//   date: Date; // Date;
//   price: number; // Should be money
//   format: string;
//   length: number;
// }
export type Category = "Listen" | "See" | "Feel"

export interface Coordinate {
  readonly lng: number
  readonly lat: number
}

export interface SoundBase {
  readonly title: string
  readonly description: readonly string[]
  readonly marker: string
  readonly category: Category
  readonly playOnProximity: boolean
  readonly duration: Duration
  readonly location: O.Option<string>
  readonly access: O.Option<string>
  readonly coordinate: Coordinate
  readonly videoSrc: string
  readonly thumbnailSrc: O.Option<string>
}

export interface HasIntervalOption {
  readonly interval: O.Option<Interval>
}

export interface HasDateTimeOption {
  readonly dateTime: O.Option<DateTime>
}

export type Sound = SoundBase & (HasIntervalOption | HasDateTimeOption)

export const R_CategoryFlavor: Readonly<Record<Category, string | null>> = {
  Listen: "Sonic Points: recorded at a fixed position",
  See: "Sonic Scape: recorded from multiple directions",
  Feel: null,
}

export const R_CategoryRoute = {
  Listen: "listen",
  See: "see",
  Feel: "feel",
} as const

export function showDateTime(x: DateTime): string {
  return x.toFormat("dd LLL yyyy")
}

const formatDate = (value: DateTime | null) =>
  value !== null ? value.toFormat("dd LLL yyyy") : undefined
const formatTime = (value: DateTime | null) =>
  value !== null ? value.toFormat("HH:mm") : undefined
const joinParts = (...parts: ReadonlyArray<string | undefined>) =>
  parts.filter((part): part is string => Boolean(part?.trim())).join(" ")

const formatSameDay = (
  startDate: string | undefined,
  endDate: string | undefined,
  startTime: string | undefined,
  endTime: string | undefined,
): string => {
  const dateLabel = startDate ?? endDate
  const fromLabel = startTime ?? "?"
  const toLabel = endTime ?? "?"
  const prefix =
    dateLabel && dateLabel.trim().length > 0 ? `${dateLabel}, ` : ""
  return `${prefix}from ${fromLabel} to ${toLabel}`.trim()
}

export function showInterval(x: Interval): string {
  const { start, end } = x

  if (start === null && end === null) {
    return "N/A"
  }

  const startDate = formatDate(start)
  const startTime = formatTime(start)
  const endDate = formatDate(end)
  const endTime = formatTime(end)

  if (start !== null && end !== null) {
    if (start.hasSame(end, "day")) {
      return formatSameDay(startDate, endDate, startTime, endTime)
    }
    return `${joinParts(startDate, startTime)} - ${joinParts(endDate, endTime)}`.trim()
  }

  if (start !== null) {
    const label = joinParts(startDate, startTime)
    return label.length > 0 ? `from ${label}` : "N/A"
  }

  if (end !== null) {
    const label = joinParts(endDate, endTime)
    return label.length > 0 ? `until ${label}` : "N/A"
  }

  return "N/A"
}
