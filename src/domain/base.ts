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

export interface SoundBase {
  readonly title: string
  readonly description: readonly string[]
  readonly marker: string
  readonly category: Category
  readonly playOnProximity: boolean
  readonly duration: Duration
  readonly location: O.Option<string>
  readonly access: O.Option<string>
  readonly coordinates: {
    readonly lat: number
    readonly lng: number
  }
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

export const R_CategoryFlavor: Readonly<Record<Category, string>> = {
  Listen: "Sonic Points Fixed position",
  See: "Sonic Scape Multi direction",
  Feel: "PLACEHOLDER",
}

export const R_CategoryRoute = {
  Listen: "listen",
  See: "see",
  Feel: "feel",
} as const

export function showDateTime(x: DateTime): string {
  return x.toFormat("dd LLL yyyy")
}

export function showInterval(x: Interval): string {
  const { start, end } = x as unknown as {
    readonly start: DateTime | null
    readonly end: DateTime | null
  }

  if (start == null && end == null) {
    return "N/A"
  }

  const formatDate = (value: DateTime | null) =>
    value != null ? value.toFormat("dd LLL yyyy") : undefined
  const formatTime = (value: DateTime | null) =>
    value != null ? value.toFormat("HH:mm") : undefined
  const startDate = formatDate(start)
  const startTime = formatTime(start)
  const endDate = formatDate(end)
  const endTime = formatTime(end)
  const joinParts = (...parts: ReadonlyArray<string | undefined>) =>
    parts.filter((part): part is string => Boolean(part?.trim())).join(" ")

  if (start != null && end != null) {
    if (start.hasSame(end, "day")) {
      const dateLabel = startDate ?? endDate
      const fromLabel = startTime ?? "?"
      const toLabel = endTime ?? "?"
      const prefix =
        dateLabel && dateLabel.trim().length > 0 ? `${dateLabel}, ` : ""
      return `${prefix}from ${fromLabel} to ${toLabel}`.trim()
    }
    return `${joinParts(startDate, startTime)} - ${joinParts(endDate, endTime)}`.trim()
  }

  if (start != null) {
    const label = joinParts(startDate, startTime)
    return label.length > 0 ? `from ${label}` : "N/A"
  }

  if (end != null) {
    const label = joinParts(endDate, endTime)
    return label.length > 0 ? `until ${label}` : "N/A"
  }

  return "N/A"
}
