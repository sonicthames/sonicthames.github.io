import * as O from "fp-ts/Option";
import type { DateTime, Duration, Interval } from "luxon";

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
export type Category = "Listen" | "See" | "Feel";

export interface SoundBase {
  readonly title: string;
  readonly description: readonly string[];
  readonly marker: string;
  readonly category: Category;
  readonly duration: Duration;
  readonly location: O.Option<string>;
  readonly access: O.Option<string>;
  readonly coordinates: {
    readonly lat: number;
    readonly lng: number;
  };
  readonly videoSrc: string;
  readonly thumbnailSrc: O.Option<string>;
}

export interface HasIntervalOption {
  readonly interval: O.Option<Interval>;
}

export interface HasDateTimeOption {
  readonly dateTime: O.Option<DateTime>;
}

export type Sound = SoundBase & (HasIntervalOption | HasDateTimeOption);

export const R_CategoryFlavor: Readonly<Record<Category, string>> = {
  Listen: "Sonic Points Fixed position",
  See: "Sonic Scape Multi direction",
  Feel: "PLACEHOLDER",
};

export const R_CategoryRoute = {
  Listen: "listen",
  See: "see",
  Feel: "feel",
} as const;

export function showDateTime(x: DateTime): string {
  return x.toFormat("dd LLL yyyy");
}

export function showInterval(x: Interval): string {
  const startDate = x.start.toFormat("dd LLL yyyy");
  const startTime = x.start.toFormat("HH:mm");
  const endTime = x.end.toFormat("HH:mm");
  return `${startDate} ${startTime} - ${endTime}`;
}
